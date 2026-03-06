/**
 * DockableWorkspaceGrid.jsx
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Core layout engine of the MTS Stratos Dockable Workspace Framework.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Renders a 2-row × 3-column CSS-grid of "slots" that hold financial panels.
 * The component is intentionally free of application-specific business logic so
 * it can be reused across any financial application that needs resizable,
 * dockable panels with drag-and-drop placement.
 *
 * ── Grid coordinate system ───────────────────────────────────────────────────
 *
 *   slotIndex →  0  |  1  |  2   ← row 0 (top)
 *                3  |  4  |  5   ← row 1 (bottom)
 *
 * CSS grid tracks (gridTemplateColumns / gridTemplateRows):
 *   col: [content-0] [vHandle-0] [content-1] [vHandle-1] [content-2]
 *   row: [content-0] [hHandle]   [content-1]
 *
 * ── Slot states ──────────────────────────────────────────────────────────────
 *
 *   Occupied  – panel key is non-null; wrapped in DockablePanelShell.
 *   Empty     – visible as a drop zone in edit mode; absent in view mode.
 *   Collapsed – removed from the DOM; neighbouring panels span into the space.
 *
 * ── Layout features ──────────────────────────────────────────────────────────
 *
 *   Vertical resize    – drag the vertical handle dividers to resize columns.
 *   Horizontal resize  – drag the horizontal handle to resize row heights.
 *   Vertical span      – when a slot's column-partner is collapsed with the
 *                        vSpan flag, the occupying panel fills both rows
 *                        (CSS gridRow: 1 / 4).
 *   Horizontal span    – a panel extends rightward into consecutively-collapsed
 *                        siblings in the same row (no vSpan flag on those).
 *   Full-screen        – one slot covers the entire grid (gridColumn/Row: 1/6).
 *
 * ── Hidden-slot encoding (stored in the hiddenSlots prop) ────────────────────
 *
 *   Values 0–5   → slot is collapsed; may be horizontally spanned by a sibling.
 *   Values 6–11  → slot was hidden while its column-partner already had a panel
 *                  (vertical-span intent: storedValue = slotIndex + 6).
 *   Decode:
 *     slotIndex = storedValue % 6
 *     isVSpan   = storedValue >= 6   (see VSPAN_ENCODING_OFFSET in workspaceConstants)
 *
 * ── Controlled-component design ──────────────────────────────────────────────
 *
 * `colWidths` and `rowHeights` are **controlled** — the parent owns and persists
 * them. Live drag feedback is pushed up via `onResize`; the definitive end-of-
 * drag values are pushed via `onResizeCommit` which is the signal to persist.
 *
 * ── Props ─────────────────────────────────────────────────────────────────────
 *
 * @param {(string|null)[]} slots               6-element array of panel keys.
 * @param {number[]}        hiddenSlots         Encoded hidden-slot indices.
 * @param {boolean}         isEditMode          Show drop zones when true.
 * @param {number[]}        colWidths           Controlled [fr, fr, fr] column proportions.
 * @param {number[]}        rowHeights          Controlled [fr, fr] row proportions.
 * @param {Function}        onResize            (colWidths, rowHeights) → void.
 *                                              Called on every pointer-move during drag.
 *                                              Parent updates state for live visual feedback.
 * @param {Function}        onResizeCommit      (colWidths, rowHeights) → void.
 *                                              Called once at drag end. Parent should persist.
 * @param {Function}        onSlotChange        (slotIndex, panelKey|null) → void.
 * @param {Function}        onHiddenSlotsChange (nextArr | updaterFn) → void.
 * @param {Function}        renderPanelContent  (panelKey) → ReactNode.
 *                                              Business logic stays in the parent.
 * @param {Function}        getPanelTitle       (panelKey) → string.
 */

import React, { useCallback, useRef, useState } from 'react'
import DockablePanelShell from './DockablePanelShell'
import { useLanguage } from '../context/LanguageContext'
import {
  BLANK_WORKSPACE_SLOT_COUNT,
  BLANK_WORKSPACE_PANEL_KEYS,
  SIDEBAR_PANEL_DRAG_MIME,
  VSPAN_ENCODING_OFFSET,
} from '../constants/workspaceConstants'

// ── Component ─────────────────────────────────────────────────────────────────

const DockableWorkspaceGrid = ({
  slots,
  hiddenSlots,
  isEditMode,
  colWidths,
  rowHeights,
  rightColumnRowHeights,
  onResize,
  onResizeCommit,
  onRightColumnResize,
  onRightColumnResizeCommit,
  onSlotChange,
  onHiddenSlotsChange,
  renderPanelContent,
  getPanelTitle,
}) => {
  const { t } = useLanguage()

  // ── Internal UI state ───────────────────────────────────────────────────────

  /** Index of the slot currently in full-screen mode, or null when none active. */
  const [fullScreenSlotIndex, setFullScreenSlotIndex] = useState(null)

  /** Slot index highlighted as the active drag-over drop target, or null. */
  const [dragOverSlotIndex, setDragOverSlotIndex] = useState(null)

  /**
   * True during an active grid-resize drag.
   * Used to set `userSelect: none` so text is not accidentally selected while
   * the user moves the resize handle.
   */
  const [isGridDragging, setIsGridDragging] = useState(false)

  // ── Refs ────────────────────────────────────────────────────────────────────

  /** Bound to the grid container element — used to measure px dimensions at drag start. */
  const gridContainerRef = useRef(null)

  /**
   * Stores the drag state for an active grid-resize operation (null when idle).
   *
   * Stored in a ref — not state — so mousemove handlers always read the latest
   * value without stale closures and without triggering React re-renders on
   * every pointer event.
   *
   * @typedef {Object} GridDragState
  * @property {'col'|'row'|'row-right'} type Dimension being resized.
   * @property {number}      index            Handle index (0 = left, 1 = right for vHandles; 0 for hHandle).
   * @property {number}      startX           clientX at drag start.
   * @property {number}      startY           clientY at drag start.
   * @property {number}      containerWidth   Grid container width in px at drag start.
   * @property {number}      containerHeight  Grid container height in px at drag start.
   * @property {number[]}    startColWidths   Column proportions at drag start.
   * @property {number[]}    startRowHeights  Row proportions at drag start.
   * @property {number[]}    [startRightRowHeights] Right-column row proportions at drag start.
   * @property {number[]}    [lastColWidths]  Most recent column proportions during drag.
   * @property {number[]}    [lastRowHeights] Most recent row proportions during drag.
   * @property {number[]}    [lastRightRowHeights] Most recent right-column row proportions during drag.
   */
  const gridDragRef = useRef(/** @type {GridDragState|null} */ (null))

  const normalizedRightColumnRowHeights =
    Array.isArray(rightColumnRowHeights)
    && rightColumnRowHeights.length === 2
    && rightColumnRowHeights.every((value) => Number.isFinite(value) && value > 0)
      ? rightColumnRowHeights
      : [1, 1]

  // ── Input normalisation ─────────────────────────────────────────────────────

  /**
   * Guarantee exactly BLANK_WORKSPACE_SLOT_COUNT entries so every calculation
   * below can safely index `S` by slot number without bounds checks.
   */
  const S = Array.from(
    { length: BLANK_WORKSPACE_SLOT_COUNT },
    (_, i) => slots?.[i] ?? null,
  )

  // ── Layout computation ──────────────────────────────────────────────────────

  /**
   * Set of decoded indices for all effectively-hidden, empty slots.
   * A slot is collapsed only when it is BOTH listed in `hiddenSlots` AND
   * currently empty — occupied slots always render regardless of encoding.
   *
   * Outside edit mode every empty slot is treated as collapsed so the CSS grid
   * template collapses its column/row to 0px and no empty space is visible.
   */
  const collapsedSet = new Set(
    isEditMode
      ? // Edit mode: only explicitly hidden slots collapse.
        (hiddenSlots || [])
          .map((v) => v % BLANK_WORKSPACE_SLOT_COUNT)
          .filter((i) => i < BLANK_WORKSPACE_SLOT_COUNT && !S[i])
      : // Normal mode: ALL empty slots are treated as collapsed.
        [0, 1, 2, 3, 4, 5].filter((i) => !S[i]),
  )

  /**
   * Subset of `collapsedSet` where the encoded value carries the vertical-span
   * intent flag (storedValue >= VSPAN_ENCODING_OFFSET).
   * Only these slots trigger the partner's vertical span expansion; plain
   * collapsed slots are only horizontal-span candidates.
   */
  const vSpanSet = new Set(
    (hiddenSlots || [])
      .filter((v) => v >= VSPAN_ENCODING_OFFSET)
      .map((v) => v % BLANK_WORKSPACE_SLOT_COUNT)
      .filter((i) => i < BLANK_WORKSPACE_SLOT_COUNT && !S[i]),
  )

  /**
   * `isColDead[c]`: true when BOTH rows of column `c` are empty-and-collapsed.
   * Dead columns contribute `0px` to the CSS grid template and are invisible.
   */
  const isColDead = [0, 1, 2].map(
    (c) => !S[c] && !S[c + 3] && collapsedSet.has(c) && collapsedSet.has(c + 3),
  )

  /**
   * `isRowCollapsed[r]`: true when every slot in row `r` is empty-and-collapsed.
   * A fully collapsed row contributes `0px` to the CSS row template.
   */
  const isRowCollapsed = [0, 1].map((r) =>
    [0, 1, 2].every((c) => {
      const si = r * 3 + c
      return !S[si] && collapsedSet.has(si)
    }),
  )

  /**
   * Returns true when the panel at `slotIndex` should vertically span both rows
   * (CSS gridRow: 1 / 4).
   *
   * Conditions (all must hold):
   *   1. The slot is occupied.
   *   2. Its column is alive (not dead).
   *   3. Its column-partner is in `vSpanSet` (hidden with vertical-span intent).
   *
   * Note: vertical span is mutually exclusive with horizontal span (a panel
   * expanding vertically cannot also expand horizontally).
   */
  const spansRowsOf = (slotIndex) => {
    if (!S[slotIndex]) return false
    const col = slotIndex % 3
    if (isColDead[col]) return false
    const partnerIndex = slotIndex < 3 ? slotIndex + 3 : slotIndex - 3
    return collapsedSet.has(partnerIndex) && vSpanSet.has(partnerIndex)
  }

  /**
   * Returns a CSS `gridColumn` span string (e.g. `"1 / 4"`) when the panel
   * should extend rightward into consecutive collapsed siblings, or null.
   *
   * Rules:
   *   - Only occupied, non-vSpan panels can trigger a horizontal span.
   *   - Span grows rightward while the next sibling is (a) empty, (b) collapsed,
   *     and (c) NOT in `vSpanSet` — those are "owned" by their column-partner's
   *     vertical expansion and must not be absorbed horizontally.
   */
  const horizontalSpanOf = (slotIndex) => {
    if (!S[slotIndex]) return null
    if (spansRowsOf(slotIndex)) return null // Vertical span wins; no horizontal span.
    const col = slotIndex % 3
    const row = Math.floor(slotIndex / 3)
    let rightEnd = col
    for (let c = col + 1; c <= 2; c++) {
      const si = row * 3 + c
      if (!S[si] && collapsedSet.has(si) && !vSpanSet.has(si)) {
        rightEnd = c
      } else {
        break
      }
    }
    if (rightEnd === col) return null
    // CSS column tracks: content col c maps to gridCol index (c * 2 + 1).
    return `${col * 2 + 1} / ${rightEnd * 2 + 2}`
  }

  // ── Vertical-handle visibility ──────────────────────────────────────────────

  /**
   * `coveredInRow[vHandleIdx][row]`: true when a horizontal span from a panel
   * in row `row` crosses the track of vertical handle `vHandleIdx`.
   * When both rows are covered the handle has no visible portion → hide it.
   */
  const coveredInRow = [0, 1].map(() => [false, false])
  for (let si = 0; si < BLANK_WORKSPACE_SLOT_COUNT; si++) {
    if (!S[si] || spansRowsOf(si)) continue
    const col = si % 3
    const row = Math.floor(si / 3)
    for (let c = col + 1; c <= 2; c++) {
      const rsi = row * 3 + c
      if (!S[rsi] && collapsedSet.has(rsi) && !vSpanSet.has(rsi)) {
        coveredInRow[c - 1][row] = true
      } else {
        break
      }
    }
  }

  /**
   * `vHandleProps[vi]`: the CSS `gridRow` string for vertical handle `vi`,
   * or null if the handle should be hidden entirely.
   *
   *   null    → fully covered by horizontal spans in both rows; do not render.
   *   '1'     → only top row needs the handle.
   *   '3'     → only bottom row needs the handle.
   *   '1 / 4' → both rows visible; render at full grid height.
   */
  const vHandleProps = [0, 1].map((vi) => {
    const [topCovered, botCovered] = coveredInRow[vi]
    if (topCovered && botCovered) return null
    if (topCovered) return '3'
    if (botCovered) return '1'
    return '1 / 4'
  })

  // ── Horizontal-handle segment calculation ───────────────────────────────────

  /**
   * Builds contiguous CSS `gridColumn` span strings for the row-resize bar at
   * CSS gridRow:2. The bar is split into segments to avoid rendering across
   * full-height (vSpan) panels — a line crossing through them would be wrong.
   *
   * Algorithm:
   *   1. Mark each content track (gridCol 1/3/5) as needed when the column is
   *      alive and neither of its slots fills both rows via vSpan.
   *   2. Mark vHandle tracks (gridCol 2/4) as needed only when both flanking
   *      content tracks are needed, keeping the bar visually connected.
   *   3. Merge consecutive needed tracks into single gridColumn span strings.
   */
  const hasFullScreen = fullScreenSlotIndex !== null
  const hasIndependentRightColumnResize =
    !hasFullScreen
    && Boolean(S[2])
    && Boolean(S[5])
    && !collapsedSet.has(2)
    && !collapsedSet.has(5)
    && !spansRowsOf(2)
    && !spansRowsOf(5)
    && !horizontalSpanOf(2)
    && !horizontalSpanOf(5)

  const _hNeed = new Array(5).fill(false)
  for (let c = 0; c < 3; c++) {
    if (!isColDead[c] && !spansRowsOf(c) && !spansRowsOf(c + 3)) {
      _hNeed[c * 2] = true // content tracks: c=0→idx0, c=1→idx2, c=2→idx4
    }
  }
  if (hasIndependentRightColumnResize) {
    // Keep right-column splitter independent from the global row splitter.
    _hNeed[4] = false
  }
  if (_hNeed[0] && _hNeed[2]) _hNeed[1] = true // vHandle-0 track (gridCol 2)
  if (_hNeed[2] && _hNeed[4]) _hNeed[3] = true // vHandle-1 track (gridCol 4)
  const hHandleSegments = []
  let _hSeg = -1
  for (let tr = 0; tr <= 5; tr++) {
    const on = tr < 5 && _hNeed[tr]
    if (on && _hSeg === -1) {
      _hSeg = tr
    } else if (!on && _hSeg !== -1) {
      hHandleSegments.push(`${_hSeg + 1} / ${tr + 1}`)
      _hSeg = -1
    }
  }
  const needsHHandle = hHandleSegments.length > 0

  // ── CSS grid template strings ───────────────────────────────────────────────

  const colTemplate = [0, 1, 2].map((c) => (isColDead[c] ? '0px' : `${colWidths[c]}fr`))
  const vHandle0Track = isColDead[0] || isColDead[1] || vHandleProps[0] === null ? '0px' : '5px'
  const vHandle1Track = isColDead[1] || isColDead[2] || vHandleProps[1] === null ? '0px' : '5px'
  const rowTemplate = isRowCollapsed.map((collapsed, i) => (collapsed ? '0px' : `${rowHeights[i]}fr`))
  const hHandleTrack = needsHHandle ? '5px' : '0px'

  /**
   * `leftmostEmptyPerRow[r]`: slot index of the leftmost visible-and-empty slot
   * in row `r`. In edit mode only this slot shows as a drop zone per row,
   * keeping the UI tidy (one drop target at a time rather than a sparse spread).
   */
  const leftmostEmptyPerRow = [0, 1].map((r) =>
    [0, 1, 2].reduce((found, c) => {
      if (found !== null) return found
      const si = r * 3 + c
      return !S[si] && !collapsedSet.has(si) ? si : null
    }, null),
  )

  // ── Slot drag-and-drop handlers ─────────────────────────────────────────────

  /**
   * Handles a panel drop onto a slot.
   *
   * Routing logic:
   *   Occupied slot  → existing panel is replaced by the dropped one.
   *   Empty slot     → drop is only accepted when this slot is the leftmost
   *                    empty slot in its row; this prevents sparse layouts where
   *                    centre or right slots are filled before the left one.
   */
  const handleSlotDrop = useCallback(
    (slotIndex, event) => {
      if (!isEditMode) return
      event.preventDefault()
      setDragOverSlotIndex(null)

      const droppedKey =
        event.dataTransfer.getData(SIDEBAR_PANEL_DRAG_MIME) ||
        event.dataTransfer.getData('text/plain')
      if (!BLANK_WORKSPACE_PANEL_KEYS.has(droppedKey)) return

      // Prevent placing the same panel twice in the same workspace.
      if (S.some((k, i) => k === droppedKey && i !== slotIndex)) return

      const currentKey = S[slotIndex]
      if (!currentKey) {
        // Empty slot: validate it is the leftmost empty slot in its row.
        const row = Math.floor(slotIndex / 3)
        const rowStart = row * 3
        const hiddenSet = new Set(
          (hiddenSlots || [])
            .map((v) => v % BLANK_WORKSPACE_SLOT_COUNT)
            .filter((i) => i < BLANK_WORKSPACE_SLOT_COUNT && !S[i]),
        )
        const leftmost = [0, 1, 2].find((c) => {
          const si = rowStart + c
          return !S[si] && !hiddenSet.has(si)
        })
        if (leftmost === undefined || rowStart + leftmost !== slotIndex) return
      }

      onSlotChange?.(slotIndex, droppedKey)
      // Un-hide the slot if it was listed in hiddenSlots.
      onHiddenSlotsChange?.(
        (hiddenSlots || []).filter((v) => v % BLANK_WORKSPACE_SLOT_COUNT !== slotIndex),
      )
    },
    [S, hiddenSlots, onSlotChange, onHiddenSlotsChange, isEditMode],
  )

  /**
   * Highlights `slotIndex` as the active drop target while the drag passes
   * over it. `'copy'` drop effect signals an additive action to the OS.
   * Ignored when not in edit mode.
   */
  const handleSlotDragOver = useCallback((slotIndex, event) => {
    if (!isEditMode) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
    setDragOverSlotIndex(slotIndex)
  }, [isEditMode])

  /**
   * Clears the drop-target highlight when the pointer leaves a slot.
   * Uses the functional updater to avoid a race between rapid drag-leave
   * and drag-over events.
   */
  const handleSlotDragLeave = useCallback((slotIndex) => {
    setDragOverSlotIndex((prev) => (prev === slotIndex ? null : prev))
  }, [])

  /**
   * Removes the panel from a slot and cleans up its hiddenSlots entries.
   *
   * Side-effects on hiddenSlots:
   *   - All entries for this slot (regular and vSpan-encoded) are removed.
   *   - The column-partner's vSpan encoding is downgraded to regular hidden when
   *     it was exclusively caused by this slot being occupied — the partner's
   *     vertical-span intent is no longer valid once this panel is gone.
   */
  const handleSlotClear = useCallback(
    (slotIndex) => {
      onSlotChange?.(slotIndex, null)
      if (fullScreenSlotIndex === slotIndex) setFullScreenSlotIndex(null)
      // Use the prop directly (not a functional updater) — onHiddenSlotsChange
      // is wired to updateWorkspace which expects a plain array, not a function.
      const current = hiddenSlots || []
      const partnerIndex = slotIndex < 3 ? slotIndex + 3 : slotIndex - 3
      const partnerVSpanEncoded = partnerIndex + VSPAN_ENCODING_OFFSET
      onHiddenSlotsChange?.(
        current
          .filter((v) => v % BLANK_WORKSPACE_SLOT_COUNT !== slotIndex) // remove all refs to this slot
          .map((v) => (v === partnerVSpanEncoded ? partnerIndex : v))   // downgrade partner: vSpan → regular
      )
    },
    [fullScreenSlotIndex, hiddenSlots, onSlotChange, onHiddenSlotsChange],
  )

  /**
   * Collapses an empty slot so sibling panels can span into its freed space.
   *
   * Encoding:
   *   If the column-partner has a panel → encode as (slotIndex + VSPAN_ENCODING_OFFSET)
   *   to signal the partner should vertically span both rows.
   *   Otherwise → encode as a plain slotIndex (horizontal-span candidate).
   */
  const handleSlotCollapse = useCallback(
    (slotIndex) => {
      if (!onHiddenSlotsChange) return
      const current = hiddenSlots || []
      // Remove any stale entry before adding the updated encoding.
      const filtered = current.filter((v) => v % BLANK_WORKSPACE_SLOT_COUNT !== slotIndex)
      const partnerIndex = slotIndex < 3 ? slotIndex + 3 : slotIndex - 3
      const hasPartnerPanel = Boolean(S[partnerIndex])
      const encoded = hasPartnerPanel ? slotIndex + VSPAN_ENCODING_OFFSET : slotIndex
      onHiddenSlotsChange([...filtered, encoded])
    },
    [S, hiddenSlots, onHiddenSlotsChange],
  )

  /** Toggles full-screen mode for a slot (expands to cover the whole grid). */
  const toggleSlotFullScreen = useCallback((slotIndex) => {
    setFullScreenSlotIndex((prev) => (prev === slotIndex ? null : slotIndex))
  }, [])

  // ── Grid resize handlers ────────────────────────────────────────────────────

  /**
  * Begins a column ('col') or row ('row') resize drag.
   *
   * All drag-start state is captured synchronously in `gridDragRef` so
   * subsequent mousemove callbacks can compute delta-based proportions without
   * stale closures on `colWidths` or `rowHeights`.
   *
  * @param {'col'|'row'|'row-right'} type Dimension being resized.
   * @param {number}      index Handle index (0 = left vHandle, 1 = right vHandle; 0 for hHandle).
   * @param {MouseEvent}  e     The initiating mousedown event.
   */
  const handleGridResizeStart = useCallback(
    (type, index, e) => {
      e.preventDefault()
      const rect = gridContainerRef.current?.getBoundingClientRect()
      if (!rect) return
      gridDragRef.current = {
        type,
        index,
        startX: e.clientX,
        startY: e.clientY,
        containerWidth: rect.width,
        containerHeight: rect.height,
        startColWidths: [...colWidths],
        startRowHeights: [...rowHeights],
        startRightRowHeights: [...normalizedRightColumnRowHeights],
      }
      setIsGridDragging(true)
    },
    [colWidths, rowHeights, normalizedRightColumnRowHeights],
  )

  /**
   * Updates column or row proportions as the pointer moves during a drag.
   *
   * Column resize: the pointer delta in px is converted to fractional units (fr)
   *   while keeping the combined fr of the two adjacent columns constant.
   * Row resize: identical logic applied vertically.
   *
   * The computed values are cached in `gridDragRef.current.lastColWidths` /
   * `lastRowHeights` so `handleGridResizeEnd` can read the definitive final
   * values immediately at mouseup — React state updates are async in React 18
   * and may not have been committed yet when mouseup fires.
   *
   * `onResize(colWidths, rowHeights)` is called on every move so the parent
   * updates its controlled state and the grid visually reflects the new layout.
   */
  const handleGridResizeMove = useCallback(
    (e) => {
      const drag = gridDragRef.current
      if (!drag) return

      let nextCols = drag.lastColWidths ?? drag.startColWidths
      let nextRows = drag.lastRowHeights ?? drag.startRowHeights
      let nextRightRows = drag.lastRightRowHeights ?? drag.startRightRowHeights ?? normalizedRightColumnRowHeights

      if (drag.type === 'col') {
        const totalFr = drag.startColWidths.reduce((a, b) => a + b, 0)
        const deltaFr = ((e.clientX - drag.startX) / drag.containerWidth) * totalFr
        const i = drag.index
        const combined = drag.startColWidths[i] + drag.startColWidths[i + 1]
        const newLeft = Math.max(0.1, Math.min(combined - 0.1, drag.startColWidths[i] + deltaFr))
        nextCols = [...drag.startColWidths]
        nextCols[i] = newLeft
        nextCols[i + 1] = combined - newLeft
        drag.lastColWidths = nextCols // Cache for handleGridResizeEnd.
      } else if (drag.type === 'row') {
        const totalFr = drag.startRowHeights.reduce((a, b) => a + b, 0)
        const deltaFr = ((e.clientY - drag.startY) / drag.containerHeight) * totalFr
        const combined = drag.startRowHeights[0] + drag.startRowHeights[1]
        const newTop = Math.max(0.1, Math.min(combined - 0.1, drag.startRowHeights[0] + deltaFr))
        nextRows = [newTop, combined - newTop]
        drag.lastRowHeights = nextRows // Cache for handleGridResizeEnd.
      } else {
        const startRight = drag.startRightRowHeights ?? normalizedRightColumnRowHeights
        const totalFr = startRight.reduce((a, b) => a + b, 0)
        const deltaFr = ((e.clientY - drag.startY) / drag.containerHeight) * totalFr
        const combined = startRight[0] + startRight[1]
        const newTop = Math.max(0.1, Math.min(combined - 0.1, startRight[0] + deltaFr))
        nextRightRows = [newTop, combined - newTop]
        drag.lastRightRowHeights = nextRightRows
      }

      // Push live values to parent → parent updates controlled props → grid re-renders.
      if (drag.type === 'row-right') {
        onRightColumnResize?.(nextRightRows)
      } else {
        onResize?.(nextCols, nextRows)
      }
    },
    [onResize, onRightColumnResize, normalizedRightColumnRowHeights],
  )

  /**
   * Finalises the resize drag on mouseup.
   *
   * Reads the definitive values from `gridDragRef` (not React state) to
   * guarantee the numbers written by the last mousemove are used — state may
   * not have been committed by the time this handler fires.
   *
   * `onResizeCommit(colWidths, rowHeights)` tells the parent to persist the
   * final proportions to the workspace record (debounced DB write).
   *
   * Note: called outside a setState updater — side-effects inside updater
   * functions are unreliable under React 18 concurrent rendering and StrictMode.
   */
  const handleGridResizeEnd = useCallback(() => {
    const drag = gridDragRef.current
    if (!drag) return
    const cw = drag.lastColWidths ?? drag.startColWidths
    const rh = drag.lastRowHeights ?? drag.startRowHeights
    const rrh = drag.lastRightRowHeights ?? drag.startRightRowHeights ?? normalizedRightColumnRowHeights
    gridDragRef.current = null
    setIsGridDragging(false)
    if (drag.type === 'row-right') {
      onRightColumnResizeCommit?.(rrh)
    } else {
      onResizeCommit?.(cw, rh)
    }
  }, [onResizeCommit, onRightColumnResizeCommit, normalizedRightColumnRowHeights])

  // Attach/detach global pointer listeners so resize drags track the pointer
  // even when it moves outside the grid container element.
  React.useEffect(() => {
    document.addEventListener('mousemove', handleGridResizeMove)
    document.addEventListener('mouseup', handleGridResizeEnd)
    return () => {
      document.removeEventListener('mousemove', handleGridResizeMove)
      document.removeEventListener('mouseup', handleGridResizeEnd)
    }
  }, [handleGridResizeMove, handleGridResizeEnd])

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      ref={gridContainerRef}
      className="blank-grid-container"
      style={{
        gridTemplateColumns: `${colTemplate[0]} ${vHandle0Track} ${colTemplate[1]} ${vHandle1Track} ${colTemplate[2]}`,
        gridTemplateRows: `${rowTemplate[0]} ${hHandleTrack} ${rowTemplate[1]}`,
        // Suppress text selection while a resize drag is in progress.
        userSelect: isGridDragging ? 'none' : 'auto',
      }}
    >
      {/* ── Vertical resize handle: column 0 ↔ column 1 ─────────────────── */}
      {!isColDead[0] && !isColDead[1] && vHandleProps[0] !== null && (
        <div
          className="blank-grid-vhandle"
          style={{ gridColumn: '2', gridRow: vHandleProps[0] }}
          onMouseDown={(e) => handleGridResizeStart('col', 0, e)}
        />
      )}

      {/* ── Vertical resize handle: column 1 ↔ column 2 ─────────────────── */}
      {!isColDead[1] && !isColDead[2] && vHandleProps[1] !== null && (
        <div
          className="blank-grid-vhandle"
          style={{ gridColumn: '4', gridRow: vHandleProps[1] }}
          onMouseDown={(e) => handleGridResizeStart('col', 1, e)}
        />
      )}

      {/* ── Horizontal resize handle(s) ──────────────────────────────────────
          One div per contiguous track segment at CSS gridRow:2.
          Segments are computed to avoid spanning across full-height vSpan panels
          (rendering a bar through them would be visually wrong). */}
      {hHandleSegments.map((seg, i) => (
        <div
          key={`hhandle-${i}`}
          className="blank-grid-hhandle"
          style={{ gridColumn: seg, gridRow: '2' }}
          onMouseDown={(e) => handleGridResizeStart('row', 0, e)}
        />
      ))}

      {/* ── Independent right-column horizontal handle (slot 2 ↕ slot 5) ───── */}
      {hasIndependentRightColumnResize && (
        <div
          className="blank-grid-right-column-separator"
          style={{
            gridColumn: '5',
            gridRow: '1 / 4',
            top: `${(normalizedRightColumnRowHeights[0] / (normalizedRightColumnRowHeights[0] + normalizedRightColumnRowHeights[1])) * 100}%`,
          }}
          onMouseDown={(e) => handleGridResizeStart('row-right', 0, e)}
        />
      )}

      {/* ── Slot cells (indices 0–5: row 0 = 0–2, row 1 = 3–5) ─────────── */}
      {[0, 1, 2, 3, 4, 5].map((slotIndex) => {
        if (hasIndependentRightColumnResize && (slotIndex === 2 || slotIndex === 5)) {
          return null
        }

        const col = slotIndex % 3
        const row = Math.floor(slotIndex / 3)
        const panelKey = S[slotIndex]
        const isCollapsed = !panelKey && collapsedSet.has(slotIndex)
        const isSlotFullScreen = fullScreenSlotIndex === slotIndex

        // While a slot is in full-screen mode, all other slots are removed.
        if (hasFullScreen && !isSlotFullScreen) return null

        // Collapsed slot: removed from DOM so siblings can span the space.
        if (isCollapsed) return null

        // Full-screen slot: overlay the entire grid.
        if (isSlotFullScreen) {
          return (
            <div
              key={`slot-${slotIndex}`}
              className="blank-grid-slot occupied fullscreen"
              style={{ gridColumn: '1 / 6', gridRow: '1 / 4', zIndex: 10 }}
            >
              <DockablePanelShell
                title={getPanelTitle(panelKey)}
                isFullScreen
                onToggleFullScreen={() => toggleSlotFullScreen(slotIndex)}
                onClose={() => handleSlotClear(slotIndex)}
              >
                {renderPanelContent(panelKey)}
              </DockablePanelShell>
            </div>
          )
        }

        // Empty slot outside edit mode: never render (slots without a panel
        // are invisible to the user unless they are actively editing the layout).
        if (!panelKey && !isEditMode) return null

        // Edit mode: show only the leftmost empty slot in each row as a drop zone.
        if (!panelKey && isEditMode && leftmostEmptyPerRow[row] !== slotIndex) return null

        // Compute CSS grid placement from span logic.
        const spansRows = spansRowsOf(slotIndex)
        const hSpan = horizontalSpanOf(slotIndex)
        const effectiveGridRow = spansRows ? '1 / 4' : String(row * 2 + 1)
        const effectiveGridCol = hSpan || String(col * 2 + 1)

        const isDragTarget = dragOverSlotIndex === slotIndex

        return (
          <div
            key={`slot-${slotIndex}`}
            className={[
              'blank-grid-slot',
              panelKey ? 'occupied' : 'empty',
              isDragTarget ? 'drag-over' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ gridColumn: effectiveGridCol, gridRow: effectiveGridRow }}
            onDragOver={isEditMode ? (e) => handleSlotDragOver(slotIndex, e) : undefined}
            onDragLeave={isEditMode ? () => handleSlotDragLeave(slotIndex) : undefined}
            onDrop={isEditMode ? (e) => handleSlotDrop(slotIndex, e) : undefined}
          >
            {panelKey ? (
              /* Occupied: panel wrapped in the DockablePanelShell chrome. */
              <DockablePanelShell
                title={getPanelTitle(panelKey)}
                isFullScreen={false}
                onToggleFullScreen={() => toggleSlotFullScreen(slotIndex)}
                onClose={() => handleSlotClear(slotIndex)}
              >
                {renderPanelContent(panelKey)}
              </DockablePanelShell>
            ) : (
              /* Empty: drop zone visible in edit mode only. */
              <div className="blank-slot-drop-zone">
                <span className="blank-slot-drop-label">{t('workspace.dropPanelHere')}</span>
                <button
                  className="blank-slot-collapse-btn"
                  title={t('workspace.removeEmptySlot')}
                  onClick={() => handleSlotCollapse(slotIndex)}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )
      })}

      {/* ── Independent right-column panels (slot 2 + slot 5) ─────────────── */}
      {hasIndependentRightColumnResize && (
        <>
          <div
            className="blank-grid-slot occupied blank-grid-right-independent"
            style={{
              gridColumn: '5',
              gridRow: '1 / 4',
              height: `${(normalizedRightColumnRowHeights[0] / (normalizedRightColumnRowHeights[0] + normalizedRightColumnRowHeights[1])) * 100}%`,
              alignSelf: 'start',
            }}
          >
            <DockablePanelShell
              title={getPanelTitle(S[2])}
              isFullScreen={false}
              onToggleFullScreen={() => toggleSlotFullScreen(2)}
              onClose={() => handleSlotClear(2)}
            >
              {renderPanelContent(S[2])}
            </DockablePanelShell>
          </div>

          <div
            className="blank-grid-slot occupied blank-grid-right-independent"
            style={{
              gridColumn: '5',
              gridRow: '1 / 4',
              height: `${(normalizedRightColumnRowHeights[1] / (normalizedRightColumnRowHeights[0] + normalizedRightColumnRowHeights[1])) * 100}%`,
              alignSelf: 'end',
            }}
          >
            <DockablePanelShell
              title={getPanelTitle(S[5])}
              isFullScreen={false}
              onToggleFullScreen={() => toggleSlotFullScreen(5)}
              onClose={() => handleSlotClear(5)}
            >
              {renderPanelContent(S[5])}
            </DockablePanelShell>
          </div>
        </>
      )}
    </div>
  )
}

export default DockableWorkspaceGrid
