import React, { useState } from 'react'
import { LanguageProvider } from './context/LanguageContext'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import './App.css'
import './components/Badge.css'

function App() {
  const [activeMarket, setActiveMarket] = useState('BV')

  return (
    <LanguageProvider>
      <div className="app">
        <Header activeMarket={activeMarket} setActiveMarket={setActiveMarket} />
        <div className="app-body">
          <Sidebar />
          <MainContent />
        </div>
      </div>
    </LanguageProvider>
  )
}

export default App
