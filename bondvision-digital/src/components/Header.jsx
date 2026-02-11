import React, { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import './Header.css'

const Header = ({ activeMarket, setActiveMarket }) => {
  const { language, toggleLanguage } = useLanguage()
  const [currentTime, setCurrentTime] = useState('')
  const [memberStatus, setMemberStatus] = useState('OFF')
  const [traderStatus, setTraderStatus] = useState('OFF')
  const [autoexStatus, setAutoexStatus] = useState('OFF')

  const handleMemberToggle = () => {
    const newMemberStatus = memberStatus === 'OFF' ? 'ON' : 'OFF'
    setMemberStatus(newMemberStatus)
    // Se metto Member OFF e Trader è ON, metto Trader OFF
    if (newMemberStatus === 'OFF' && traderStatus === 'ON') {
      setTraderStatus('OFF')
    }
  }

  const handleTraderToggle = () => {
    // Trader può stare ON solo se Member è ON
    if (memberStatus === 'ON') {
      setTraderStatus(traderStatus === 'OFF' ? 'ON' : 'OFF')
    }
  }

  const toggleStatus = (status, setStatus) => {
    setStatus(status === 'OFF' ? 'ON' : 'OFF')
  }

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const cetTime = now.toLocaleTimeString('it-IT', {
        timeZone: 'Europe/Rome',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
      setCurrentTime(cetTime)
    }

    updateTime() // Imposta subito l'ora
    const interval = setInterval(updateTime, 1000) // Aggiorna ogni secondo

    return () => clearInterval(interval)
  }, [])
  
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-icon">
          <svg width="48" height="48" viewBox="64 432 31 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M68.9576 444.721H66V453.089H68.9576V444.721Z" fill="#8DC8E8"/>
            <path d="M68.9576 453.089H66V459.735H68.9576V453.089Z" fill="#41B6E6"/>
            <path d="M71.9618 438.474H68.9576V447.745H71.9618V438.474Z" fill="#41B6E6"/>
            <path d="M71.9618 447.745H68.9576V458.373H71.9618V447.745Z" fill="#14A3C7"/>
            <path d="M74.9352 440.02H71.9618V450.019H74.9352V440.02Z" fill="#5CB8B2"/>
            <path d="M74.9352 450.019H71.9618V461.724H74.9352V450.019Z" fill="#279989"/>
            <path d="M79.4707 434H74.9352V444.656H79.4707V434Z" fill="#A0D1CA"/>
            <path d="M79.4707 444.656H74.9352V464.154H79.4707V444.656Z" fill="#008D7F"/>
            <path d="M82.4511 439.262H79.4706V453.089H82.4511V439.262Z" fill="#009639"/>
            <path d="M82.4511 453.088H79.4706V466H82.4511V453.088Z" fill="#00685E"/>
            <path d="M86.9826 436.608H82.4511V448.798H86.9826V436.608Z" fill="#84BD00"/>
            <path d="M86.9826 448.798H82.4511V462.005H86.9826V448.798Z" fill="#007864"/>
            <path d="M89.9647 444.717H86.9825V451.333H89.9647V444.717Z" fill="#A4D65E"/>
            <path d="M89.9647 451.333H86.9825V458.372H89.9647V451.333Z" fill="#009A44"/>
            <path d="M92.9439 442.757H89.9648V448.798H92.9439V442.757Z" fill="#C2E189"/>
            <path d="M92.9439 448.798H89.9648V455.813H92.9439V448.798Z" fill="#78BE20"/>
          </svg>
        </div>
        <div className="logo-text">
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
          <span className="transaction-label">MICK005.0000SMTS</span>
          <span className="user-id">{currentTime}</span>
          <span className="market-status">Market <span className="status-test">TEST</span></span>
          <span className="member-status">
            Member <button 
              className={`status-badge ${memberStatus === 'ON' ? 'status-on' : 'status-off'}`}
              onClick={handleMemberToggle}
              title="Click to toggle"
            >
              {memberStatus}
            </button>
          </span>
          <span className="dealer-status">
            Trader <button 
              className={`status-badge ${traderStatus === 'ON' ? 'status-on' : 'status-off'}`}
              onClick={handleTraderToggle}
              disabled={memberStatus === 'OFF'}
              title={memberStatus === 'OFF' ? 'Enable Member first' : 'Click to toggle'}
              style={{ opacity: memberStatus === 'OFF' ? 0.5 : 1, cursor: memberStatus === 'OFF' ? 'not-allowed' : 'pointer' }}
            >
              {traderStatus}
            </button>
          </span>
          <span className="autoex-status">
            AutoEx <button 
              className={`status-badge ${autoexStatus === 'ON' ? 'status-on' : 'status-off'}`}
              onClick={() => toggleStatus(autoexStatus, setAutoexStatus)}
              title="Click to toggle"
            >
              {autoexStatus}
            </button>
          </span>
        </div>
        <div className="header-icons">
          <button className="icon-btn language-btn" title="Language" onClick={toggleLanguage}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <span className="language-text">{language.toUpperCase()}</span>
          </button>
          <button className="icon-btn" title="User Profile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
