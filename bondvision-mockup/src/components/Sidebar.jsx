import React from 'react'
import './Sidebar.css'

const Sidebar = () => {
  const menuItems = [
    { icon: '☰', label: 'MENU', active: false },
    { icon: '📋', label: 'ORDERS', active: false },
    { icon: '📊', label: 'TRADING', active: true },
    { icon: '📝', label: 'BLOTTER', active: false },
    { icon: '📈', label: 'DATA', active: false },
    { icon: '🔔', label: 'ALERTS', active: false }
  ]

  return (
    <div className="sidebar">
      {menuItems.map((item, index) => (
        <div key={index} className={`sidebar-item ${item.active ? 'active' : ''}`}>
          <div className="sidebar-icon">{item.icon}</div>
          <div className="sidebar-label">{item.label}</div>
        </div>
      ))}
    </div>
  )
}

export default Sidebar
