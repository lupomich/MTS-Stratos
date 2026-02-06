import React, { useState, useMemo, useRef, useCallback } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import './BondTable.css'

const mockBonds = [
  { description: 'BTPSi 0.650 15/05/26', isin: 'IT0005415416', res: '0.5 yr', maturity: '98', resDays: '', ccy: 'EUR', bidYield: 2.2565, bidPrice: 99.58435, midPrice: 99.59018, midYield: 2.2339, askPrice: 99.59601 },
  { description: 'BTPSi 3.100 15/09/26', isin: 'IT0004735152', res: '01 yr', maturity: '221', resDays: '', ccy: 'EUR', bidYield: -0.8765, bidPrice: 102.36397, midPrice: 102.36837, midYield: -0.8841, askPrice: 102.37277 },
  { description: 'BTPSi 1.300 15/05/28', isin: 'IT0005246154', res: '03 yr', maturity: '829', resDays: '', ccy: 'EUR', bidYield: -0.6449, bidPrice: 101.46919, midPrice: 101.47358, midYield: -0.6428, askPrice: 101.47797 },
  { description: 'BTPSi 1.500 15/05/29', isin: 'IT0005343803', res: '03 yr', maturity: '1194', resDays: '', ccy: 'EUR', bidYield: 0.7723, bidPrice: 102.34233, midPrice: 102.34233, midYield: 0.7723, askPrice: 102.34233 },
  { description: 'BTPSi 0.400 15/05/30', isin: 'IT0005387052', res: '04 yr', maturity: '1559', resDays: '', ccy: 'EUR', bidYield: 0.8366, bidPrice: 97.98659, midPrice: 97.99189, midYield: 0.8033, askPrice: 97.99719 },
  { description: 'BTPSi 1.100 15/05/31', isin: 'IT0005438225', res: '05 yr', maturity: '1924', resDays: '', ccy: 'EUR', bidYield: 0.9534, bidPrice: 100.53328, midPrice: 100.53898, midYield: 0.9498, askPrice: 100.54468 },
  { description: 'BTPSi 1.250 15/09/32', isin: 'IT0005138928', res: '06 yr', maturity: '2415', resDays: '', ccy: 'EUR', bidYield: 0.9954, bidPrice: 101.99445, midPrice: 101.99489, midYield: 1.0093, askPrice: 101.99533 },
  { description: 'BTPSi 1.100 15/05/33', isin: 'IT0005462894', res: '07 yr', maturity: '2653', resDays: '', ccy: 'EUR', bidYield: 1.8976, bidPrice: 101.08291, midPrice: 101.09218, midYield: 1.3074, askPrice: 101.10145 },
  { description: 'BTPEi 2.350 15/09/35', isin: 'IT0003745541', res: '10 yr', maturity: '3508', resDays: '', ccy: 'EUR', bidYield: 1.3282, bidPrice: 109.20731, midPrice: 109.21919, midYield: 1.3269, askPrice: 109.23107 },
  { description: 'BTPcli 1.800 15/05/36', isin: 'IT0005288881', res: '10 yr', maturity: '3751', resDays: '', ccy: 'EUR', bidYield: 1.6459, bidPrice: 101.51314, midPrice: 101.51514, midYield: 1.6459, askPrice: 101.51714 },
  { description: 'BTPEi 2.400 15/05/37', isin: 'IT0005547812', res: '15 yr', maturity: '4846', resDays: '', ccy: 'EUR', bidYield: 1.8565, bidPrice: 106.09902, midPrice: 106.09902, midYield: 1.8565, askPrice: 106.09902 },
  { description: 'BTPcli 2.550 19/09/41', isin: 'IT0004644880', res: '20 yr', maturity: '5700', resDays: '', ccy: 'EUR', bidYield: 1.8835, bidPrice: 109.79104, midPrice: 109.79104, midYield: 1.8335, askPrice: 109.79104 },
  { description: 'BTPSi 0.150 15/05/51', isin: 'IT0005436701', res: '25 yr', maturity: '9229', resDays: '', ccy: 'EUR', bidYield: 2.0845, bidPrice: 62.32352, midPrice: 62.32352, midYield: 2.0845, askPrice: 62.32352 },
  { description: 'BTPcli 2.550 19/09/56', isin: 'IT0005647473', res: '30 yr', maturity: '11056', resDays: '', ccy: 'EUR', bidYield: 2.3773, bidPrice: 104.01438, midPrice: 104.01438, midYield: 2.3773, askPrice: 104.01438 }
]

const BondTable = ({ onSelectBond }) => {
  const gridRef = useRef()
  const [rowData, setRowData] = useState(mockBonds)

  const columnDefs = useMemo(() => [
    { 
      field: 'description', 
      headerName: 'DESCRIPTION',
      width: 180,
      cellClass: 'description-cell'
    },
    { field: 'isin', headerName: 'ISIN', width: 120 },
    { field: 'res', headerName: 'RES', width: 80 },
    { field: 'maturity', headerName: 'MATURITY', width: 100 },
    { field: 'resDays', headerName: 'RES. MATURITY DAYS', width: 150 },
    { field: 'ccy', headerName: 'CCY', width: 70 },
    { 
      field: 'bidYield', 
      headerName: 'BID YIELD',
      width: 100,
      cellClass: 'bid-cell',
      valueFormatter: params => params.value?.toFixed(4) || ''
    },
    { 
      field: 'bidPrice', 
      headerName: 'BID PRICE',
      width: 100,
      cellClass: 'bid-cell',
      valueFormatter: params => params.value?.toFixed(5) || ''
    },
    { 
      field: 'midPrice', 
      headerName: 'MID PRICE',
      width: 100,
      valueFormatter: params => params.value?.toFixed(5) || ''
    },
    { 
      field: 'midYield', 
      headerName: 'MID YIELD',
      width: 100,
      valueFormatter: params => params.value?.toFixed(4) || ''
    },
    { 
      field: 'askPrice', 
      headerName: 'ASK PRICE',
      width: 100,
      cellClass: 'ask-cell',
      valueFormatter: params => params.value?.toFixed(5) || ''
    }
  ], [])

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true
  }), [])

  const onRowClicked = useCallback((event) => {
    onSelectBond(event.data)
  }, [onSelectBond])

  // Simulate real-time price updates
  const updatePrices = useCallback(() => {
    setRowData(prevData => 
      prevData.map(row => {
        if (Math.random() > 0.7) {
          const change = (Math.random() - 0.5) * 0.02
          return {
            ...row,
            bidPrice: row.bidPrice + change,
            askPrice: row.askPrice + change
          }
        }
        return row
      })
    )
  }, [])

  // Update prices every 2 seconds
  React.useEffect(() => {
    const interval = setInterval(updatePrices, 2000)
    return () => clearInterval(interval)
  }, [updatePrices])

  return (
    <div className="bond-table-container">
      <div className="table-header">
        <div className="table-title">OPEN RFQ</div>
        <div className="table-filters">
          <span className="filter-label">ALL</span>
          <span className="filter-label">AXED ☑</span>
          <span className="filter-label">BV ☑</span>
        </div>
      </div>
      <div className="ag-theme-alpine-dark bond-grid">
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowSelection="single"
          onRowClicked={onRowClicked}
          animateRows={true}
          suppressCellFocus={true}
        />
      </div>
    </div>
  )
}

export default BondTable
