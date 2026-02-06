import React, { useState, useMemo, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import './MarketDepth.css'

const mockDealerPricing = [
  { bidTime: '11:59:11', dealer: 'MS', bidAxe: '2', bidSize: '5', bidYield: 0.78, bidPrice: 99.9996, askYield: 2.2301, askPrice: 99.59018, askSize: '4', askAxe: 'D03', dealerAsk: 'MS', askTime: '11:49:21' },
  { bidTime: '12:31:22', dealer: 'MS', bidAxe: '2', bidSize: '2.5', bidYield: 0.8147, bidPrice: 99.957, askYield: 2.2381, askPrice: 99.59166, askSize: '17', askAxe: 'D06', dealerAsk: 'UNI', askTime: '11:56:52' },
  { bidTime: '12:48:19', dealer: 'UNI', bidAxe: '', bidSize: '7', bidYield: 2.2407, bidPrice: 99.58082, askYield: 2.2247, askPrice: 99.59255, askSize: '15', askAxe: 'D11', dealerAsk: '_D05', askTime: '11:48:53' },
  { bidTime: '10:19:16', dealer: '_D07', bidAxe: '', bidSize: '15', bidYield: 2.244, bidPrice: 99.58758, askYield: 2.2244, askPrice: 99.59262, askSize: '5', askAxe: 'D05', dealerAsk: '_D04', askTime: '12:21:35' },
  { bidTime: '11:56:42', dealer: '_D06', bidAxe: '11', bidSize: '17', bidYield: 2.2462, bidPrice: 99.58728, askYield: 2.2134, askPrice: 99.59546, askSize: '7', askAxe: 'D04', dealerAsk: '_D10', askTime: '12:30:19' },
  { bidTime: '10:59:35', dealer: '_D10', bidAxe: '22', bidSize: '', bidYield: 2.2564, bidPrice: 99.58438, askYield: 2.2132, askPrice: 99.59551, askSize: '22', askAxe: 'D10', dealerAsk: '_D03', askTime: '10:59:35' },
  { bidTime: '11:46:21', dealer: '_D03', bidAxe: '4', bidSize: '', bidYield: 2.2566, bidPrice: 99.58432, askYield: 2.2093, askPrice: 99.59651, askSize: '15', askAxe: 'D07', dealerAsk: 'MATRIX', askTime: '10:19:16' },
  { bidTime: '12:12:55', dealer: '_D03', bidAxe: '5', bidSize: '15', bidYield: 2.1591, bidPrice: 99.58300, askYield: 0.6790, askPrice: 99.992, askSize: '', askAxe: 'MATRIX', dealerAsk: 'MS', askTime: '11:59:11' },
  { bidTime: '11:48:53', dealer: '_D11', bidAxe: '15', bidSize: '', bidYield: 2.2603, bidPrice: 99.58338, askYield: 0.6528, askPrice: 99.9979, askSize: '2.5', askAxe: 'MS', dealerAsk: 'MS', askTime: '12:31:22' }
]

const MarketDepth = ({ selectedBond }) => {
  const gridRef = useRef()
  const [rowData] = useState(mockDealerPricing)
  
  // Collapse/expand states
  const [collapsedSections, setCollapsedSections] = useState({
    mtsOrderBook: false,
    ebmOrderBook: false,
    composite: false,
    dealerPricing: false
  })

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

  // Get unique dealers (one per row)
  const uniqueDealerRows = useMemo(() => {
    const seen = new Set()
    return rowData.filter(row => {
      const key = row.dealer
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [rowData])

  const columnDefs = useMemo(() => [
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

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true
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
            <>
              <table className="order-book-table">
                <thead>
                  <tr>
                    <th>MARKET</th>
                    <th>SIZE</th>
                    <th>BID YIELD</th>
                    <th>BID PRICE</th>
                    <th>ASK PRICE</th>
                    <th>ASK YIELD</th>
                    <th>SIZE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>MTS</td>
                    <td>12.5</td>
                    <td className="bid-val">2.1110</td>
                    <td className="bid-val">99.6189</td>
                    <td className="ask-val">99.6203</td>
                    <td className="ask-val">2.0550</td>
                    <td>12</td>
                  </tr>
                  <tr>
                    <td>MTS</td>
                    <td>15.0</td>
                    <td className="bid-val">2.1142</td>
                    <td className="bid-val">99.6146</td>
                    <td className="ask-val">99.6236</td>
                    <td className="ask-val">2.0820</td>
                    <td>14</td>
                  </tr>
                  <tr>
                    <td>MTS</td>
                    <td>8.3</td>
                    <td className="bid-val">2.1165</td>
                    <td className="bid-val">99.6125</td>
                    <td className="ask-val">99.6255</td>
                    <td className="ask-val">2.0780</td>
                    <td>9</td>
                  </tr>
                  <tr>
                    <td>MTS</td>
                    <td>11.2</td>
                    <td className="bid-val">2.1088</td>
                    <td className="bid-val">99.6207</td>
                    <td className="ask-val">99.6218</td>
                    <td className="ask-val">2.0890</td>
                    <td>10</td>
                  </tr>
                  <tr>
                    <td>MTS</td>
                    <td>6.7</td>
                    <td className="bid-val">2.1205</td>
                    <td className="bid-val">99.6095</td>
                    <td className="ask-val">99.6270</td>
                    <td className="ask-val">2.0650</td>
                    <td>8</td>
                  </tr>
                </tbody>
              </table>
              <div className="order-book-footer">
                <div className="footer-row">LAST TIME (LOCAL) <span>LAST SIZE</span> <span>TOTAL SIZE</span> <span>LAST YIELD</span> <span>LAST PRICE</span> <span>TREND</span></div>
              </div>
            </>
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
            <>
              <table className="order-book-table">
                <thead>
                  <tr>
                    <th>SIZE</th>
                    <th>BID YIELD</th>
                    <th>BID PRICE</th>
                    <th>ASK PRICE</th>
                    <th>ASK YIELD</th>
                    <th>SIZE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>11.0</td>
                    <td className="bid-val">2.1420</td>
                    <td className="bid-val">99.6146</td>
                    <td className="ask-val">99.6236</td>
                    <td className="ask-val">2.0820</td>
                    <td>14</td>
                  </tr>
                  <tr>
                    <td>9.5</td>
                    <td className="bid-val">2.1395</td>
                    <td className="bid-val">99.6165</td>
                    <td className="ask-val">99.6225</td>
                    <td className="ask-val">2.0850</td>
                    <td>11</td>
                  </tr>
                  <tr>
                    <td>13.2</td>
                    <td className="bid-val">2.1450</td>
                    <td className="bid-val">99.6132</td>
                    <td className="ask-val">99.6245</td>
                    <td className="ask-val">2.0780</td>
                    <td>15</td>
                  </tr>
                  <tr>
                    <td>7.8</td>
                    <td className="bid-val">2.1365</td>
                    <td className="bid-val">99.6185</td>
                    <td className="ask-val">99.6215</td>
                    <td className="ask-val">2.0910</td>
                    <td>10</td>
                  </tr>
                  <tr>
                    <td>10.4</td>
                    <td className="bid-val">2.1478</td>
                    <td className="bid-val">99.6115</td>
                    <td className="ask-val">99.6260</td>
                    <td className="ask-val">2.0720</td>
                    <td>12</td>
                  </tr>
                </tbody>
              </table>
              <div className="order-book-footer">
                <div className="footer-row">LAST TIME (LOCAL) <span>LAST SIZE</span> <span>TOTAL SIZE</span> <span>LAST YIELD</span> <span>LAST PRICE</span> <span>TREND</span></div>
              </div>
            </>
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
            <div className="composite-grid">
              <div className="composite-row composite-header-row">
                <div className="comp-label">MARKET</div>
                <div className="comp-label">BID AXE</div>
                <div className="comp-label">BID YIELD</div>
                <div className="comp-label">BID PRICE</div>
                <div className="comp-label">ASK PRICE</div>
                <div className="comp-label">ASK YIELD</div>
                <div className="comp-label">MID PRICE</div>
                <div className="comp-label">ASK AXE</div>
              </div>
              <div className="composite-row">
                <div className="comp-value market-label">BVS</div>
                <div className="comp-value bid-axe">{displayBond.bidAxe || ''}</div>
                <div className="comp-value bid-val">{displayBond.bidYield?.toFixed(4) || '2.2565'}</div>
                <div className="comp-value bid-val">{displayBond.bidPrice?.toFixed(5) || '99.58435'}</div>
                <div className="comp-value ask-val">{displayBond.askPrice?.toFixed(5) || '99.59601'}</div>
                <div className="comp-value ask-val">{displayBond.midYield?.toFixed(4) || '2.2113'}</div>
                <div className="comp-value">{displayBond.midPrice?.toFixed(5) || '99.59018'}</div>
                <div className="comp-value ask-axe">{displayBond.askAxe || ''}</div>
              </div>
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
            <div className="ag-theme-alpine-dark dealer-grid">
              <AgGridReact
                ref={gridRef}
                rowData={uniqueDealerRows}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                domLayout='autoHeight'
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
