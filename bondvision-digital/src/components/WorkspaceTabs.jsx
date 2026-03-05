import React, { useEffect, useRef, useState } from 'react';
import { useWorkspace, DEFAULT_WORKSPACE_LAYOUT, EMPTY_WORKSPACE_SLOTS } from '../context/WorkspaceContext';
import './WorkspaceTabs.css';

export default function WorkspaceTabs({ editingWorkspaceId, onEditStart, onEditEnd }) {
  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    addWorkspace,
    updateWorkspace,
    deleteWorkspace,
  } = useWorkspace();

  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [menuOpenId, setMenuOpenId] = useState(null);
  const renameInputRef = useRef(null);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpenId) return;
    const handler = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpenId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpenId]);

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
    await addWorkspace({
      name: `Blank Workspace ${workspaces.length + 1}`,
      mode: 'blank',
      slots: [...EMPTY_WORKSPACE_SLOTS],
      layout: { ...DEFAULT_WORKSPACE_LAYOUT },
      hiddenSlots: [],
      sortOrder: workspaces.length,
    });
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
      <span className="workspace-tabs-label">WORKSPACE</span>
      <div className="workspace-tabs-list">
        {workspaces.map((ws) => {
          const isActive   = ws.id === activeWorkspaceId;
          const isEditMode = ws.id === editingWorkspaceId;
          const isRenaming = renamingId === ws.id;
          const isMenuOpen = menuOpenId === ws.id;

          return (
            <div
              key={ws.id}
              className={['workspace-tab', isActive ? 'active' : '', isEditMode ? 'edit-mode' : ''].filter(Boolean).join(' ')}
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
                  title="Exit edit mode"
                >
                  Done
                </button>
              )}

              <button
                className="workspace-tab-menu-trigger"
                onClick={(e) => { e.stopPropagation(); setMenuOpenId(isMenuOpen ? null : ws.id); }}
                title="Workspace options"
              >
                ⋮
              </button>

              {isMenuOpen && (
                <div
                  className="workspace-tab-menu"
                  ref={menuRef}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <button onClick={(e) => startRename(ws.id, ws.name, e)}>Rename</button>
                  {ws.mode === 'blank' && (
                    <button onClick={() => handleMenuEdit(ws.id, ws.mode)}>Edit layout</button>
                  )}
                  <button onClick={() => handleMenuDuplicate(ws.id)}>Duplicate</button>
                  <button
                    className="workspace-tab-menu-delete"
                    onClick={() => handleMenuDelete(ws.id)}
                    disabled={workspaces.length <= 1}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}

        <button
          className="workspace-tab-new"
          onClick={handleNewBlank}
          title="New blank workspace"
        >
          +
        </button>
      </div>
    </div>
  );
}
