import React from 'react'
import './Header.css'

const Header = ({ activeMarket, setActiveMarket }) => {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-mts">MTS</span>
          <span className="logo-bondvision">BondVision</span>
        </div>
        <div className="market-selector">
          <span className="market-label">IT Italian (Italy)</span>
        </div>
      </div>
      <div className="header-right">
        <button 
          className={`market-btn ${activeMarket === 'BV' ? 'active' : ''}`}
          onClick={() => setActiveMarket('BV')}
        >
          BV
        </button>
        <button 
          className={`market-btn ${activeMarket === 'BV REPO' ? 'active' : ''}`}
          onClick={() => setActiveMarket('BV REPO')}
        >
          BV REPO
        </button>
        <button 
          className={`market-btn ${activeMarket === 'CASH' ? 'active' : ''}`}
          onClick={() => setActiveMarket('CASH')}
        >
          CASH
        </button>
        <div className="header-info">
          <span className="transaction-label">MICRO05.0000SMTS</span>
          <span className="user-id">12:34:16</span>
          <span className="market-status">Market <span className="status-test">TEST</span></span>
          <span className="member-status">Member <span className="status-off">OFF</span></span>
          <span className="dealer-status">Trader <span className="status-off">OFF</span></span>
          <span className="autoex-status">AutoEx <span className="status-off">OFF</span></span>
        </div>
        <div className="header-icons">
          <button className="icon-btn">⚙</button>
          <button className="icon-btn">👤</button>
          <button className="icon-btn">🌐</button>
          <button className="icon-btn">⚙</button>
          <button className="icon-btn">✕</button>
        </div>
      </div>
    </header>
  )
}

export default Header
