import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PreferencesProvider } from './context/PreferencesContext'
import { LanguageProvider } from './context/LanguageContext'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import Login from './components/Login'
import AdminPanel from './components/AdminPanel'
import UserSettings from './components/UserSettings'
import './App.css'
import './components/Badge.css'

const DEFAULT_WORKSPACE_LAYOUT = {
  tradingWidth: 60,
  marketWidth: 40,
  dataHeight: 35,
  isMarketDepthCollapsed: false,
  isDataPanelCollapsed: false
}

const EMPTY_WORKSPACE_SLOTS = Array.from({ length: 6 }, () => null)

const compactWorkspaceSlots = (slots) => {
  const compacted = (slots || []).filter((panelKey) => panelKey)
  const remaining = Math.max(0, EMPTY_WORKSPACE_SLOTS.length - compacted.length)
  return [...compacted, ...Array.from({ length: remaining }, () => null)]
}

const areWorkspaceLayoutsEqual = (first, second) => {
  if (!first || !second) return false

  return first.tradingWidth === second.tradingWidth
    && first.marketWidth === second.marketWidth
    && first.dataHeight === second.dataHeight
    && first.isMarketDepthCollapsed === second.isMarketDepthCollapsed
    && first.isDataPanelCollapsed === second.isDataPanelCollapsed
}

const createWorkspaceId = () => `workspace-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

function AppContent() {
  const defaultWorkspace = useMemo(() => ({
    id: 'workspace-default',
    name: 'Default Workspace',
    mode: 'legacy',
    slots: [...EMPTY_WORKSPACE_SLOTS],
    layout: DEFAULT_WORKSPACE_LAYOUT,
    hiddenSlots: []
  }), [])

  const [workspaces, setWorkspaces] = useState(() => {
    try {
      const saved = localStorage.getItem('mts-bv-workspaces')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch { /* ignore */ }
    return [defaultWorkspace]
  })
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => {
    try {
      return localStorage.getItem('mts-bv-activeWorkspaceId') || defaultWorkspace.id
    } catch {
      return defaultWorkspace.id
    }
  })
  const [activeMarket, setActiveMarket] = useState('BV')
  const [activeSidebarPanel, setActiveSidebarPanel] = useState('trading')
  const [sidebarPanelCommand, setSidebarPanelCommand] = useState(null)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [showUserSettings, setShowUserSettings] = useState(false)
  const { isAuthenticated, loading } = useAuth()

  // Persist workspaces and active id to localStorage whenever they change
  useEffect(() => {
    try { localStorage.setItem('mts-bv-workspaces', JSON.stringify(workspaces)) } catch { /* ignore */ }
  }, [workspaces])
  useEffect(() => {
    try { localStorage.setItem('mts-bv-activeWorkspaceId', activeWorkspaceId) } catch { /* ignore */ }
  }, [activeWorkspaceId])

  const activeWorkspace = useMemo(() => {
    return workspaces.find((workspace) => workspace.id === activeWorkspaceId) || workspaces[0]
  }, [workspaces, activeWorkspaceId])

  const handleWorkspaceLayoutChange = useCallback((nextLayout) => {
    if (!nextLayout) return

    setWorkspaces((previousWorkspaces) => previousWorkspaces.map((workspace) => {
      if (workspace.id !== activeWorkspaceId) return workspace
      if (areWorkspaceLayoutsEqual(workspace.layout, nextLayout)) return workspace

      return {
        ...workspace,
        layout: { ...nextLayout }
      }
    }))
  }, [activeWorkspaceId])

  const handleSidebarPanelSelect = (panelKey) => {
    setActiveSidebarPanel(panelKey)
    setSidebarPanelCommand({
      panelKey,
      requestedAt: Date.now()
    })
  }

  const handleCreateWorkspace = useCallback(() => {
    const baseName = 'Workspace'
    const nextIndex = workspaces.length + 1
    // For blank workspaces: auto-collapse any empty slots that haven’t been dismissed yet
    const baseHidden = activeWorkspace?.hiddenSlots || []
    const savedHiddenSlots = activeWorkspace?.mode === 'blank'
      ? [...new Set([
          ...baseHidden,
          ...(activeWorkspace?.slots || EMPTY_WORKSPACE_SLOTS)
            .map((slot, i) => (!slot ? i : null))
            .filter((i) => i !== null)
        ])]
      : []
    const newWorkspace = {
      id: createWorkspaceId(),
      name: `${baseName} ${nextIndex}`,
      mode: activeWorkspace?.mode || 'legacy',
      slots: [...(activeWorkspace?.slots || EMPTY_WORKSPACE_SLOTS)],
      layout: { ...(activeWorkspace?.layout || DEFAULT_WORKSPACE_LAYOUT) },
      hiddenSlots: savedHiddenSlots
    }

    setWorkspaces((previous) => [...previous, newWorkspace])
    setActiveWorkspaceId(newWorkspace.id)
  }, [workspaces.length, activeWorkspace?.layout, activeWorkspace?.mode, activeWorkspace?.slots, activeWorkspace?.hiddenSlots])

  const handleCreateBlankWorkspace = useCallback(() => {
    const nextIndex = workspaces.length + 1
    const newWorkspace = {
      id: createWorkspaceId(),
      name: `Blank Workspace ${nextIndex}`,
      mode: 'blank',
      slots: [...EMPTY_WORKSPACE_SLOTS],
      layout: { ...DEFAULT_WORKSPACE_LAYOUT },
      hiddenSlots: []
    }

    setWorkspaces((previous) => [...previous, newWorkspace])
    setActiveWorkspaceId(newWorkspace.id)
  }, [workspaces.length])

  const handleBlankSlotChange = useCallback((slotIndex, panelKeyOrNull) => {
    setWorkspaces((previousWorkspaces) => previousWorkspaces.map((workspace) => {
      if (workspace.id !== activeWorkspaceId || workspace.mode !== 'blank') return workspace
      const nextSlots = [...(workspace.slots || EMPTY_WORKSPACE_SLOTS)]

      if (slotIndex === -1 && panelKeyOrNull) {
        const firstEmptyIndex = nextSlots.findIndex((panelKey) => !panelKey)
        if (firstEmptyIndex === -1) return workspace
        nextSlots[firstEmptyIndex] = panelKeyOrNull
      } else {
        if (slotIndex < 0 || slotIndex >= nextSlots.length) return workspace
        nextSlots[slotIndex] = panelKeyOrNull
      }

      // Do NOT compact — preserve exact slot positions so the 3×2 grid layout stays correct
      return {
        ...workspace,
        slots: nextSlots
      }
    }))
  }, [activeWorkspaceId])

  const handleBlankHiddenSlotsChange = useCallback((nextHiddenSlots) => {
    setWorkspaces((previousWorkspaces) => previousWorkspaces.map((workspace) => {
      if (workspace.id !== activeWorkspaceId || workspace.mode !== 'blank') return workspace
      return { ...workspace, hiddenSlots: Array.isArray(nextHiddenSlots) ? nextHiddenSlots : [] }
    }))
  }, [activeWorkspaceId])

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <PreferencesProvider>
      <div className="app">
        <Header 
          activeMarket={activeMarket} 
          setActiveMarket={setActiveMarket}
        />
        <div className="workspace-toolbar">
          <label htmlFor="workspace-select" className="workspace-toolbar-label">Workspace</label>
          <select
            id="workspace-select"
            className="workspace-toolbar-select"
            value={activeWorkspaceId}
            onChange={(event) => setActiveWorkspaceId(event.target.value)}
          >
            {workspaces.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="workspace-toolbar-button"
            onClick={handleCreateWorkspace}
          >
            Save as New
          </button>
          <button
            type="button"
            className="workspace-toolbar-button"
            onClick={handleCreateBlankWorkspace}
          >
            New Blank
          </button>
        </div>
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
          />
        </div>
        {showAdminPanel && (
          <AdminPanel onClose={() => setShowAdminPanel(false)} />
        )}
        {showUserSettings && (
          <UserSettings onClose={() => setShowUserSettings(false)} />
        )}
      </div>
    </PreferencesProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  )
}

export default App
