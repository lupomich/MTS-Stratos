/**
 * workspaceConstants.js
 *
 * Shared constants for the MTS Stratos Dockable Workspace Framework.
 * Import from this module wherever workspace-related constants are needed to
 * avoid magic strings scattered across components.
 */

// ── Drag-and-Drop ─────────────────────────────────────────────────────────────

/**
 * MIME type used to transfer a panel key during a sidebar → slot drag-and-drop.
 * Set by Sidebar.jsx on dragstart; read by DockableWorkspaceGrid.jsx on drop.
 *
 * Using a custom MIME type lets us distinguish our drops from generic text drops
 * and avoids collisions with browser or third-party drag payloads.
 */
export const SIDEBAR_PANEL_DRAG_MIME = 'application/x-mts-panel'

// ── Slot layout ───────────────────────────────────────────────────────────────

/**
 * Total number of slots in a blank (dockable) workspace.
 * Laid out as a 2-row × 3-column grid:
 *   Slot 0 | Slot 1 | Slot 2   ← Row 0
 *   Slot 3 | Slot 4 | Slot 5   ← Row 1
 */
export const BLANK_WORKSPACE_SLOT_COUNT = 6

/**
 * All panel keys that are valid drop targets inside a blank workspace.
 * Each key maps to a concrete panel component rendered by MainContent.
 */
export const BLANK_WORKSPACE_PANEL_KEYS = new Set([
  'trading', // Bond trading table
  'data',    // Trade data / analytics grid
  'depth',   // Market depth (order book)
  'blotter', // Trade blotter
  'alerts',  // Price / risk alerts
  'orders',  // Open orders
])

// ── Hidden-slot encoding ──────────────────────────────────────────────────────

/**
 * Slot indices 0-5 stored in hiddenSlots as plain values identify regularly
 * hidden slots (horizontal-span candidates — the panel to the left may extend
 * into this column).
 *
 * Slot indices stored as (index + VSPAN_ENCODING_OFFSET) — i.e. values 6-11 —
 * indicate that the slot was hidden WHILE its column-partner already had a panel
 * present. This signals a "vertical-span intent": the partner should stretch to
 * fill both rows.
 *
 * Decode:
 *   slotIndex = storedValue % 6
 *   isVSpan   = storedValue >= VSPAN_ENCODING_OFFSET
 */
export const VSPAN_ENCODING_OFFSET = 6
