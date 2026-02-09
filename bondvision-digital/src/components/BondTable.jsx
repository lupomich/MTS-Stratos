import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { useLanguage } from '../context/LanguageContext'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import './BondTable.css'

// Custom Header Component with Full Menu
class CustomHeaderWithMenu {
  init(params) {
    this.params = params
    this.colId = params.column.getColId()
    this.menuOpen = false
    this.eGui = document.createElement('div')
    this.eGui.className = 'custom-header-wrapper'
    this.eGui.innerHTML = `
      <span class="header-text">${params.displayName}</span>
      <span class="header-menu-icon" title="Menu colonna">☰</span>
    `
    this.eMenuIcon = this.eGui.querySelector('.header-menu-icon')
    this.eMenuIcon.addEventListener('click', (e) => this.onMenuClicked(e))
    
    // Chiudi menu quando si clicca altrove
    this.documentClickListener = (e) => {
      if (this.menu && !this.menu.contains(e.target)) {
        this.destroyMenu()
      }
    }
  }
  
  getGui() {
    return this.eGui
  }
  
  onMenuClicked(e) {
    e.stopPropagation()
    
    // Toggle: se il menu è già aperto, chiudilo
    if (this.menuOpen) {
      this.destroyMenu()
      return
    }
    
    this.createMenu(e)
  }
  
  createMenu(e) {
    this.menu = document.createElement('div')
    this.menu.className = 'ag-custom-menu-popup'
    this.menuOpen = true
    
    const isVisible = this.params.columnApi.getColumn(this.colId).isVisible()
    const isPinned = this.params.columnApi.getColumn(this.colId).getPinned()
    const t = this.params.context.t
    
    this.menu.innerHTML = `
      <div class="menu-item" data-action="filter">
        <span class="menu-icon">🔍</span>
        <span>${t('columnMenu.filter')}</span>
      </div>
      <div class="menu-item" data-action="clearFilters">
        <span class="menu-icon">✕</span>
        <span>${t('bondTable.clearFilters')}</span>
      </div>
      <div class="menu-separator"></div>
      <div class="menu-item" data-action="sortAsc">
        <span class="menu-icon">↑</span>
        <span>${t('columnMenu.sortAsc')}</span>
      </div>
      <div class="menu-item" data-action="sortDesc">
        <span class="menu-icon">↓</span>
        <span>${t('columnMenu.sortDesc')}</span>
      </div>
      <div class="menu-item" data-action="sortNone">
        <span class="menu-icon">⊗</span>
        <span>${t('columnMenu.sortNone')}</span>
      </div>
      <div class="menu-separator"></div>
      <div class="menu-item" data-action="autosizeThis">
        <span class="menu-icon">↔</span>
        <span>${t('columnMenu.autosizeThis')}</span>
      </div>
      <div class="menu-item" data-action="autosizeAll">
        <span class="menu-icon">⇔</span>
        <span>${t('columnMenu.autosizeAll')}</span>
      </div>
      <div class="menu-separator"></div>
      <div class="menu-item" data-action="pinLeft">
        <span class="menu-icon">📌</span>
        <span>${t('columnMenu.pinLeft')}</span>
      </div>
      <div class="menu-item" data-action="pinRight">
        <span class="menu-icon">📌</span>
        <span>${t('columnMenu.pinRight')}</span>
      </div>
      ${isPinned ? `<div class="menu-item" data-action="unpin"><span class="menu-icon">📍</span><span>${t('columnMenu.unpin')}</span></div>` : ''}
      <div class="menu-separator"></div>
      <div class="menu-item" data-action="resetColumn">
        <span class="menu-icon">↺</span>
        <span>${t('columnMenu.resetColumn')}</span>
      </div>
      <div class="menu-item" data-action="resetAll">
        <span class="menu-icon">⟲</span>
        <span>${t('columnMenu.resetAll')}</span>
      </div>
    `
    
    // Event listeners per ogni menu item
    this.menu.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', (ev) => {
        ev.stopPropagation()
        const action = ev.currentTarget.getAttribute('data-action')
        this.handleAction(action)
        this.destroyMenu()
      })
    })
    
    document.body.appendChild(this.menu)
    
    // Posiziona il menu
    const rect = this.eMenuIcon.getBoundingClientRect()
    this.menu.style.left = rect.left + 'px'
    this.menu.style.top = (rect.bottom + 2) + 'px'
    
    // Aggiungi listener per chiudere
    setTimeout(() => {
      document.addEventListener('click', this.documentClickListener)
    }, 0)
  }
  
  handleAction(action) {
    const { api, columnApi, column } = this.params
    
    switch(action) {
      case 'filter':
        this.params.showColumnMenu(this.eMenuIcon)
        break
      case 'clearFilters':
        api.setFilterModel(null)
        api.onFilterChanged()
        break
      case 'sortAsc':
        columnApi.applyColumnState({
          state: [{ colId: this.colId, sort: 'asc' }],
          defaultState: { sort: null }
        })
        break
      case 'sortDesc':
        columnApi.applyColumnState({
          state: [{ colId: this.colId, sort: 'desc' }],
          defaultState: { sort: null }
        })
        break
      case 'sortNone':
        columnApi.applyColumnState({
          state: [{ colId: this.colId, sort: null }]
        })
        break
      case 'autosizeThis':
        columnApi.autoSizeColumn(this.colId)
        break
      case 'autosizeAll':
        const allColumnIds = columnApi.getAllColumns().map(col => col.getColId())
        columnApi.autoSizeColumns(allColumnIds)
        break
      case 'pinLeft':
        columnApi.setColumnPinned(this.colId, 'left')
        break
      case 'pinRight':
        columnApi.setColumnPinned(this.colId, 'right')
        break
      case 'unpin':
        columnApi.setColumnPinned(this.colId, null)
        break
      case 'resetColumn':
        columnApi.applyColumnState({
          state: [{ colId: this.colId, sort: null }]
        })
        columnApi.setColumnPinned(this.colId, null)
        api.destroyFilter(this.colId)
        break
      case 'resetAll':
        columnApi.resetColumnState()
        api.setFilterModel(null)
        break
    }
  }
  
  destroyMenu() {
    if (this.menu && this.menu.parentNode) {
      document.removeEventListener('click', this.documentClickListener)
      document.body.removeChild(this.menu)
      this.menu = null
      this.menuOpen = false
    }
  }
  
  destroy() {
    this.destroyMenu()
    if (this.eMenuIcon) {
      this.eMenuIcon.removeEventListener('click', this.onMenuClicked)
    }
  }
}

const BondTable = ({ onSelectBond, countryBonds = [] }) => {
  const gridRef = useRef()
  const { t, language } = useLanguage()
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
      filter: 'agTextColumnFilter',
      headerComponent: CustomHeaderWithMenu
    },
    { 
      field: 'isin', 
      headerName: 'ISIN', 
      width: 100, 
      filter: 'agTextColumnFilter',
      headerComponent: CustomHeaderWithMenu
    },
    { 
      field: 'ccy', 
      headerName: 'CCY', 
      width: 50, 
      filter: 'agTextColumnFilter',
      headerComponent: CustomHeaderWithMenu
    },
    { 
      field: 'bidSprd', 
      headerName: 'BID SPRD',
      width: 80,
      cellClass: 'bid-cell',
      valueFormatter: params => params.value?.toFixed(5) || '',
      filter: 'agNumberColumnFilter',
      headerComponent: CustomHeaderWithMenu
    },
    { 
      field: 'bidYield', 
      headerName: 'BID YIELD',
      width: 80,
      cellClass: 'bid-cell',
      valueFormatter: params => params.value?.toFixed(4) || '',
      filter: 'agNumberColumnFilter',
      headerComponent: CustomHeaderWithMenu
    },
    { 
      field: 'bidPrice', 
      headerName: 'BID PRICE',
      width: 80,
      cellClass: 'bid-cell',
      valueFormatter: params => params.value?.toFixed(5) || '',
      filter: 'agNumberColumnFilter',
      headerComponent: CustomHeaderWithMenu
    },
    { 
      field: 'askPrice', 
      headerName: 'ASK PRICE',
      width: 80,
      cellClass: 'ask-cell',
      valueFormatter: params => params.value?.toFixed(5) || '',
      filter: 'agNumberColumnFilter',
      headerComponent: CustomHeaderWithMenu
    },
    { 
      field: 'askYield', 
      headerName: 'ASK YIELD',
      width: 80,
      cellClass: 'ask-cell',
      valueFormatter: params => params.value?.toFixed(4) || '',
      filter: 'agNumberColumnFilter',
      headerComponent: CustomHeaderWithMenu
    },
    { 
      field: 'askSprd', 
      headerName: 'ASK SPRD',
      width: 80,
      cellClass: 'ask-cell',
      valueFormatter: params => params.value?.toFixed(5) || '',
      filter: 'agNumberColumnFilter',
      headerComponent: CustomHeaderWithMenu
    },
    { 
      field: 'midPrice', 
      headerName: 'MID PRICE',
      width: 80,
      valueFormatter: params => params.value?.toFixed(5) || '',
      filter: 'agNumberColumnFilter',
      headerComponent: CustomHeaderWithMenu
    },
    { 
      field: 'midYield', 
      headerName: 'MID YIELD',
      width: 80,
      valueFormatter: params => params.value?.toFixed(4) || '',
      filter: 'agNumberColumnFilter',
      headerComponent: CustomHeaderWithMenu
    },
    { 
      field: 'coupon', 
      headerName: 'COUPON',
      width: 70,
      valueFormatter: params => params.value?.toFixed(3) || '',
      filter: 'agNumberColumnFilter',
      headerComponent: CustomHeaderWithMenu
    },
    { 
      field: 'maturity', 
      headerName: 'MATURITY', 
      width: 100,
      filter: 'agTextColumnFilter',
      headerComponent: CustomHeaderWithMenu
    }
  ], [language])

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true,
    suppressMenu: false
  }), [])

  const onRowClicked = useCallback((event) => {
    onSelectBond(event.data)
  }, [onSelectBond])

  // Force grid refresh when language changes
  useEffect(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.refreshHeader()
    }
  }, [language])

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
          context={{ t, language }}
        />
      </div>
    </div>
  )
}

export default BondTable
