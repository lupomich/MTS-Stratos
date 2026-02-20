import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import BondTable from './BondTable'
import MarketDepth from './MarketDepth'
import { getRandomBonds, generatePriceData, getCountryName } from '../data/governmentBonds'
import './MainContent.css'
import sortAscendingIcon from '../icons/sortAscending.svg'
import sortDescendingIcon from '../icons/sortDescending.svg'

const checkIcon = <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>

// Sort icons for context menu
const sortAscendingIconSvg = <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2V14M8 2L5 5M8 2L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
const sortDescendingIconSvg = <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 14V2M8 14L5 11M8 14L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>

const topTabs = [
  { code: 'ALL', name: 'All', flag: null },
  { code: 'AXED', name: 'Axed', flag: checkIcon, hasCheck: true },
  { code: 'BV', name: 'BV', flag: checkIcon, hasCheck: true }
]

const countries = [
  { code: 'EU', name: 'EU', countryCode: 'eu', flag: `https://flagcdn.com/16x12/eu.png` },
  { code: 'AT', name: 'Austria', countryCode: 'at', flag: `https://flagcdn.com/16x12/at.png` },
  { code: 'BE', name: 'Belgium', countryCode: 'be', flag: `https://flagcdn.com/16x12/be.png` },
  { code: 'ES', name: 'Spain', countryCode: 'es', flag: `https://flagcdn.com/16x12/es.png` },
  { code: 'FR', name: 'France', countryCode: 'fr', flag: `https://flagcdn.com/16x12/fr.png` },
  { code: 'DE', name: 'Germany', countryCode: 'de', flag: `https://flagcdn.com/16x12/de.png` },
  { code: 'GR', name: 'Greece', countryCode: 'gr', flag: `https://flagcdn.com/16x12/gr.png` },
  { code: 'IE', name: 'Ireland', countryCode: 'ie', flag: `https://flagcdn.com/16x12/ie.png` },
  { code: 'IT', name: 'Italy', countryCode: 'it', flag: `https://flagcdn.com/16x12/it.png` },
  { code: 'LU', name: 'Luxembourg', countryCode: 'lu', flag: `https://flagcdn.com/16x12/lu.png` },
  { code: 'NL', name: 'Netherlands', countryCode: 'nl', flag: `https://flagcdn.com/16x12/nl.png` },
  { code: 'PT', name: 'Portugal', countryCode: 'pt', flag: `https://flagcdn.com/16x12/pt.png` },
  { code: 'RO', name: 'Romania', countryCode: 'ro', flag: `https://flagcdn.com/16x12/ro.png` },
  { code: 'SE', name: 'Sweden', countryCode: 'se', flag: `https://flagcdn.com/16x12/se.png` },
  { code: 'UK', name: 'UK', countryCode: 'gb', flag: `https://flagcdn.com/16x12/gb.png` },
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
  const [selectedTopTab, setSelectedTopTab] = useState('ALL')
  const [selectedCountry, setSelectedCountry] = useState('IT')
  const [expandedRFQ, setExpandedRFQ] = useState(false)
  const [selectedRFQ, setSelectedRFQ] = useState('RFQ OUTRIGHT')
  const [searchTerm, setSearchTerm] = useState('')
  const [dataTableRows, setDataTableRows] = useState([])
  const priceUpdateIntervalRef = useRef(null)
  
  // State per il resize dinamico
  const [tradingWidth, setTradingWidth] = useState(60) // percentage
  const [marketWidth, setMarketWidth] = useState(40) // percentage
  const [dataHeight, setDataHeight] = useState(35) // percentage
  const [isDraggingVertical, setIsDraggingVertical] = useState(false)
  const [isDraggingHorizontal, setIsDraggingHorizontal] = useState(false)
  const contentBodyRef = useRef(null)
  const mainContentRef = useRef(null)

  // Carica bond casuali quando cambia il paese
  useEffect(() => {
    const randomCount = Math.floor(Math.random() * (30 - 10 + 1)) + 10
    const countryName = getCountryName(selectedCountry)
    const bonds = getRandomBonds(countryName, randomCount)
    const dataBonds = bonds.map(bond => generatePriceData(bond))
    setDataTableRows(dataBonds)
  }, [selectedCountry])

  // Handle resize verticale (trading area vs market depth)
  const handleMouseDownVertical = useCallback((e) => {
    e.preventDefault()
    setIsDraggingVertical(true)
  }, [])

  const handleMouseUpVertical = useCallback(() => {
    setIsDraggingVertical(false)
  }, [])

  const handleMouseMoveVertical = useCallback((e) => {
    if (!isDraggingVertical || !contentBodyRef.current) return
    e.preventDefault()

    const rect = contentBodyRef.current.getBoundingClientRect()
    const newWidth = ((e.clientX - rect.left) / rect.width) * 100

    if (newWidth > 20 && newWidth < 80) {
      setTradingWidth(newWidth)
      setMarketWidth(100 - newWidth)
    }
  }, [isDraggingVertical])

  // Handle resize orizzontale (content vs data)
  const handleMouseDownHorizontal = useCallback((e) => {
    e.preventDefault()
    setIsDraggingHorizontal(true)
  }, [])

  const handleMouseUpHorizontal = useCallback(() => {
    setIsDraggingHorizontal(false)
  }, [])

  const handleMouseMoveHorizontal = useCallback((e) => {
    if (!isDraggingHorizontal || !mainContentRef.current) return
    e.preventDefault()

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

  // Previeni selezione testo durante drag
  React.useEffect(() => {
    if (isDraggingVertical || isDraggingHorizontal) {
      document.body.style.userSelect = 'none'
      document.body.style.cursor = isDraggingVertical ? 'col-resize' : 'row-resize'
    } else {
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [isDraggingVertical, isDraggingHorizontal])

  // Column definitions for DATA table
  const dataColumnDefs = useMemo(() => [
    { field: 'isin', headerName: 'ISIN', width: 120 },
    { field: 'description', headerName: 'DESCRIPTION', width: 180 },
    { field: 'class', headerName: 'CLASS', width: 80 },
    { field: 'market', headerName: 'MARKET', width: 100 },
    { field: 'ccy', headerName: 'CCY', width: 60 },
    { field: 'minPrice', headerName: 'MIN PRICE', width: 100, valueFormatter: params => params.value?.toFixed(6) || '' },
    { field: 'maxPrice', headerName: 'MAX PRICE', width: 100, valueFormatter: params => params.value?.toFixed(6) || '' },
    { field: 'avePrice', headerName: 'AVE. PRICE', width: 100, valueFormatter: params => params.value?.toFixed(6) || '' },
    { field: 'minYield', headerName: 'MIN YIELD', width: 100, valueFormatter: params => params.value?.toFixed(5) || '' },
    { field: 'maxYield', headerName: 'MAX YIELD', width: 100, valueFormatter: params => params.value?.toFixed(5) || '' },
    { field: 'aveYield', headerName: 'AVE. YIELD', width: 100, valueFormatter: params => params.value?.toFixed(5) || '' },
    { field: 'sizeMM', headerName: 'SIZE (MM)', width: 100, valueFormatter: params => params.value?.toFixed(1) || '' },
    { field: 'nominalValue', headerName: 'NOMINAL VALUE', width: 130, valueFormatter: params => params.value?.toFixed(2) || '' },
    { field: 'numTrades', headerName: 'NUM. TRADES', width: 110 },
    { field: 'firstPrice', headerName: 'FIRST PRICE', width: 100, valueFormatter: params => params.value?.toFixed(6) || '' },
    { field: 'firstYield', headerName: 'FIRST YIELD', width: 100, valueFormatter: params => params.value?.toFixed(5) || '' },
    { field: 'lastPrice', headerName: 'LAST PRICE', width: 100, valueFormatter: params => params.value?.toFixed(6) || '' },
    { field: 'lastYield', headerName: 'LAST YIELD', width: 100, valueFormatter: params => params.value?.toFixed(5) || '' },
    { field: 'tradeType', headerName: 'TRADE TYPE', width: 100 },
    { field: 'maturity', headerName: 'MATURITY', width: 100 },
    { field: 'resMaturity', headerName: 'RES. MATURITY', width: 120 }
  ], [])

  const getMainMenuItems = useCallback((params) => {
    const defaultItems = params.defaultItems || [
      'sortAscending',
      'sortDescending',
      'sortUnSort',
      'separator',
      'columnFilter',
      'separator',
      'autoSizeThis',
      'autoSizeAll',
      'resetColumns',
      'separator',
      'columnChooser'
    ]

    // Customize menu items with icons
    return defaultItems.map(item => {
      if (item === 'sortAscending') {
        return {
          name: 'Sort Ascending',
          icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block;">
            <path d="M8 2V14M8 2L5 5M8 2L11 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`,
          action: () => params.api.applySortModel([{ colId: params.column?.colId || '', sort: 'asc' }])
        }
      }
      if (item === 'sortDescending') {
        return {
          name: 'Sort Descending',
          icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block;">
            <path d="M8 14V2M8 14L5 11M8 14L11 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`,
          action: () => params.api.applySortModel([{ colId: params.column?.colId || '', sort: 'desc' }])
        }
      }
      return item
    })
  }, [])

  const dataDefaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: 'agTextColumnFilter',
    getMainMenuItems: getMainMenuItems
  }), [getMainMenuItems])

  return (
    <div className="main-content" ref={mainContentRef}>
      <div className="rfq-toolbar">
        <div className="toolbar-left">
          <div className="rfq-dropdown">
            <button className={`rfq-button ${expandedRFQ ? 'expanded' : ''}`} onClick={() => setExpandedRFQ(!expandedRFQ)}>
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
          <input 
            type="text" 
            placeholder="Search Bonds..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="toolbar-right">
          <button className="rfq-toolbar-button">RFQ TOOLBAR</button>
        </div>
      </div>

      <div className="top-tabs">
        {topTabs.map((t, i) => (
          <button
            key={`top-${t.code}-${i}`}
            className={`country-tab ${selectedTopTab === t.code ? 'active' : ''}`}
            onClick={() => setSelectedTopTab(t.code)}
            title={t.name}
          >
            <span className="flag">{t.flag}</span>
            <span className="code">{t.code}</span>
          </button>
        ))}
      </div>

      <div className="country-tabs">
        <div className="gov-selector-container">
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
            className={`country-tab ${country.code === '+' ? 'country-add' : ''} ${selectedCountry === country.code ? 'active' : ''}`}
            onClick={() => setSelectedCountry(country.code)}
            title={country.name}
          >
            {country.flag && (
              <img src={country.flag} alt={country.code} className="country-flag-img" />
            )}
            {!country.flag && country.code !== '+' && (
              <span className="flag-placeholder">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </span>
            )}
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

          <BondTable onSelectBond={setSelectedBond} countryBonds={dataTableRows} searchTerm={searchTerm} />

          <div className="resize-handle-horizontal" onMouseDown={handleMouseDownHorizontal} />

          <div className="data-section" style={{ flex: `0 0 ${dataHeight}%` }}>
            <div className="data-header">
              <span className="data-title">DATA</span>
            </div>
            <div className="ag-theme-alpine-dark data-grid">
              <AgGridReact
                rowData={dataTableRows}
                columnDefs={dataColumnDefs}
                defaultColDef={dataDefaultColDef}
                domLayout='normal'
                suppressCellFocus={true}
              />
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
