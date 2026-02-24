import React, { useEffect, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import './Sidebar.css'

const Sidebar = ({ onAdminClick, onOpenSettings }) => {
  const { t } = useLanguage()
  const { logout, user } = useAuth()
  const [showOverlayMenu, setShowOverlayMenu] = useState(false)

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowOverlayMenu(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])
  
  const handleLogout = async () => {
    setShowOverlayMenu(false)
    if (window.confirm('Are you sure you want to logout?')) {
      await logout()
    }
  }

  const handleOpenSettings = () => {
    setShowOverlayMenu(false)
    if (onOpenSettings) {
      onOpenSettings()
    }
  }

  const handleAdminClick = () => {
    setShowOverlayMenu(false)
    if (onAdminClick && user?.role === 'admin') {
      onAdminClick()
    }
  }
  
  const menuItems = [
    { 
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>, 
      label: t('sidebar.menu'), 
      active: false 
    },
    { 
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, 
      label: t('sidebar.orders'), 
      active: false 
    },
    { 
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, 
      label: t('sidebar.trading'), 
      active: true 
    },
    { 
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>, 
      label: t('sidebar.blotter'), 
      active: false 
    },
    { 
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, 
      label: t('sidebar.data'), 
      active: false 
    },
    { 
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>, 
      label: t('sidebar.alerts'), 
      active: false 
    }
  ]

  return (
    <div className="sidebar">
      {menuItems.map((item, index) => (
        <div
          key={index}
          className={`sidebar-item ${item.active ? 'active' : ''}`}
          onClick={index === 0 ? () => setShowOverlayMenu(true) : undefined}
        >
          <div className="sidebar-icon">{item.icon}</div>
          <div className="sidebar-label">{item.label}</div>
        </div>
      ))}

      {showOverlayMenu && (
        <>
          <div className="sidebar-overlay-backdrop" onClick={() => setShowOverlayMenu(false)} />
          <aside className="sidebar-overlay-panel" role="menu" aria-label="Main menu">
            <button className="sidebar-overlay-close" onClick={() => setShowOverlayMenu(false)} aria-label="Close menu">×</button>

            <button className="sidebar-overlay-item" onClick={handleOpenSettings} role="menuitem">
              SETTINGS
            </button>

            <button
              className={`sidebar-overlay-item ${user?.role === 'admin' ? '' : 'disabled'}`}
              onClick={handleAdminClick}
              role="menuitem"
              disabled={user?.role !== 'admin'}
            >
              ADMIN
            </button>

            <button className="sidebar-overlay-item sidebar-overlay-item-logout" onClick={handleLogout} role="menuitem">
              LOG OUT
            </button>
          </aside>
        </>
      )}
      
      {/* User info and logout at the bottom */}
      <div className="sidebar-spacer"></div>
      
      {user && (
        <div className="sidebar-user-section">
          <div className="sidebar-item sidebar-user-info">
            <div className="sidebar-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className="sidebar-label">{user.username}</div>
          </div>
          
          <div className="sidebar-item sidebar-logout" onClick={handleLogout}>
            <div className="sidebar-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
            <div className="sidebar-label">Logout</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar
