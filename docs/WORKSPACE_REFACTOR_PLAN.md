# Workspace Refactor Plan (Multi-Workspace + Dockable Panels)

## Objective
Evolve the current single-layout UI into a multi-workspace environment with dockable panels, incremental delivery, and safe rollback points.

## Scope (agreed)
- Multi-workspace support (current layout becomes one saved workspace).
- Dockable panel architecture.
- New mock panels in left menu:
  - `BLOTTER` (mock, DATA-like structure, empty grid)
  - `ALERTS` (mock, DATA-like structure, empty grid)
- Panel header actions:
  - Full Screen / Close Full Screen
  - Close (`X`)
- Workspace management UI:
  - Select workspace
  - Save as new workspace
- Blank workspace authoring flow:
  - Drag & drop from left sidebar
  - Virtual 6-slot canvas (2 rows x 3 columns)
  - Partial occupancy allowed (not all slots required)

---

## Incremental Delivery Plan

### Step 1 — Baseline layout abstraction
Status: ☑ Done
Goal:
- Centralize panel open/close/fullscreen state in a single layout state.
- Keep current UX visually unchanged.
Verification:
- Existing TRADING / DATA / DEPTH behavior still works.
- No regressions in toggle/fullscreen logic.

### Step 2 — Workspace state model
Status: ☑ Done
Goal:
- Introduce workspace entities (`id`, `name`, `layout`, metadata).
- Set current layout as default workspace.
Verification:
- App can load and render from `activeWorkspace` state.

### Step 3 — Workspace selector UI
Status: ☑ Done
Goal:
- Add UI for workspace selection and “Save as new workspace”.
Verification:
- Can switch between at least two workspace definitions.

### Step 4 — Dockable panel shell
Status: ☑ Done
Goal:
- Build reusable panel shell with standard header actions:
  - Full screen toggle
  - Close (`X`)
Verification:
- Existing panels can render inside shell without style breakage.

### Step 5 — Mock BLOTTER panel
Status: ☑ Done
Goal:
- Add BLOTTER panel mock with:
  - Title bar
  - Empty grid showing `No Rows To Show`
Verification:
- BLOTTER can be opened/closed/fullscreen like other panels.

### Step 6 — Mock ALERTS panel
Status: ☑ Done
Goal:
- Add ALERTS panel mock with:
  - Title bar
  - Empty grid showing `No Rows To Show`
Verification:
- ALERTS can be opened/closed/fullscreen like other panels.

### Step 7 — 6-slot blank workspace + drag & drop
Status: ☑ Done
Goal:
- Implement blank canvas with 6 virtual slots (3 top, 3 bottom).
- Enable dragging panel icons from left sidebar into free slots.
Verification:
- Slots can remain empty.
- Drag/drop adds panel to targeted slot.

### Step 8 — Persist and load workspaces
Status: ☐ Not started
Goal:
- Persist workspace definitions and restore on reload.
- Initial implementation can be local persistence; backend persistence can follow.
Verification:
- Created workspace survives page refresh.

### Step 9 — Interaction polish and QA
Status: ☐ Not started
Goal:
- Hardening edge cases, UX polish, and regression checks.
Verification:
- Stable behavior with mixed panel states and repeated user actions.

---

## Progress Board
- [x] Step 1 — Baseline layout abstraction
- [x] Step 2 — Workspace state model
- [x] Step 3 — Workspace selector UI
- [x] Step 4 — Dockable panel shell
- [x] Step 5 — Mock BLOTTER panel
- [x] Step 6 — Mock ALERTS panel
- [x] Step 7 — 6-slot blank workspace + drag & drop
- [ ] Step 8 — Persist and load workspaces
- [ ] Step 9 — Interaction polish and QA

---

## Architecture Notes (to refine during implementation)
- Prefer normalized state:
  - `workspaces[]`
  - `activeWorkspaceId`
  - `panelsById`
  - `layoutSlots`
- Panel identity model:
  - `panelType` (`trading`, `data`, `depth`, `blotter`, `alerts`)
  - `instanceId`
- Progressive migration strategy:
  - Keep legacy layout behavior while introducing new engine.
  - Switch fully only when replacement path is verified.

---

## Decision Log
- 2026-03-04: Agreed to incremental refactor in multiple verifiable steps.
- 2026-03-04: BLOTTER and ALERTS to be introduced as mock DATA-like panels first.
- 2026-03-04: Blank workspace authoring via drag & drop into 6-slot virtual grid.

---

## Change Log
- 2026-03-04: Document created.
- 2026-03-04: Step 1 completed — centralized layout UI state in MainContent without UX changes.
- 2026-03-04: Step 2 completed — introduced default workspace model and bound active workspace layout to MainContent state.
- 2026-03-04: Step 3 completed — added workspace selector and “Save as New” controls in App toolbar.
- 2026-03-04: Step 4 completed — introduced reusable DockablePanelShell and integrated DATA panel with shell header/actions.
- 2026-03-04: Step 5 completed — added mock BLOTTER panel (empty grid), dockable actions, and sidebar toggle wiring.
- 2026-03-04: Step 6 completed — added mock ALERTS panel (empty grid), dockable actions, and sidebar toggle wiring.
- 2026-03-04: Step 7 completed — added blank workspace creation and 2x3 drag-and-drop slot canvas from sidebar panel icons.
- 2026-03-04: Working agreement — after every UI/code change, always run verification (error check + frontend restart + container Up status confirmation).

---

## Update Protocol (for next iterations)
At the end of each implementation step, update:
1. The step `Status` (Not started → In progress → Done)
2. The `Progress Board` checkbox
3. `Decision Log` for new agreed changes
4. `Change Log` with date and short summary
