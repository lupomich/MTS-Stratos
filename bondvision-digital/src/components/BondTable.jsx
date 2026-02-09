import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import './BondTable.css'

const BondTable = ({ onSelectBond, countryBonds = [] }) => {
  const gridRef = useRef()
  const [rowData, setRowData] = useState(countryBonds.length > 0 ? countryBonds : [])

  useEffect(() => {
    if (countryBonds.length > 0) {
      // Format bonds once when they change (new country selected)
      const formattedBonds = countryBonds.map(bond => {
        const bidPrice = bond.avePrice - Math.random() * 0.05
        const midPrice = bond.avePrice
        const askPrice = bond.avePrice + Math.random() * 0.05
        
        return {
          description: bond.description,
          isin: bond.isin,
          maturity: bond.maturity,
          ccy: bond.ccy,
          coupon: bond.coupon || 0,
          bidYield: bond.aveYield - Math.random() * 0.05,
          bidPrice: bidPrice,
          bidSprd: midPrice - bidPrice,
          midPrice: midPrice,
          midYield: bond.aveYield,
          askPrice: askPrice,
          askYield: bond.aveYield + Math.random() * 0.05,
          askSprd: askPrice - midPrice
        }
      })
      setRowData(formattedBonds)
    }
  }, [countryBonds])

  const columnDefs = useMemo(() => [
    { 
      field: 'description', 
      headerName: 'DESCRIPTION',
      width: 150,
      cellClass: 'description-cell',
      filter: 'agTextColumnFilter'
    },
    { field: 'isin', headerName: 'ISIN', width: 100, filter: 'agTextColumnFilter' },
    { field: 'ccy', headerName: 'CCY', width: 50, filter: 'agTextColumnFilter' },
    { 
      field: 'bidSprd', 
      headerName: 'BID SPRD',
      width: 80,
      cellClass: 'bid-cell',
      valueFormatter: params => params.value?.toFixed(5) || ''
    },
    { 
      field: 'bidYield', 
      headerName: 'BID YIELD',
      width: 80,
      cellClass: 'bid-cell',
      valueFormatter: params => params.value?.toFixed(4) || ''
    },
    { 
      field: 'bidPrice', 
      headerName: 'BID PRICE',
      width: 80,
      cellClass: 'bid-cell',
      valueFormatter: params => params.value?.toFixed(5) || ''
    },
    { 
      field: 'askPrice', 
      headerName: 'ASK PRICE',
      width: 80,
      cellClass: 'ask-cell',
      valueFormatter: params => params.value?.toFixed(5) || ''
    },
    { 
      field: 'askYield', 
      headerName: 'ASK YIELD',
      width: 80,
      cellClass: 'ask-cell',
      valueFormatter: params => params.value?.toFixed(4) || ''
    },
    { 
      field: 'askSprd', 
      headerName: 'ASK SPRD',
      width: 80,
      cellClass: 'ask-cell',
      valueFormatter: params => params.value?.toFixed(5) || ''
    },
    { 
      field: 'midPrice', 
      headerName: 'MID PRICE',
      width: 80,
      valueFormatter: params => params.value?.toFixed(5) || ''
    },
    { 
      field: 'midYield', 
      headerName: 'MID YIELD',
      width: 80,
      valueFormatter: params => params.value?.toFixed(4) || ''
    },
    { 
      field: 'coupon', 
      headerName: 'COUPON',
      width: 70,
      valueFormatter: params => params.value?.toFixed(3) || ''
    },
    { field: 'maturity', headerName: 'MATURITY', width: 100 }
  ], [])

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: 'agTextColumnFilter',
    mainMenuItems: ['sortAscending', 'sortDescending', 'sortUnSort', 'separator', 'columnFilter', 'separator', 'autoSizeThis', 'autoSizeAll', 'resetColumns', 'separator', 'columnChooser']
  }), [])

  const onRowClicked = useCallback((event) => {
    onSelectBond(event.data)
  }, [onSelectBond])

  // Update ONLY price fields every 3 seconds (no description updates)
  useEffect(() => {
    const interval = setInterval(() => {
      setRowData(prevData =>
        prevData.map(row => {
          if (Math.random() > 0.7) {
            const bidPriceChange = (Math.random() - 0.5) * 0.02
            const askPriceChange = (Math.random() - 0.5) * 0.02
            const bidYieldChange = (Math.random() - 0.5) * 0.01
            const askYieldChange = (Math.random() - 0.5) * 0.01
            
            const newBidPrice = row.bidPrice + bidPriceChange
            const newAskPrice = row.askPrice + askPriceChange
            const newMidPrice = (newBidPrice + newAskPrice) / 2
            
            return {
              ...row,
              bidPrice: newBidPrice,
              bidYield: row.bidYield + bidYieldChange,
              askPrice: newAskPrice,
              askYield: row.askYield + askYieldChange,
              midPrice: newMidPrice,
              midYield: row.midYield + (bidYieldChange + askYieldChange) / 2,
              bidSprd: newMidPrice - newBidPrice,
              askSprd: newAskPrice - newMidPrice
            }
          }
          return row
        })
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bond-table-container">
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
