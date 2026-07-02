# AG Grid Migration Handoff — v31 → v36
**Prepared:** 2026-07-01  
**Scope:** `bondvision-digital` frontend only  
**Current version:** `ag-grid-community@^31.0.0` / `ag-grid-react@^31.0.0`  
**Target version:** `ag-grid-community@^36.0.0` / `ag-grid-react@^36.0.0`  

---

## Context

The migration analysis was completed on 2026-07-01. This document is the executable handoff for the developer picking up the work.

The migration has **3 phases** that must be executed in order. Each phase has a verification step before proceeding to the next.

---

## Phase 1 — v31 → v32 (Breaking, Codemod-assisted)

### What changes in v32
- `columnApi` is removed — all methods moved to `api`
- `applySortModel` removed → replaced by `applyColumnState`
- `deltaRowDataMode` prop removed (behavior is now default when `getRowId` is set)
- `suppressHeaderFocus` prop removed
- Rich Select editor gains multi-select
- Bundle size reduced ~15%

### Step 1.1 — Install v32 and run official codemod

```powershell
cd bondvision-digital

# Upgrade packages
npm install ag-grid-community@^32.0.0 ag-grid-react@^32.0.0

# Run the official AG Grid codemod (covers columnApi, applySortModel, deltaRowDataMode)
npx @ag-grid-devtools/cli migrate --from 31 --to 32
```

> The codemod will modify files in-place. Review the git diff before committing.

### Step 1.2 — Manual fixes the codemod does NOT cover

#### File: `bondvision-digital/src/components/BondTable.jsx`

**Fix 1 — `CustomHeaderWithMenu.handleAction` — `autoSizeColumns` signature changed**

Line ~277: The codemod may leave this partially migrated. Verify:
```js
// BEFORE (v31)
columnApi.autoSizeColumns(allColumnIds)

// AFTER (v32) — codemod should produce this
api.autoSizeColumns(allColumnIds)
```

**Fix 2 — Remove `deltaRowDataMode` prop from `<AgGridReact>`**

Line ~797: If codemod does not remove it:
```jsx
// Remove this prop entirely — it's the default in v32+ when getRowId is set
deltaRowDataMode={true}   // DELETE THIS LINE
```

**Fix 3 — Remove or replace `suppressHeaderFocus`**

Line ~793:
```jsx
// DELETE this prop — it no longer exists in v32
suppressHeaderFocus={true}   // DELETE THIS LINE
```

#### File: `bondvision-digital/src/components/MainContent.jsx`

**Fix 4 — `applySortModel` removed (line ~1200)**

```js
// BEFORE (v31)
action: () => params.api.applySortModel([{ colId: params.column?.colId || '', sort: 'asc' }])

// AFTER (v32)
action: () => params.api.applyColumnState({ state: [{ colId: params.column?.colId || '', sort: 'asc' }], defaultState: { sort: null } })
```

Same pattern for `sort: 'desc'`.

### Step 1.3 — Verify Phase 1

```powershell
# Start dev server
npm run dev
```

Checklist:
- [ ] Bond table renders without console errors
- [ ] Column header `☰` menu opens with all items (filter, sort, pin, autosize, reset)
- [ ] Sort asc/desc works and persists on page refresh
- [ ] Pin left/right works
- [ ] Reset all columns works
- [ ] Filters apply and persist on page refresh
- [ ] Market Depth grids render (all 4 sub-grids: MTS Order Book, EBM, Composite, Dealer Pricing)
- [ ] Data table in bottom panel renders

---

## Phase 2 — v32 → v33 (Breaking, Theming migration required)

### What changes in v33
- **`ag-theme-alpine` CSS import is deprecated** — must migrate to new Theming API
- Bundle size reduced 20-40% via modularization
- Context menu supports async items
- Custom header inner content supported

### Step 2.1 — Upgrade to v33

```powershell
npm install ag-grid-community@^33.0.0 ag-grid-react@^33.0.0

# Run codemod for v33
npx @ag-grid-devtools/cli migrate --from 32 --to 33
```

### Step 2.2 — Theming migration (MANUAL — ~1 day of work)

This is the highest-effort step. The app currently uses:
- `import 'ag-grid-community/styles/ag-grid.css'` (base styles)
- `import 'ag-grid-community/styles/ag-theme-alpine.css'` (theme)
- CSS class `ag-theme-alpine-dark` applied inline in JSX

In v33 these CSS imports still work but are deprecated (removed in v34+). The new way:

```jsx
// BEFORE — remove from all 3 files:
// BondTable.jsx, MarketDepth.jsx, MainContent.jsx
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

// AFTER — single import in main entry (src/main.jsx or App.jsx):
import 'ag-grid-community/styles/ag-grid.css'
// Then use themeQuartz or themeAlpine from the Theming API
```

**Recommended approach** — use `themeAlpine` as base with dark parameters:

```jsx
// In a new file: src/config/agGridTheme.js
import { themeAlpine } from 'ag-grid-community'

export const mtsTheme = themeAlpine.withParams({
  backgroundColor: '#0d1117',          // match current --bg-secondary
  foregroundColor: '#e6edf3',          // match current --text-primary
  headerBackgroundColor: '#161b22',    // match current --bg-tertiary
  headerTextColor: '#8b949e',
  rowHoverColor: 'rgba(77,184,184,0.1)',
  selectedRowBackgroundColor: 'rgba(77,184,184,0.2)',
  borderColor: '#30363d',
  oddRowBackgroundColor: 'transparent',
  fontSize: 12,
  rowHeight: 28,
  headerHeight: 32,
})
```

Then replace `className="ag-theme-alpine-dark ..."` with the `theme` prop:
```jsx
// BEFORE
<div className="ag-theme-alpine-dark bond-grid">
  <AgGridReact ... />
</div>

// AFTER — no wrapper div needed
<AgGridReact theme={mtsTheme} ... />
```

> **Note:** The exact color values to match must be verified against `BondTable.css`, `MarketDepth.css`, and `MainContent.css`. The existing CSS custom properties (`--color-primary`, `--bg-secondary`, etc.) should be used as reference.

**Files to modify:**
- `bondvision-digital/src/components/BondTable.jsx` — remove CSS imports, update grid wrapper
- `bondvision-digital/src/components/MarketDepth.jsx` — remove CSS imports, update 4× grid wrappers
- `bondvision-digital/src/components/MainContent.jsx` — remove CSS imports, update grid wrapper
- `bondvision-digital/src/config/agGridTheme.js` — CREATE THIS FILE with theme definition

### Step 2.3 — Verify Phase 2

Checklist:
- [ ] All grids render with correct dark theme (no white flash)
- [ ] Bond table bid/ask cell colors (red/green) are preserved
- [ ] Row hover highlight visible
- [ ] Selected row persistent highlight visible (`bond-row-selected-persistent`)
- [ ] Column search highlight (`bond-column-header-match`) visible
- [ ] MarketDepth all 4 sub-grids styled consistently
- [ ] No console warnings about deprecated CSS imports

---

## Phase 3 — v33 → v36 (Non-breaking, feature opt-in)

### Step 3.1 — Upgrade to v36

```powershell
npm install ag-grid-community@^36.0.0 ag-grid-react@^36.0.0

# Run codemods for v34, v35, v36 in sequence
npx @ag-grid-devtools/cli migrate --from 33 --to 34
npx @ag-grid-devtools/cli migrate --from 34 --to 35
npx @ag-grid-devtools/cli migrate --from 35 --to 36
```

### Step 3.2 — Optional new features to evaluate

These are NOT required for migration but are relevant for MTS use cases:

| Feature | Config to enable | Use case |
|---|---|---|
| **Formulas** (v35) | `allowFormula: true` on column + `getRowId` | User-defined yield/spread calculations |
| **Calculated Columns** (v36) | `calculatedColumns={true}` on grid | Pre-defined spread = Ask - Bid columns |
| **Show Values As** (v36) | `enableShowValuesAs: true` on column | % of total for size/nominal columns |
| **Cell Editor Validation** (v34) | Built-in with `cellDataType` | Validate price inputs in editable cells |
| **Batch Cell Editing** (v34) | `editType: 'fullRow'` | Edit multiple fields before committing |
| **Column Selection** (v35) | `enableColumnSelection: true` | Select entire price column for analysis |
| **Absolute Sorting** (v35) | `sort: { direction: 'asc', type: 'absolute' }` | Sort yield changes by magnitude |

### Step 3.3 — Verify Phase 3

Checklist:
- [ ] All Phase 1 + Phase 2 checks still pass
- [ ] No new console errors
- [ ] Bundle size measured before/after (should be 20-40% smaller)
- [ ] Run E2E suite: `powershell -NoProfile -ExecutionPolicy Bypass -File .\run-live.ps1`
- [ ] All E2E tests pass (T01–T47)

---

## Files Modified (all phases)

| File | Phase | Type of change |
|---|---|---|
| `bondvision-digital/package.json` | 1 | Version bump |
| `bondvision-digital/src/components/BondTable.jsx` | 1+2 | `columnApi` → `api`, remove deprecated props, theming |
| `bondvision-digital/src/components/MarketDepth.jsx` | 2 | Remove CSS imports, theming |
| `bondvision-digital/src/components/MainContent.jsx` | 1+2 | `applySortModel` → `applyColumnState`, theming |
| `bondvision-digital/src/config/agGridTheme.js` | 2 | CREATE — theme definition |

---

## Known Risks

| Risk | Mitigation |
|---|---|
| `CustomHeaderWithMenu` is a vanilla JS class — codemod may miss some `columnApi` usages | Manually grep `columnApi` in BondTable.jsx after codemod and fix remaining |
| `mainMenuItems: ['columnChooser']` in MarketDepth is Enterprise-only — may silently fail in v32+ | Remove from defaultColDef or replace with custom implementation |
| Theme colors may not match exactly | Keep a browser screenshot of current UI before starting; compare after Phase 2 |
| `ag-custom-menu-popup` CSS in `BondTable.css` may need z-index adjustments with new theming | Test menu visibility after Phase 2 |

---

## Quick Reference — Codemod Commands

```powershell
# All in sequence from bondvision-digital/
npx @ag-grid-devtools/cli migrate --from 31 --to 32
npx @ag-grid-devtools/cli migrate --from 32 --to 33
npx @ag-grid-devtools/cli migrate --from 33 --to 34
npx @ag-grid-devtools/cli migrate --from 34 --to 35
npx @ag-grid-devtools/cli migrate --from 35 --to 36
```

## Quick Reference — Verify app is running after each phase

```powershell
# From MTS-Stratos root
docker restart -t 0 mts-stratos-bondvision-digital
docker ps --filter "name=mts-stratos-bondvision-digital" --format "table {{.Names}}\t{{.Status}}"
```

---

## AG Grid Official Migration Guides

- v32: https://www.ag-grid.com/react-data-grid/upgrading-to-ag-grid-32/
- v33: https://www.ag-grid.com/react-data-grid/upgrading-to-ag-grid-33/
- v34: https://www.ag-grid.com/react-data-grid/upgrading-to-ag-grid-34/
- v35: https://www.ag-grid.com/data-grid/upgrading-to-ag-grid-35/
- v36: https://ag-grid.com/data-grid/upgrading-to-ag-grid-36/
