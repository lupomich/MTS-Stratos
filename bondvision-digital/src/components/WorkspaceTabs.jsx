/**
 * WorkspaceTabs — Horizontal tab bar for switching between workspaces.
 *
 * Features:
 *   - Click to activate, double-click to rename.
 *   - Drag-and-drop reordering (pointer-based insertion indicator).
 *   - Per-tab context menu: rename, edit layout, duplicate, delete.
 *   - Edit-mode badge and “Done” button for blank workspaces.
 *   - Optional legacy-workspace filter ("hideLegacyWorkspace" preference).
 *   - “+” button to create a new blank workspace and enter edit mode immediately.
 *
 * @param {string|null}  editingWorkspaceId  ID of the workspace currently in edit mode.
 * @param {function}     onEditStart         Called with wsId when edit mode should begin.
 * @param {function}     onEditEnd           Called when the user clicks “Done”.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useWorkspace, DEFAULT_WORKSPACE_LAYOUT, EMPTY_WORKSPACE_SLOTS } from '../context/WorkspaceContext';
import { useLanguage } from '../context/LanguageContext';
import { usePreferences } from '../context/PreferencesContext';
import './WorkspaceTabs.css';

export default function WorkspaceTabs({ editingWorkspaceId, onEditStart, onEditEnd }) {
  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    addWorkspace,
    updateWorkspace,
    deleteWorkspace,
    reorderWorkspaces,
  } = useWorkspace();

  const { t } = useLanguage();
  const { preferences } = usePreferences();
  const hideLegacy = Boolean(preferences?.hideLegacyWorkspace);

  // Compute visible workspaces: hide legacy ones when the preference is on,
  // but always show all if filtering would leave nothing.
  // ══ Legacy-workspace filter ═══════════════════════════════════════════════════════════════════════════════════
  // When the 'hideLegacyWorkspace' preference is on, legacy-mode tabs are hidden.
  // Safety: if filtering would leave no tabs visible, all tabs are shown instead.
  // An auto-switch effect fires when the currently-active workspace becomes hidden.
  // (SCHEDULED FOR REMOVAL once the legacy mode is deleted)
  const visibleWorkspaces = useMemo(() => {
    if (!hideLegacy) return workspaces;
    const nonLegacy = workspaces.filter((w) => w.mode !== 'legacy');
    return nonLegacy.length > 0 ? nonLegacy : workspaces;
  }, [hideLegacy, workspaces]);

  // If the active workspace is hidden by the filter, auto-switch to the first visible one.
  useEffect(() => {
    if (!hideLegacy) return;
    const isVisible = visibleWorkspaces.some((w) => w.id === activeWorkspaceId);
    if (!isVisible && visibleWorkspaces.length > 0) {
      setActiveWorkspaceId(visibleWorkspaces[0].id);
    }
  }, [hideLegacy, visibleWorkspaces, activeWorkspaceId, setActiveWorkspaceId]);

  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [dragInsertBefore, setDragInsertBefore] = useState(true);
  const renameInputRef = useRef(null);
  const menuRef = useRef(null);

  // ── Drag & Drop handlers ─────────────────────────────────────────────────
  // ══ Drag-and-drop tab reordering ══════════════════════════════════════════════════════════════════════════════
  // dragId: the tab being dragged
  // dragOverId: the tab currently hovered over (determines insertion point indicator)
  // dragInsertBefore: true = insert before hovered tab, false = insert after
  const handleDragStart = (e, id) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e, id) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id === dragId) { setDragOverId(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    setDragInsertBefore(e.clientX < rect.left + rect.width / 2);
    setDragOverId(id);
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) { clearDrag(); return; }
    const ids = workspaces.map((w) => w.id);
    const fromIdx = ids.indexOf(dragId);
    const toIdx   = ids.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) { clearDrag(); return; }
    const reordered = ids.filter((id) => id !== dragId);
    const insertAt = dragInsertBefore ? toIdx : toIdx + 1;
    // Recalculate insertAt after removal
    const toIdxAfterRemoval = reordered.indexOf(targetId);
    const finalInsert = dragInsertBefore ? toIdxAfterRemoval : toIdxAfterRemoval + 1;
    reordered.splice(finalInsert, 0, dragId);
    reorderWorkspaces(reordered);
    clearDrag();
  };

  const clearDrag = () => { setDragId(null); setDragOverId(null); };

  // ══ Context menu ═══════════════════════════════════════════════════════════════════════════════════════════
  // Opens on ⋮ trigger button. Positioned with fixed coordinates to escape any
  // overflow:hidden container (e.g. the tab bar itself). Closed on outside-click
  // or on any scroll event.
  useEffect(() => {
    if (!menuOpenId) return;
    const handler = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpenId(null);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('scroll', () => setMenuOpenId(null), { once: true });
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpenId]);

  const openMenu = (id, triggerBtn) => {
    const rect = triggerBtn.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 2, left: rect.right });
    setMenuOpenId(id);
  };

  // ══ Workspace actions ═════════════════════════════════════════════════════════════════════════════════════════
  const handleTabClick = (id) => {
    if (renamingId === id) return;
    setActiveWorkspaceId(id);
    if (editingWorkspaceId && editingWorkspaceId !== id) onEditEnd();
  };

  const startRename = (id, currentName, e) => {
    e.stopPropagation();
    setMenuOpenId(null);
    setRenamingId(id);
    setRenameValue(currentName);
    setTimeout(() => { renameInputRef.current?.focus(); renameInputRef.current?.select(); }, 0);
  };

  const commitRename = () => {
    if (renamingId && renameValue.trim()) {
      updateWorkspace(renamingId, { name: renameValue.trim() }, true);
    }
    setRenamingId(null);
  };

  const handleNewBlank = async () => {
    const tempId = await addWorkspace({
      name: `Workspace ${workspaces.length + 1}`,
      mode: 'blank',
      slots: [...EMPTY_WORKSPACE_SLOTS],
      layout: { ...DEFAULT_WORKSPACE_LAYOUT },
      hiddenSlots: [],
      sortOrder: workspaces.length,
    });
    // Enter edit mode immediately so the user can place panels and click Done
    if (tempId) onEditStart(tempId);
  };

  const handleMenuEdit = (id, wsMode) => {
    setMenuOpenId(null);
    if (wsMode !== 'blank') return; // Edit only makes sense for blank workspaces
    if (activeWorkspaceId !== id) setActiveWorkspaceId(id);
    onEditStart(id);
  };

  const handleMenuDuplicate = async (wsId) => {
    setMenuOpenId(null);
    const ws = workspaces.find((w) => w.id === wsId);
    if (!ws) return;
    // For blank workspaces: auto-hide empty slots in the duplicate
    const emptyIndices = ws.mode === 'blank'
      ? (ws.slots || EMPTY_WORKSPACE_SLOTS).map((s, i) => (!s ? i : null)).filter((i) => i !== null)
      : [];
    const dupHidden = [...new Set([...(ws.hiddenSlots || []), ...emptyIndices])];
    await addWorkspace({
      name: `${ws.name} (copy)`,
      mode: ws.mode,
      slots: ws.slots,
      layout: ws.layout,
      hiddenSlots: dupHidden,
      sortOrder: workspaces.length,
    });
  };

  const handleMenuDelete = (id) => {
    setMenuOpenId(null);
    if (workspaces.length <= 1) return;
    deleteWorkspace(id);
  };

  return (
    <div className="workspace-tabs-bar">
      <span className="workspace-tabs-label">{t('workspace.label')}</span>
      <div className="workspace-tabs-list">
        {visibleWorkspaces.map((ws) => {
          const isActive   = ws.id === activeWorkspaceId;
          const isEditMode = ws.id === editingWorkspaceId;
          const isRenaming = renamingId === ws.id;
          const isMenuOpen = menuOpenId === ws.id;

          const isDragging = dragId === ws.id;
          const isDragOver = dragOverId === ws.id;

          return (
            <div
              key={ws.id}
              className={[
                'workspace-tab',
                isActive   ? 'active'    : '',
                isEditMode ? 'edit-mode' : '',
                isDragging ? 'dragging'  : '',
                isDragOver ? (dragInsertBefore ? 'drag-over-before' : 'drag-over-after') : '',
              ].filter(Boolean).join(' ')}
              draggable={!isRenaming}
              onDragStart={(e) => handleDragStart(e, ws.id)}
              onDragOver={(e) => handleDragOver(e, ws.id)}
              onDrop={(e) => handleDrop(e, ws.id)}
              onDragEnd={clearDrag}
              onClick={() => handleTabClick(ws.id)}
            >
              {isRenaming ? (
                <input
                  ref={renameInputRef}
                  className="workspace-tab-rename"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingId(null); }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span
                  className="workspace-tab-name"
                  onDoubleClick={(e) => startRename(ws.id, ws.name, e)}
                  title={`${ws.name} — double-click to rename`}
                >
                  {ws.name}
                  {isEditMode && <span className="workspace-tab-edit-badge"> ✎</span>}
                </span>
              )}

              {isEditMode && (
                <button
                  className="workspace-tab-done"
                  onClick={(e) => { e.stopPropagation(); onEditEnd(); }}
                  title={t('workspace.exitEditMode')}
                >
                  {t('workspace.done')}
                </button>
              )}

              <button
                className="workspace-tab-menu-trigger"
                onClick={(e) => { e.stopPropagation(); menuOpenId === ws.id ? setMenuOpenId(null) : openMenu(ws.id, e.currentTarget); }}
                title={t('workspace.options')}
              >
                ⋮
              </button>

              {isMenuOpen && (
                <div
                  className="workspace-tab-menu"
                  ref={menuRef}
                  style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, transform: 'translateX(-100%)' }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <button onClick={(e) => startRename(ws.id, ws.name, e)}>{t('workspace.rename')}</button>
                  {ws.mode === 'blank' && (
                    <button onClick={() => handleMenuEdit(ws.id, ws.mode)}>{t('workspace.editLayout')}</button>
                  )}
                  <button onClick={() => handleMenuDuplicate(ws.id)}>{t('workspace.duplicate')}</button>
                  <button
                    className="workspace-tab-menu-delete"
                    onClick={() => handleMenuDelete(ws.id)}
                    disabled={workspaces.length <= 1}
                  >
                    {t('workspace.delete')}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        <button
          className="workspace-tab-new"
          onClick={handleNewBlank}
          title={t('workspace.newBlank')}
        >
          +
        </button>
      </div>
    </div>
  );
}
