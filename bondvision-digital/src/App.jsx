import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PreferencesProvider } from './context/PreferencesContext'
import { LanguageProvider } from './context/LanguageContext'
import { WorkspaceProvider, useWorkspace, EMPTY_WORKSPACE_SLOTS, DEFAULT_WORKSPACE_LAYOUT } from './context/WorkspaceContext'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import WorkspaceTabs from './components/WorkspaceTabs'
import Login from './components/Login'
import AdminPanel from './components/AdminPanel'
import UserSettings from './components/UserSettings'
import './App.css'
import './components/Badge.css'

// Layout equality guard to avoid spurious workspace updates
const areWorkspaceLayoutsEqual = (first, second) => {
  if (!first || !second) return false
  const arrEq = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i])
  return first.tradingWidth           === second.tradingWidth
      && first.marketWidth            === second.marketWidth
      && first.dataHeight             === second.dataHeight
      && first.isMarketDepthCollapsed === second.isMarketDepthCollapsed
      && first.isDataPanelCollapsed   === second.isDataPanelCollapsed
      && arrEq(first.colWidths,  second.colWidths)
      && arrEq(first.rowHeights, second.rowHeights)
}

// Inner app (needs WorkspaceProvider above it)
function AppContent() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { workspaces, activeWorkspaceId, loading: wsLoading, updateWorkspace } = useWorkspace()

  const [editingWorkspaceId, setEditingWorkspaceId] = useState(null)
  const [activeMarket, setActiveMarket]             = useState('BV')
  const [activeSidebarPanel, setActiveSidebarPanel] = useState('trading')
  const [sidebarPanelCommand, setSidebarPanelCommand] = useState(null)
  const [showAdminPanel, setShowAdminPanel]         = useState(false)
  const [showUserSettings, setShowUserSettings]     = useState(false)

  const activeWorkspace = useMemo(
    () => workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0],
    [workspaces, activeWorkspaceId]
  )

  // When a temp ID (workspace-local-*) is replaced by a real UUID from the DB,
  // keep editingWorkspaceId in sync so edit mode stays active on the new tab.
  useEffect(() => {
    if (!editingWorkspaceId?.startsWith('workspace-local-')) return;
    if (activeWorkspaceId && activeWorkspaceId !== editingWorkspaceId) {
      setEditingWorkspaceId(activeWorkspaceId);
    }
  }, [activeWorkspaceId, editingWorkspaceId]);

  const handleWorkspaceLayoutChange = useCallback((nextLayout) => {
    if (!nextLayout || !activeWorkspaceId) return
    if (areWorkspaceLayoutsEqual(activeWorkspace?.layout, nextLayout)) return
    updateWorkspace(activeWorkspaceId, { layout: nextLayout })
  }, [activeWorkspaceId, activeWorkspace, updateWorkspace])

  const handleBlankSlotChange = useCallback((slotIndex, panelKeyOrNull) => {
    if (!activeWorkspace) return
    const nextSlots = [...(activeWorkspace.slots || EMPTY_WORKSPACE_SLOTS)]
    if (slotIndex === -1 && panelKeyOrNull) {
      const firstEmpty = nextSlots.findIndex((k) => !k)
      if (firstEmpty === -1) return
      nextSlots[firstEmpty] = panelKeyOrNull
    } else {
      if (slotIndex < 0 || slotIndex >= nextSlots.length) return
      nextSlots[slotIndex] = panelKeyOrNull
    }
    updateWorkspace(activeWorkspaceId, { slots: nextSlots })
  }, [activeWorkspace, activeWorkspaceId, updateWorkspace])

  const handleBlankHiddenSlotsChange = useCallback((nextHiddenSlots) => {
    updateWorkspace(activeWorkspaceId, { hiddenSlots: nextHiddenSlots })
  }, [activeWorkspaceId, updateWorkspace])

  // Enter edit mode: reset hiddenSlots so every empty slot reappears as a drop zone
  const handleEditStart = useCallback((wsId) => {
    setEditingWorkspaceId(wsId)
    const ws = workspaces.find((w) => w.id === wsId)
    if (ws?.mode === 'blank' && (ws?.hiddenSlots || []).length > 0) {
      updateWorkspace(wsId, { hiddenSlots: [] }, true)
    }
  }, [workspaces, updateWorkspace])

  // Exit edit mode: auto-collapse remaining empty slots.
  // Encoding convention (stored in hiddenSlots):
  //   value 0-5  → slot hidden normally (horizontal-span candidate)
  //   value 6-11 → slot hidden while partner already had a panel (vertical-span intent)
  //                decode with:  slotIndex = value % 6,  isVSpan = value >= 6
  const handleEditEnd = useCallback(() => {
    if (editingWorkspaceId && activeWorkspace?.mode === 'blank') {
      const currentHidden = activeWorkspace.hiddenSlots || []
      const slots = activeWorkspace.slots || EMPTY_WORKSPACE_SLOTS
      // Slots already explicitly hidden during edit (via X presses) — track by decoded index
      const alreadyHiddenIndices = new Set(currentHidden.map((v) => v % 6))
      // Auto-hide remaining empty slots with correct vSpan encoding
      const autoHide = slots
        .map((s, i) => {
          if (s) return null                    // has panel → skip
          if (alreadyHiddenIndices.has(i)) return null  // already hidden → skip
          const partner = i < 3 ? i + 3 : i - 3
          return slots[partner] ? (i + 6) : i  // vSpan-encoded or regular
        })
        .filter((v) => v !== null)
      const nextHidden = [...currentHidden, ...autoHide]
      if (autoHide.length > 0) {
        updateWorkspace(editingWorkspaceId, { hiddenSlots: nextHidden }, true)
      }
    }
    setEditingWorkspaceId(null)
  }, [editingWorkspaceId, activeWorkspace, updateWorkspace])

  const handleSidebarPanelSelect = (panelKey) => {
    setActiveSidebarPanel(panelKey)
    setSidebarPanelCommand({ panelKey, requestedAt: Date.now() })
  }

  if (authLoading || (isAuthenticated && wsLoading)) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login />
  }

  const isEditMode = editingWorkspaceId === activeWorkspaceId && activeWorkspace?.mode === 'blank'

  return (
    <PreferencesProvider>
      <div className="app">
        <Header
          activeMarket={activeMarket}
          setActiveMarket={setActiveMarket}
        />

        <WorkspaceTabs
          editingWorkspaceId={editingWorkspaceId}
          onEditStart={handleEditStart}
          onEditEnd={handleEditEnd}
        />

        <div className="app-body">
          <Sidebar
            onAdminClick={() => setShowAdminPanel(true)}
            onOpenSettings={() => setShowUserSettings(true)}
            activePanel={activeSidebarPanel}
            onPanelSelect={handleSidebarPanelSelect}
            workspaceMode={activeWorkspace?.mode}
          />
          <MainContent
            panelCommand={sidebarPanelCommand}
            workspaceLayout={activeWorkspace?.layout}
            onWorkspaceLayoutChange={handleWorkspaceLayoutChange}
            workspaceMode={activeWorkspace?.mode}
            workspaceSlots={activeWorkspace?.slots}
            onWorkspaceSlotChange={handleBlankSlotChange}
            workspaceHiddenSlots={activeWorkspace?.hiddenSlots || []}
            onWorkspaceHiddenSlotsChange={handleBlankHiddenSlotsChange}
            isWorkspaceEditMode={isEditMode}
          />
        </div>

        {showAdminPanel   && <AdminPanel   onClose={() => setShowAdminPanel(false)} />}
        {showUserSettings && <UserSettings onClose={() => setShowUserSettings(false)} />}
      </div>
    </PreferencesProvider>
  )
}

// Root: provider tree
function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <WorkspaceProvider>
          <AppContent />
        </WorkspaceProvider>
      </LanguageProvider>
    </AuthProvider>
  )
}

export default App
