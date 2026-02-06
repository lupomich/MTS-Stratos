import React, { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import './App.css'

function App() {
  const [activeMarket, setActiveMarket] = useState('BV')

  return (
    <div className="app">
      <Header activeMarket={activeMarket} setActiveMarket={setActiveMarket} />
      <div className="app-body">
        <Sidebar />
        <MainContent />
      </div>
    </div>
  )
}

export default App
