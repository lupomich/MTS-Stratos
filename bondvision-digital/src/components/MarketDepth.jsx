import React, { useState, useMemo, useRef, useEffect } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import './MarketDepth.css'

const mockDealerPricing = [
  { bidTime: '11:59:11', dealer: 'MS', bidAxe: '2', bidSize: '5', bidYield: 0.78, bidPrice: 99.9996, askYield: 2.2301, askPrice: 99.59018, askSize: '4', askAxe: 'D03', dealerAsk: 'MS', askTime: '11:49:21' },
  { bidTime: '12:31:22', dealer: 'UNI', bidAxe: '2', bidSize: '2.5', bidYield: 0.8147, bidPrice: 99.957, askYield: 2.2381, askPrice: 99.59166, askSize: '17', askAxe: 'D06', dealerAsk: 'UNI', askTime: '11:56:52' },
  { bidTime: '12:48:19', dealer: 'MATRIX', bidAxe: '', bidSize: '7', bidYield: 2.2407, bidPrice: 99.58082, askYield: 2.2247, askPrice: 99.59255, askSize: '15', askAxe: 'D11', dealerAsk: 'MATRIX', askTime: '11:48:53' },
  { bidTime: '10:19:16', dealer: '_D01', bidAxe: '', bidSize: '15', bidYield: 2.244, bidPrice: 99.58758, askYield: 2.2244, askPrice: 99.59262, askSize: '5', askAxe: 'D05', dealerAsk: '_D01', askTime: '12:21:35' },
  { bidTime: '11:56:42', dealer: '_D02', bidAxe: '11', bidSize: '17', bidYield: 2.2462, bidPrice: 99.58728, askYield: 2.2134, askPrice: 99.59546, askSize: '7', askAxe: 'D04', dealerAsk: '_D02', askTime: '12:30:19' },
  { bidTime: '10:59:35', dealer: '_D03', bidAxe: '22', bidSize: '', bidYield: 2.2564, bidPrice: 99.58438, askYield: 2.2132, askPrice: 99.59551, askSize: '22', askAxe: 'D10', dealerAsk: '_D03', askTime: '10:59:35' },
  { bidTime: '11:46:21', dealer: '_D04', bidAxe: '4', bidSize: '', bidYield: 2.2566, bidPrice: 99.58432, askYield: 2.2093, askPrice: 99.59651, askSize: '15', askAxe: 'D07', dealerAsk: '_D04', askTime: '10:19:16' },
  { bidTime: '12:12:55', dealer: '_D05', bidAxe: '5', bidSize: '15', bidYield: 2.1591, bidPrice: 99.58300, askYield: 0.6790, askPrice: 99.992, askSize: '', askAxe: '', dealerAsk: '_D05', askTime: '11:59:11' },
  { bidTime: '11:48:53', dealer: '_D06', bidAxe: '15', bidSize: '', bidYield: 2.2603, bidPrice: 99.58338, askYield: 0.6528, askPrice: 99.9979, askSize: '2.5', askAxe: '', dealerAsk: '_D06', askTime: '12:31:22' },
  { bidTime: '09:15:30', dealer: '_D07', bidAxe: '8', bidSize: '10', bidYield: 2.2450, bidPrice: 99.58650, askYield: 2.2180, askPrice: 99.59350, askSize: '12', askAxe: 'D12', dealerAsk: '_D07', askTime: '10:22:15' },
  { bidTime: '13:05:45', dealer: '_D08', bidAxe: '', bidSize: '5.5', bidYield: 2.2520, bidPrice: 99.58500, askYield: 2.2210, askPrice: 99.59280, askSize: '8', askAxe: '', dealerAsk: '_D08', askTime: '12:45:30' },
  { bidTime: '10:40:18', dealer: '_D09', bidAxe: '6', bidSize: '20', bidYield: 2.2480, bidPrice: 99.58600, askYield: 2.2150, askPrice: 99.59450, askSize: '18', askAxe: 'D15', dealerAsk: '_D09', askTime: '11:30:25' },
  { bidTime: '12:25:12', dealer: '_D10', bidAxe: '12', bidSize: '9', bidYield: 2.2390, bidPrice: 99.58850, askYield: 2.2280, askPrice: 99.59120, askSize: '11', askAxe: 'D08', dealerAsk: '_D10', askTime: '11:15:40' },
  { bidTime: '09:50:33', dealer: '_D11', bidAxe: '', bidSize: '14', bidYield: 2.2530, bidPrice: 99.58480, askYield: 2.2200, askPrice: 99.59300, askSize: '16', askAxe: '', dealerAsk: '_D11', askTime: '10:05:50' },
  { bidTime: '11:20:08', dealer: '_D12', bidAxe: '18', bidSize: '6', bidYield: 2.2420, bidPrice: 99.58780, askYield: 2.2260, askPrice: 99.59180, askSize: '7.5', askAxe: 'D09', dealerAsk: '_D12', askTime: '12:10:22' },
  { bidTime: '13:15:27', dealer: '_D13', bidAxe: '9', bidSize: '12.5', bidYield: 2.2470, bidPrice: 99.58680, askYield: 2.2190, askPrice: 99.59380, askSize: '13', askAxe: 'D14', dealerAsk: '_D13', askTime: '12:55:18' },
  { bidTime: '10:10:55', dealer: '_D14', bidAxe: '', bidSize: '8.5', bidYield: 2.2510, bidPrice: 99.58520, askYield: 2.2220, askPrice: 99.59240, askSize: '10', askAxe: '', dealerAsk: '_D14', askTime: '09:45:33' },
  { bidTime: '12:50:40', dealer: '_D15', bidAxe: '14', bidSize: '11', bidYield: 2.2440, bidPrice: 99.58720, askYield: 2.2170, askPrice: 99.59420, askSize: '9', askAxe: 'D16', dealerAsk: '_D15', askTime: '11:25:45' },
  { bidTime: '09:35:22', dealer: '_D16', bidAxe: '7', bidSize: '16', bidYield: 2.2490, bidPrice: 99.58580, askYield: 2.2230, askPrice: 99.59200, askSize: '14', askAxe: 'D13', dealerAsk: '_D16', askTime: '10:50:12' },
  { bidTime: '11:05:17', dealer: '_D17', bidAxe: '', bidSize: '13', bidYield: 2.2460, bidPrice: 99.58690, askYield: 2.2160, askPrice: 99.59480, askSize: '12', askAxe: '', dealerAsk: '_D17', askTime: '12:20:38' },
  { bidTime: '13:30:05', dealer: '_D18', bidAxe: '10', bidSize: '7.5', bidYield: 2.2500, bidPrice: 99.58540, askYield: 2.2240, askPrice: 99.59150, askSize: '8.5', askAxe: 'D17', dealerAsk: '_D18', askTime: '11:40:55' },
  { bidTime: '10:25:48', dealer: '_D19', bidAxe: '16', bidSize: '9.5', bidYield: 2.2430, bidPrice: 99.58800, askYield: 2.2270, askPrice: 99.59080, askSize: '11.5', askAxe: 'D18', dealerAsk: '_D19', askTime: '09:55:20' },
  { bidTime: '12:40:33', dealer: '_D20', bidAxe: '', bidSize: '18', bidYield: 2.2550, bidPrice: 99.58420, askYield: 2.2120, askPrice: 99.59580, askSize: '19', askAxe: '', dealerAsk: '_D20', askTime: '11:10:42' },
  { bidTime: '09:20:15', dealer: '_D21', bidAxe: '13', bidSize: '10.5', bidYield: 2.2410, bidPrice: 99.58820, askYield: 2.2290, askPrice: 99.59040, askSize: '9.5', askAxe: 'D19', dealerAsk: '_D21', askTime: '10:35:28' },
  { bidTime: '11:55:28', dealer: '_D22', bidAxe: '5', bidSize: '12', bidYield: 2.2540, bidPrice: 99.58460, askYield: 2.2140, askPrice: 99.59520, askSize: '13', askAxe: 'D20', dealerAsk: '_D22', askTime: '12:35:50' }
]

const getRandomTime = () => {
  const h = String(Math.floor(Math.random() * 24)).padStart(2, '0')
  const m = String(Math.floor(Math.random() * 60)).padStart(2, '0')
  const s = String(Math.floor(Math.random() * 60)).padStart(2, '0')
  return `${h}:${m}:${s}`
}

const MarketDepth = ({ selectedBond }) => {
  const gridRef = useRef()
  const [rowData, setRowData] = useState(mockDealerPricing)
  const [orderBookData, setOrderBookData] = useState([
    { market: 'MTS', size: 12.5, bidYield: 2.1110, bidPrice: 99.6189, askPrice: 99.6203, askYield: 2.0550, askSize: 12 },
    { market: 'MTS', size: 15.0, bidYield: 2.1142, bidPrice: 99.6146, askPrice: 99.6236, askYield: 2.0820, askSize: 14 },
    { market: 'MTS', size: 8.3, bidYield: 2.1165, bidPrice: 99.6125, askPrice: 99.6255, askYield: 2.0780, askSize: 9 },
    { market: 'MTS', size: 11.2, bidYield: 2.1088, bidPrice: 99.6207, askPrice: 99.6218, askYield: 2.0890, askSize: 10 },
    { market: 'MTS', size: 6.7, bidYield: 2.1205, bidPrice: 99.6095, askPrice: 99.6270, askYield: 2.0650, askSize: 8 }
  ])
  const [ebmOrderBookData, setEbmOrderBookData] = useState([
    { size: 11.0, bidYield: 2.1420, bidPrice: 99.6146, askPrice: 99.6236, askYield: 2.0820, askSize: 14 },
    { size: 9.5, bidYield: 2.1395, bidPrice: 99.6165, askPrice: 99.6225, askYield: 2.0850, askSize: 11 },
    { size: 13.2, bidYield: 2.1450, bidPrice: 99.6132, askPrice: 99.6245, askYield: 2.0780, askSize: 15 },
    { size: 7.8, bidYield: 2.1365, bidPrice: 99.6185, askPrice: 99.6215, askYield: 2.0910, askSize: 10 },
    { size: 10.4, bidYield: 2.1478, bidPrice: 99.6115, askPrice: 99.6260, askYield: 2.0720, askSize: 12 }
  ])
  
  // Collapse/expand states
  const [collapsedSections, setCollapsedSections] = useState({
    mtsOrderBook: false,
    ebmOrderBook: false,
    composite: false,
    dealerPricing: false
  })

  // Aggiorna i dati degli order book ogni 3 secondi
  useEffect(() => {
    const interval = setInterval(() => {
      setOrderBookData(prevData =>
        prevData.map(row => ({
          ...row,
          bidPrice: row.bidPrice + (Math.random() - 0.5) * 0.01,
          askPrice: row.askPrice + (Math.random() - 0.5) * 0.01,
          bidYield: row.bidYield + (Math.random() - 0.5) * 0.005,
          askYield: row.askYield + (Math.random() - 0.5) * 0.005,
          size: Math.max(1, row.size + (Math.random() - 0.5) * 3)
        }))
      )
      setEbmOrderBookData(prevData =>
        prevData.map(row => ({
          ...row,
          bidPrice: row.bidPrice + (Math.random() - 0.5) * 0.01,
          askPrice: row.askPrice + (Math.random() - 0.5) * 0.01,
          bidYield: row.bidYield + (Math.random() - 0.5) * 0.005,
          askYield: row.askYield + (Math.random() - 0.5) * 0.005,
          size: Math.max(1, row.size + (Math.random() - 0.5) * 3)
        }))
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Aggiorna i dati dei dealer pricing ogni 3 secondi
  useEffect(() => {
    const interval = setInterval(() => {
      setRowData(prevData =>
        prevData.map(row => {
          if (Math.random() > 0.6) {
            return {
              ...row,
              bidPrice: row.bidPrice + (Math.random() - 0.5) * 0.02,
              askPrice: row.askPrice + (Math.random() - 0.5) * 0.02,
              bidYield: row.bidYield + (Math.random() - 0.5) * 0.01,
              askYield: row.askYield + (Math.random() - 0.5) * 0.01,
              bidTime: getRandomTime(),
              askTime: getRandomTime(),
              bidSize: String((Math.random() * 30).toFixed(1)),
              askSize: String((Math.random() * 30).toFixed(1))
            }
          }
          return row
        }).sort(() => Math.random() - 0.5) // Shuffle dealers
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Display selected bond or default
  const displayBond = selectedBond || {
    description: 'BTPSi 0.650 15/05/26',
    isin: 'IT0005415416'
  }

  // Toggle section collapse
  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Dealer Pricing column definitions
  const dealerPricingColumnDefs = useMemo(() => [
    { field: 'bidTime', headerName: 'BID TIME', width: 80, cellClass: 'time-cell' },
    { field: 'dealer', headerName: 'DEALER', width: 80, cellClass: 'dealer-cell' },
    { field: 'bidAxe', headerName: 'BID AXE', width: 70 },
    { field: 'bidSize', headerName: 'SIZE', width: 60 },
    { 
      field: 'bidYield', 
      headerName: 'BID YIELD', 
      width: 90,
      cellClass: 'bid-cell',
      valueFormatter: params => params.value?.toFixed(4) || ''
    },
    { 
      field: 'bidPrice', 
      headerName: 'BID PRICE', 
      width: 90,
      cellClass: 'bid-cell',
      valueFormatter: params => params.value?.toFixed(5) || ''
    },
    { 
      field: 'askYield', 
      headerName: 'ASK YIELD', 
      width: 90,
      cellClass: 'ask-cell',
      valueFormatter: params => params.value?.toFixed(4) || ''
    },
    { 
      field: 'askPrice', 
      headerName: 'ASK PRICE', 
      width: 90,
      cellClass: 'ask-cell',
      valueFormatter: params => params.value?.toFixed(5) || ''
    },
    { field: 'askSize', headerName: 'SIZE', width: 60 },
    { field: 'askAxe', headerName: 'ASK AXE', width: 70 },
    { field: 'dealerAsk', headerName: 'DEALER', width: 80, cellClass: 'dealer-cell' },
    { field: 'askTime', headerName: 'ASK TIME', width: 80, cellClass: 'time-cell' }
  ], [])

  // MTS Order Book column definitions
  const mtsColumnDefs = useMemo(() => [
    { field: 'market', headerName: 'MARKET', width: 80 },
    { field: 'size', headerName: 'SIZE', width: 70, valueFormatter: params => params.value?.toFixed(1) || '' },
    { field: 'bidYield', headerName: 'BID YIELD', width: 90, cellClass: 'bid-cell', valueFormatter: params => params.value?.toFixed(4) || '' },
    { field: 'bidPrice', headerName: 'BID PRICE', width: 90, cellClass: 'bid-cell', valueFormatter: params => params.value?.toFixed(4) || '' },
    { field: 'askPrice', headerName: 'ASK PRICE', width: 90, cellClass: 'ask-cell', valueFormatter: params => params.value?.toFixed(4) || '' },
    { field: 'askYield', headerName: 'ASK YIELD', width: 90, cellClass: 'ask-cell', valueFormatter: params => params.value?.toFixed(4) || '' },
    { field: 'askSize', headerName: 'SIZE', width: 70 }
  ], [])

  // EBM Order Book column definitions
  const ebmColumnDefs = useMemo(() => [
    { field: 'size', headerName: 'SIZE', width: 70, valueFormatter: params => params.value?.toFixed(1) || '' },
    { field: 'bidYield', headerName: 'BID YIELD', width: 90, cellClass: 'bid-cell', valueFormatter: params => params.value?.toFixed(4) || '' },
    { field: 'bidPrice', headerName: 'BID PRICE', width: 90, cellClass: 'bid-cell', valueFormatter: params => params.value?.toFixed(4) || '' },
    { field: 'askPrice', headerName: 'ASK PRICE', width: 90, cellClass: 'ask-cell', valueFormatter: params => params.value?.toFixed(4) || '' },
    { field: 'askYield', headerName: 'ASK YIELD', width: 90, cellClass: 'ask-cell', valueFormatter: params => params.value?.toFixed(4) || '' },
    { field: 'askSize', headerName: 'SIZE', width: 70 }
  ], [])

  // Composite column definitions
  const compositeColumnDefs = useMemo(() => [
    { field: 'market', headerName: 'MARKET', width: 80 },
    { field: 'bidAxe', headerName: 'BID AXE', width: 80, cellClass: 'bid-cell' },
    { field: 'bidYield', headerName: 'BID YIELD', width: 90, cellClass: 'bid-cell', valueFormatter: params => params.value?.toFixed(4) || '' },
    { field: 'bidPrice', headerName: 'BID PRICE', width: 90, cellClass: 'bid-cell', valueFormatter: params => params.value?.toFixed(5) || '' },
    { field: 'askPrice', headerName: 'ASK PRICE', width: 90, cellClass: 'ask-cell', valueFormatter: params => params.value?.toFixed(5) || '' },
    { field: 'askYield', headerName: 'ASK YIELD', width: 90, cellClass: 'ask-cell', valueFormatter: params => params.value?.toFixed(4) || '' },
    { field: 'midPrice', headerName: 'MID PRICE', width: 90, valueFormatter: params => params.value?.toFixed(5) || '' },
    { field: 'askAxe', headerName: 'ASK AXE', width: 80, cellClass: 'ask-cell' }
  ], [])

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: 'agTextColumnFilter',
    mainMenuItems: ['sortAscending', 'sortDescending', 'sortUnSort', 'separator', 'columnFilter', 'separator', 'autoSizeThis', 'autoSizeAll', 'resetColumns', 'separator', 'columnChooser']
  }), [])

  const compositeDefaultColDef = useMemo(() => ({
    sortable: false,
    resizable: true,
    filter: false
  }), [])

  return (
    <div className="market-depth">
      <div className="depth-section">
        <div className="section-header">
          <div className="bond-info">
            <span className="bond-isin">{displayBond.description}</span>
            <span className="bond-details">{displayBond.isin}</span>
          </div>
        </div>
        
        <div className="order-book-section">
          <div className="order-book-header" onClick={() => toggleSection('mtsOrderBook')}>
            <span className="collapse-arrow">
              {collapsedSections.mtsOrderBook ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              )}
            </span>
            <div className="order-book-title">MTS Cash Order Book</div>
          </div>
          {!collapsedSections.mtsOrderBook && (
            <div className="ag-theme-alpine-dark order-book-grid">
              <AgGridReact
                rowData={orderBookData}
                columnDefs={mtsColumnDefs}
                defaultColDef={defaultColDef}
                domLayout='normal'
                suppressCellFocus={true}
              />
            </div>
          )}
        </div>

        <div className="order-book-section">
          <div className="order-book-header" onClick={() => toggleSection('ebmOrderBook')}>
            <span className="collapse-arrow">
              {collapsedSections.ebmOrderBook ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              )}
            </span>
            <div className="order-book-title">EBM Order Book</div>
          </div>
          {!collapsedSections.ebmOrderBook && (
            <div className="ag-theme-alpine-dark order-book-grid">
              <AgGridReact
                rowData={ebmOrderBookData}
                columnDefs={ebmColumnDefs}
                defaultColDef={defaultColDef}
                domLayout='normal'
                suppressCellFocus={true}
              />
            </div>
          )}
        </div>

        <div className="composite-section">
          <div className="composite-header" onClick={() => toggleSection('composite')}>
            <span className="collapse-arrow">
              {collapsedSections.composite ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              )}
            </span>
            <span className="composite-title">BondVision Composite</span>
          </div>
          {!collapsedSections.composite && (
            <div className="ag-theme-alpine-dark dealer-grid">
              <AgGridReact
                rowData={[{
                  market: 'BVS',
                  bidAxe: displayBond.bidAxe || '',
                  bidYield: displayBond.bidYield || 2.2565,
                  bidPrice: displayBond.bidPrice || 99.58435,
                  askPrice: displayBond.askPrice || 99.59601,
                  askYield: displayBond.midYield || 2.2113,
                  midPrice: displayBond.midPrice || 99.59018,
                  askAxe: displayBond.askAxe || ''
                }]}
                columnDefs={compositeColumnDefs}
                defaultColDef={compositeDefaultColDef}
                domLayout='autoHeight'
                suppressCellFocus={true}
              />
            </div>
          )}
        </div>

        <div className="dealer-pricing-section">
          <div className="dealer-header" onClick={() => toggleSection('dealerPricing')}>
            <span className="collapse-arrow">
              {collapsedSections.dealerPricing ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              )}
            </span>
            <span className="dealer-title">BondVision Dealer Pricing</span>
          </div>
          {!collapsedSections.dealerPricing && (
            <div className="ag-theme-alpine-dark dealer-pricing-grid">
              <AgGridReact
                ref={gridRef}
                rowData={rowData}
                columnDefs={dealerPricingColumnDefs}
                defaultColDef={defaultColDef}
                domLayout='normal'
                suppressCellFocus={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MarketDepth
