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
          <button className="icon-btn" title="Settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3m15.4 6.4l-4.2-4.2M9.8 9.8l-4.2-4.2m12.8 0l-4.2 4.2M9.8 14.2l-4.2 4.2"/>
            </svg>
          </button>
          <button className="icon-btn" title="User Profile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
          <button className="icon-btn" title="Language">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </button>
          <button className="icon-btn" title="Settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3m15.4 6.4l-4.2-4.2M9.8 9.8l-4.2-4.2m12.8 0l-4.2 4.2M9.8 14.2l-4.2 4.2"/>
            </svg>
          </button>
          <button className="icon-btn" title="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
