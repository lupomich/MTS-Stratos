# Column State Persistence Bug — RESOLVED
**Prepared:** 2026-07-01 · **Resolved:** 2026-07-02
**Scope:** `bondvision-digital/src/components/BondTable.jsx`, `bondvision-digital/src/context/PreferencesContext.jsx`

---

## User-Reported Issue

Removing a column (CCY) by dragging it out of the grid → logout → login from another browser → the column reappeared. Non-deterministic (sometimes persisted, sometimes not).

---

## TRUE ROOT CAUSE (why it failed in real browsers but every automated test passed)

Two compounding bugs, neither of which the original tests could see because they
**reset `columnOrder` to `[]`** before running:

### Bug A — restore/save feedback loop (the reason the column "reappeared")

The column-restore effect in `BondTable.jsx` depended on `[preferences.columnOrder]`:

```js
useEffect(() => { ... applyColumnState(savedOrder) ... }, [preferences?.columnOrder])
```

Every user change calls `setColumnOrder(...)`, which **changes `preferences.columnOrder`**,
which **re-runs the restore effect**, which **re-applies the OLD saved layout** — undoing
the user's hide. Console showed the tell-tale loop: `Column state saved` ↔ `Column state
applied` alternating, with `ccy` stuck at `:V` (visible). The column reappeared because the
restore effect kept re-applying the stale layout on top of the user's change.

Why tests missed it: they seeded `columnOrder = []`, so the restore effect early-returned
and the loop never formed.

### Bug B — save side-effect inside a `setState` updater (the reason no PUT fired)

`updatePreference` enqueued the network save **inside** the `setPreferences(prev => {...})`
updater. In React 18 StrictMode (dev) the updater is double-invoked and its side effects can
be discarded → **the PUT never reached the network** (confirmed: user's Network tab showed
`Column state saved` in console but ZERO PUT requests).

### Bug C — default-state save overwrites the DB on RE-LOGIN (the real production failure)

Confirmed from the DB (`admin` account): after hiding CCY the user's DB row showed
`ccy hide:false` again — a **later** write with the column visible had overwritten the correct
`hide:true`. Root cause: this is a SPA; on logout→login the `BondTable`/`PreferencesProvider`
do **not** remount. On re-login the grid is briefly in its **default (all-visible)** state
while the saved layout is still loading; a grid event fires `saveCurrentColumnState`, which
saves that default (`ccy:V`) and overwrites the freshly-loaded `ccy:H`. The earlier
"restore once per mount" ref made it worse (it blocked the restore on the non-remounted
re-login, so the grid stayed on the default and got saved).

Why tests missed it: the two-browser test used **fresh browser contexts** (full remount), so
the non-remounting re-login path never ran.

---

## THE FIX

### Fix A — restore on every real LOAD, and BLOCK saves until restore completes
**Files: `bondvision-digital/src/context/PreferencesContext.jsx`, `bondvision-digital/src/components/BondTable.jsx`**
- `PreferencesContext` exposes `loadedAt` (a timestamp bumped ONLY when preferences are
  loaded from the backend, never on a local update).
- `BondTable`'s restore effect is keyed on `[loadedAt, loading, gridReady]` (NOT on
  `columnOrder`), so it re-applies the saved layout on every login — including a
  same-browser re-login where the component never remounts — and never loops on local saves.
- `restoreDoneRef` gate: set `false` at the start of each load, set `true` only after the
  restore has been applied. `saveCurrentColumnState` returns early while it is `false`, so the
  grid's transient default (all-visible) state can NEVER be saved over the loaded layout.
- `gridReady` state (set in `onGridReady`) ensures the restore runs once the grid API exists,
  even if preferences finish loading first.

### Fix B — move the save OUT of the state updater (PUT actually fires)
**File: `bondvision-digital/src/context/PreferencesContext.jsx`**
- `updatePreference` / `updatePreferences` now compute from `preferencesRef.current`, call
  `setPreferences(next)` and `enqueueSave(next, token)` as separate statements — no side
  effects inside the updater.

### Fix C — serialized, coalesced write queue (no race, nothing left pending)
**File: `bondvision-digital/src/context/PreferencesContext.jsx`**
- Replaced the 1000ms debounce with a write queue: `dirtyRef` holds the latest state,
  `drainSaveQueue()` writes them **in order** (last write wins) and coalesces bursts.
  Every change saves immediately; nothing sits on a timer to be lost on logout/tab-close.

### Fix D — flush before logout (belt-and-suspenders for in-flight saves)
**Files: `preferencesFlush.js` (bridge), `PreferencesContext.jsx`, `AuthContext.jsx`**
- `AuthContext.logout()` awaits `flushPendingPreferences()` (drains the queue with the
  still-valid token) BEFORE `axios.post('/auth/logout')` invalidates it.

Also retained: only `onDisplayedColumnsChanged` wired (not `onColumnMoved`); `setTimeout(0)`
before reading grid state; `applyingPreferencesRef` guard; `columnApi.*` → `api.*` (AG Grid v31).

---

## Verified (reproduces the REAL user condition)

`scripts/test-real-drag.mjs` now **seeds a full `columnOrder`** (all columns visible) before
running — reproducing a user who already has a saved layout (seeding `[]` hid the bug). It
then does a REAL mouse drag of CCY out, **logout immediately**, and logs in from a **second
separate browser context**:

```
[A] Column state applied   <- fires ONCE at login (no loop)
[A] drag CCY -> Column state saved: ...ccy:H...
[A][PUT] ccy = {hide:false}  then  [A][PUT] ccy = {hide:true}   (ordered, last wins)
[A] Save queue flushed before logout
[A] DB after logout: {hide:true}
[A2] SAME-browser re-login: ccy hide:true, ZERO spurious PUTs, DB {hide:true}
[B] (separate browser) ccy after login: hide:true   PASS
```

The decisive evidence was the **DB row for `admin`** showing `ccy hide:false` after the user
hid it — proving a later visible-state write overwrote it (Bug C), not a frontend-only issue.

---

## Why the earlier attempts failed (post-mortem)

Every automated test **seeded `columnOrder = []`**, which made the restore effect early-return
— so the save/restore feedback loop (Bug A) never formed and the tests passed while the real
UI (which always has a saved layout) failed. The fixes were validated against a test blind to
the actual precondition.

**Lessons (encoded in `.github/agents/UIPrototyper.agent.md` -> Debugging Discipline):**
- Reproduce the ACTUAL user *state*, not just the gesture — seed the same preconditions the
  real user has (here: a non-empty saved layout). An empty-state test is a different scenario.
- Gather ground-truth from the real browser (Console + Network with **Preserve log ON**)
  BEFORE theorizing. The decisive clue was the user's console: `Column state saved` firing
  with `ccy:V` + `Column state applied` alternating + ZERO PUTs.
- Never put network/side-effects inside a React `setState` updater (StrictMode discards them).
- Effects that both READ and WRITE the same state must be guarded to run once, or they loop.

---

## Environment

- Frontend: `http://127.0.0.1:3002` (use 127.0.0.1, NOT localhost — on Windows+Docker `localhost` resolves IPv6 `::1` first and Docker may not bind it after a hard restart)
- Backend: `http://127.0.0.1:3003/api`
- Test user: `col-test / ColTest123!`
- Real-drag test: `cd bondvision-digital && node scripts/test-real-drag.mjs [--headless]`
- API test (fast regression): `node scripts/test-column-persistence.mjs --runs 3 --headless`
- Restart frontend cleanly (fixes port binding): `docker compose -f docker-compose.master.yml stop bondvision-digital; docker compose -f docker-compose.master.yml start bondvision-digital`
