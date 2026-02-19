import React, { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PreferencesProvider } from './context/PreferencesContext'
import { LanguageProvider } from './context/LanguageContext'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import Login from './components/Login'
import AdminPanel from './components/AdminPanel'
import './App.css'
import './components/Badge.css'

function AppContent() {
  const [activeMarket, setActiveMarket] = useState('BV')
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const { isAuthenticated, loading } = useAuth()

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
        <div className="app-body">
          <Sidebar onAdminClick={() => setShowAdminPanel(true)} />
          <MainContent />
        </div>
        {showAdminPanel && (
          <AdminPanel onClose={() => setShowAdminPanel(false)} />
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
