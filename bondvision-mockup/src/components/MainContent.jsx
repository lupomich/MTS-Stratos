import React, { useState, useRef, useCallback } from 'react'
import BondTable from './BondTable'
import MarketDepth from './MarketDepth'
import './MainContent.css'

const topTabs = [
  { code: 'ALL', name: 'All', flag: '' },
  { code: 'AXED', name: 'Axed', flag: '☑', hasCheck: true },
  { code: 'BV', name: 'BV', flag: '☑', hasCheck: true }
]

const countries = [
  { code: 'EU', name: 'EU', countryCode: 'eu', flag: `https://flagcdn.com/16x12/eu.png` },
  { code: 'AT', name: 'Austria', countryCode: 'at', flag: `https://flagcdn.com/16x12/at.png` },
  { code: 'BE', name: 'Belgium', countryCode: 'be', flag: `https://flagcdn.com/16x12/be.png` },
  { code: 'ES', name: 'Spain', countryCode: 'es', flag: `https://flagcdn.com/16x12/es.png` },
  { code: 'FR', name: 'France', countryCode: 'fr', flag: `https://flagcdn.com/16x12/fr.png` },
  { code: 'GR', name: 'Greece', countryCode: 'gr', flag: `https://flagcdn.com/16x12/gr.png` },
  { code: 'IRL', name: 'Ireland', countryCode: 'ie', flag: `https://flagcdn.com/16x12/ie.png` },
  { code: 'ISR', name: 'Israel', countryCode: 'il', flag: `https://flagcdn.com/16x12/il.png` },
  { code: 'IT', name: 'Italy', countryCode: 'it', flag: `https://flagcdn.com/16x12/it.png` },
  { code: 'LT', name: 'Lithuania', countryCode: 'lt', flag: `https://flagcdn.com/16x12/lt.png` },
  { code: 'LU', name: 'Luxembourg', countryCode: 'lu', flag: `https://flagcdn.com/16x12/lu.png` },
  { code: 'LV', name: 'Latvia', countryCode: 'lv', flag: `https://flagcdn.com/16x12/lv.png` },
  { code: 'NL', name: 'Netherlands', countryCode: 'nl', flag: `https://flagcdn.com/16x12/nl.png` },
  { code: 'NO', name: 'Norway', countryCode: 'no', flag: `https://flagcdn.com/16x12/no.png` },
  { code: '+', name: 'More', countryCode: '', flag: '' }
]

const rfqTypes = [
  'RFQ OUTRIGHT',
  'RFQ SWITCH',
  'RFQ BUTTERFLY',
  'RFQ LIST',
  'RFQ PORTFOLIO'
]

const dataTableRows = [
  {
    isin: 'IT0005415416',
    description: 'BTPSi 0.650 15/05/26',
    class: 'BTP',
    market: 'MTS Italy',
    ccy: 'EUR',
    minPrice: 99.628260,
    maxPrice: 99.628260,
    avePrice: 99.628260,
    minYield: 1.90800,
    maxYield: 1.91400,
    aveYield: 1.90900,
    sizeMM: 31.5,
    nominalValue: 33500000.0,
    numTrades: 6,
    firstPrice: 99.628260,
    firstYield: 1.90800,
    lastPrice: 99.628260,
    lastYield: 1.91400,
    tradeType: 'CAT',
    maturity: '15/05/2026',
    resMaturity: '0.5 yr'
  },
  {
    isin: 'IT0004735152',
    description: 'BTPSi 3.100 15/09/26',
    class: 'BTP',
    market: 'MTS Italy',
    ccy: 'EUR',
    minPrice: 100.244000,
    maxPrice: 100.247000,
    avePrice: 100.246000,
    minYield: 1.90000,
    maxYield: 1.91400,
    aveYield: 1.91400,
    sizeMM: 39,
    nominalValue: 30000000.0,
    numTrades: 5,
    firstPrice: 100.244000,
    firstYield: 1.90800,
    lastPrice: 100.247000,
    lastYield: 1.91400,
    tradeType: 'CAT',
    maturity: '15/09/2026',
    resMaturity: '0.75 yr'
  },
  {
    isin: 'IT0005230032',
    description: 'BTPEi 4.450 01/09/43',
    class: 'BTP',
    market: 'European Bond Market',
    ccy: 'EUR',
    minPrice: 99.628260,
    maxPrice: 99.628260,
    avePrice: 99.628260,
    minYield: 0.94100,
    maxYield: 0.94100,
    aveYield: 0.94100,
    sizeMM: 24.5,
    nominalValue: 25000000.0,
    numTrades: 3,
    firstPrice: 99.628260,
    firstYield: 0.94100,
    lastPrice: 99.628260,
    lastYield: 0.94100,
    tradeType: 'CAT',
    maturity: '01/09/2043',
    resMaturity: '20 yr'
  },
  {
    isin: 'FR0013233933',
    description: 'FRTR 1.750 25/06/39',
    class: 'OAT',
    market: 'European Bond Market',
    ccy: 'EUR',
    minPrice: 91.152000,
    maxPrice: 91.152000,
    avePrice: 91.152000,
    minYield: 3.46700,
    maxYield: 3.46700,
    aveYield: 3.46700,
    sizeMM: 7.8,
    nominalValue: 7000000.0,
    numTrades: 1,
    firstPrice: 91.152000,
    firstYield: 3.46700,
    lastPrice: 91.152000,
    lastYield: 3.46700,
    tradeType: 'CAT',
    maturity: '25/06/2039',
    resMaturity: '15 yr'
  }
]

const MainContent = () => {
  const [selectedBond, setSelectedBond] = useState(null)
  const [selectedCountry, setSelectedCountry] = useState('IT')
  const [expandedRFQ, setExpandedRFQ] = useState(false)
  const [selectedRFQ, setSelectedRFQ] = useState('RFQ OUTRIGHT')
  
  // State per il resize dinamico
  const [tradingWidth, setTradingWidth] = useState(60) // percentage
  const [marketWidth, setMarketWidth] = useState(30) // percentage
  const [dataHeight, setDataHeight] = useState(35) // percentage
  const [isDraggingVertical, setIsDraggingVertical] = useState(false)
  const [isDraggingHorizontal, setIsDraggingHorizontal] = useState(false)
  const contentBodyRef = useRef(null)
  const mainContentRef = useRef(null)

  // Handle resize verticale (trading area vs market depth)
  const handleMouseDownVertical = useCallback(() => {
    setIsDraggingVertical(true)
  }, [])

  const handleMouseUpVertical = useCallback(() => {
    setIsDraggingVertical(false)
  }, [])

  const handleMouseMoveVertical = useCallback((e) => {
    if (!isDraggingVertical || !contentBodyRef.current) return

    const rect = contentBodyRef.current.getBoundingClientRect()
    const newWidth = ((e.clientX - rect.left) / rect.width) * 100

    if (newWidth > 20 && newWidth < 80) {
      setTradingWidth(newWidth)
      setMarketWidth(100 - newWidth)
    }
  }, [isDraggingVertical])

  // Handle resize orizzontale (content vs data)
  const handleMouseDownHorizontal = useCallback(() => {
    setIsDraggingHorizontal(true)
  }, [])

  const handleMouseUpHorizontal = useCallback(() => {
    setIsDraggingHorizontal(false)
  }, [])

  const handleMouseMoveHorizontal = useCallback((e) => {
    if (!isDraggingHorizontal || !mainContentRef.current) return

    const rect = mainContentRef.current.getBoundingClientRect()
    const newHeight = ((rect.bottom - e.clientY) / rect.height) * 100

    if (newHeight > 15 && newHeight < 60) {
      setDataHeight(newHeight)
    }
  }, [isDraggingHorizontal])

  React.useEffect(() => {
    document.addEventListener('mousemove', handleMouseMoveVertical)
    document.addEventListener('mouseup', handleMouseUpVertical)
    return () => {
      document.removeEventListener('mousemove', handleMouseMoveVertical)
      document.removeEventListener('mouseup', handleMouseUpVertical)
    }
  }, [handleMouseMoveVertical, handleMouseUpVertical])

  React.useEffect(() => {
    document.addEventListener('mousemove', handleMouseMoveHorizontal)
    document.addEventListener('mouseup', handleMouseUpHorizontal)
    return () => {
      document.removeEventListener('mousemove', handleMouseMoveHorizontal)
      document.removeEventListener('mouseup', handleMouseUpHorizontal)
    }
  }, [handleMouseMoveHorizontal, handleMouseUpHorizontal])

  return (
    <div className="main-content" ref={mainContentRef}>
      <div className="rfq-toolbar">
        <div className="toolbar-left">
          <div className="rfq-dropdown">
            <button className="rfq-button" onClick={() => setExpandedRFQ(!expandedRFQ)}>
              {expandedRFQ ? selectedRFQ : 'OPEN RFQ'} ▼
            </button>
            {expandedRFQ && (
              <div className="rfq-menu">
                {rfqTypes.map(type => (
                  <div 
                    key={type} 
                    className={`rfq-option ${selectedRFQ === type ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedRFQ(type)
                      setExpandedRFQ(false)
                    }}
                  >
                    {type}
                  </div>
                ))}
              </div>
            )}
          </div>
          <input type="text" placeholder="Search Bonds..." className="search-input" />
        </div>
        <div className="toolbar-right">
          <button className="rfq-toolbar-button">RFQ TOOLBAR</button>
        </div>
      </div>

      <div className="top-tabs">
        {topTabs.map((t, i) => (
          <button
            key={`top-${t.code}-${i}`}
            className={`country-tab ${selectedCountry === t.code ? 'active' : ''}`}
            onClick={() => setSelectedCountry(t.code)}
            title={t.name}
          >
            <span className="flag">{t.flag}</span>
            <span className="code">{t.code}</span>
          </button>
        ))}
      </div>

      <div className="country-tabs">
        <div className="gov-selector-container">
          <label className="toolbar-label" htmlFor="gov-selector">Gov /</label>
          <select id="gov-selector" className="gov-selector">
            <option>Gov / Country</option>
            <option>Gov / Maturity</option>
            <option>Gov / Switches</option>
            <option>Govt gtd / SSA</option>
            <option>Covered / Maturity</option>
            <option>SSAs / Maturity</option>
            <option>Corporate / Industry</option>
            <option>Banks-Financials</option>
          </select>
        </div>
        {countries.map((country, idx) => (
          <button
            key={`${country.code}-${idx}`}
            className={`country-tab ${selectedCountry === country.code ? 'active' : ''}`}
            onClick={() => setSelectedCountry(country.code)}
            title={country.name}
          >
            {country.flag && (
              <img src={country.flag} alt={country.code} className="country-flag-img" />
            )}
            {!country.flag && <span className="flag-placeholder">➕</span>}
            <span className="code">{country.code}</span>
          </button>
        ))}
      </div>

      <div className="content-body" ref={contentBodyRef} style={{ cursor: isDraggingVertical ? 'col-resize' : 'default' }}>
        <div className="trading-area-container" style={{ flex: `0 0 ${tradingWidth}%` }}>
          {selectedBond && (
            <div className="selected-bond-info">
              <span className="info-label">{selectedBond.description} - {selectedBond.isin}</span>
            </div>
          )}

          <BondTable onSelectBond={setSelectedBond} />

          <div className="resize-handle-horizontal" onMouseDown={handleMouseDownHorizontal} />

          <div className="data-section" style={{ flex: `0 0 ${dataHeight}%` }}>
            <div className="data-header">
              <span className="data-title">DATA</span>
            </div>
            <div className="data-grid">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ISIN</th>
                    <th>DESCRIPTION</th>
                    <th>CLASS</th>
                    <th>MARKET</th>
                    <th>CCY</th>
                    <th>MIN PRICE</th>
                    <th>MAX PRICE</th>
                    <th>AVE. PRICE</th>
                    <th>MIN YIELD</th>
                    <th>MAX YIELD</th>
                    <th>AVE. YIELD</th>
                    <th>SIZE (MM)</th>
                    <th>NOMINAL VALUE</th>
                    <th>NUM. TRADES</th>
                    <th>FIRST PRICE</th>
                    <th>FIRST YIELD</th>
                    <th>LAST PRICE</th>
                    <th>LAST YIELD</th>
                    <th>TRADE TYPE</th>
                    <th>MATURITY</th>
                    <th>RES. MATURITY</th>
                  </tr>
                </thead>
                <tbody>
                  {dataTableRows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="isin-cell">{row.isin}</td>
                      <td className="desc-cell">{row.description}</td>
                      <td>{row.class}</td>
                      <td>{row.market}</td>
                      <td>{row.ccy}</td>
                      <td className="price-cell">{row.minPrice.toFixed(6)}</td>
                      <td className="price-cell">{row.maxPrice.toFixed(6)}</td>
                      <td className="price-cell">{row.avePrice.toFixed(6)}</td>
                      <td className="yield-cell">{row.minYield.toFixed(5)}</td>
                      <td className="yield-cell">{row.maxYield.toFixed(5)}</td>
                      <td className="yield-cell">{row.aveYield.toFixed(5)}</td>
                      <td className="number-cell">{row.sizeMM.toFixed(1)}</td>
                      <td className="number-cell">{row.nominalValue.toFixed(2)}</td>
                      <td className="number-cell">{row.numTrades}</td>
                      <td className="price-cell">{row.firstPrice.toFixed(6)}</td>
                      <td className="yield-cell">{row.firstYield.toFixed(5)}</td>
                      <td className="price-cell">{row.lastPrice.toFixed(6)}</td>
                      <td className="yield-cell">{row.lastYield.toFixed(5)}</td>
                      <td>{row.tradeType}</td>
                      <td>{row.maturity}</td>
                      <td>{row.resMaturity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="resize-handle-vertical" onMouseDown={handleMouseDownVertical} />

        <div className="market-info" style={{ flex: `0 0 ${marketWidth}%` }}>
          <MarketDepth selectedBond={selectedBond} />
        </div>
      </div>
    </div>
  )
}

export default MainContent
