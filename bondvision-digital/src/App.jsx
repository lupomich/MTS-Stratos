import React, { useCallback, useMemo, useState } from 'react'
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
    layout: DEFAULT_WORKSPACE_LAYOUT
  }), [])

  const [workspaces, setWorkspaces] = useState([defaultWorkspace])
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(defaultWorkspace.id)
  const [activeMarket, setActiveMarket] = useState('BV')
  const [activeSidebarPanel, setActiveSidebarPanel] = useState('trading')
  const [sidebarPanelCommand, setSidebarPanelCommand] = useState(null)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [showUserSettings, setShowUserSettings] = useState(false)
  const { isAuthenticated, loading } = useAuth()

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
    const newWorkspace = {
      id: createWorkspaceId(),
      name: `${baseName} ${nextIndex}`,
      layout: { ...(activeWorkspace?.layout || DEFAULT_WORKSPACE_LAYOUT) }
    }

    setWorkspaces((previous) => [...previous, newWorkspace])
    setActiveWorkspaceId(newWorkspace.id)
  }, [workspaces.length, activeWorkspace?.layout])

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
        </div>
        <div className="app-body">
          <Sidebar
            onAdminClick={() => setShowAdminPanel(true)}
            onOpenSettings={() => setShowUserSettings(true)}
            activePanel={activeSidebarPanel}
            onPanelSelect={handleSidebarPanelSelect}
          />
          <MainContent
            panelCommand={sidebarPanelCommand}
            workspaceLayout={activeWorkspace?.layout}
            onWorkspaceLayoutChange={handleWorkspaceLayoutChange}
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
