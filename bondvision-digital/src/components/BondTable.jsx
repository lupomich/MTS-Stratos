import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { useLanguage } from '../context/LanguageContext'
import { usePreferences } from '../context/PreferencesContext'
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
      <span class="header-sort-icon" title="Ordinamento">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="12 5 12 19"/><polyline points="5 12 12 5 19 12"/>
        </svg>
      </span>
      <span class="header-sort-icon-desc" title="Ordinamento" style="display:none">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="12 5 12 19"/><polyline points="5 12 12 19 19 12"/>
        </svg>
      </span>
      <span class="header-filter-icon" title="Filtro attivo">
        <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor">
          <path d="M0 0 L10 0 L10 1 L6.5 5 L6.5 10 L3.5 10 L3.5 5 L0 1 Z"/>
        </svg>
      </span>
      <span class="header-menu-icon" title="Menu colonna">☰</span>
    `
    this.eSortIcon = this.eGui.querySelector('.header-sort-icon')
    this.eSortIconDesc = this.eGui.querySelector('.header-sort-icon-desc')
    this.eFilterIcon = this.eGui.querySelector('.header-filter-icon')
    this.eMenuIcon = this.eGui.querySelector('.header-menu-icon')
    this.eMenuIcon.addEventListener('click', (e) => this.onMenuClicked(e))
    
    // Controlla lo stato del filtro e ordinamento iniziale
    this.updateIconsState()
    
    // Chiudi menu quando si clicca altrove
    this.documentClickListener = (e) => {
      if (this.menu && !this.menu.contains(e.target)) {
        this.destroyMenu()
      }
    }
  }
  
  updateIconsState() {
    if (!this.params || !this.params.api) return
    
    // Aggiorna filtro icon
    const filterModel = this.params.api.getFilterModel()
    const isFiltered = filterModel && filterModel[this.colId]
    if (this.eFilterIcon) {
      this.eFilterIcon.style.display = isFiltered ? 'inline' : 'none'
    }
    
    // Aggiorna sort icons
    const columnState = this.params.columnApi.getColumnState()
    const thiColState = columnState.find(cs => cs.colId === this.colId)
    
    if (this.eSortIcon && this.eSortIconDesc) {
      if (thiColState && thiColState.sort) {
        if (thiColState.sort === 'asc') {
          this.eSortIcon.style.display = 'inline'
          this.eSortIconDesc.style.display = 'none'
          this.eSortIcon.style.color = 'var(--color-primary)'
        } else if (thiColState.sort === 'desc') {
          this.eSortIcon.style.display = 'none'
          this.eSortIconDesc.style.display = 'inline'
          this.eSortIconDesc.style.color = 'var(--color-primary)'
        }
      } else {
        this.eSortIcon.style.display = 'none'
        this.eSortIconDesc.style.display = 'none'
      }
    }
  }
  
  refresh(params) {
    this.params = params
    this.updateIconsState()
    return true
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
        <svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2.586a1 1 0 0 1-.293.707l-6.414 6.414a1 1 0 0 0-.293.707V17l-4 4v-6.586a1 1 0 0 0-.293-.707L3.293 7.293A1 1 0 0 1 3 6.586V4z"/>
        </svg>
        <span>${t('columnMenu.filter')}</span>
      </div>
      <div class="menu-item" data-action="clearFilters">
        <svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
        <span>${t('bondTable.clearFilters')}</span>
      </div>
      <div class="menu-separator"></div>
      <div class="menu-item" data-action="sortAsc">
        <svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="12 5 19 12 5 12"/><line x1="12" y1="19" x2="12" y2="9"/>
        </svg>
        <span>${t('columnMenu.sortAsc')}</span>
      </div>
      <div class="menu-item" data-action="sortDesc">
        <svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="12 19 5 12 19 12"/><line x1="12" y1="5" x2="12" y2="15"/>
        </svg>
        <span>${t('columnMenu.sortDesc')}</span>
      </div>
      <div class="menu-item" data-action="sortNone">
        <svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="8" y1="8" x2="16" y2="16"/><line x1="16" y1="8" x2="8" y2="16"/>
        </svg>
        <span>${t('columnMenu.sortNone')}</span>
      </div>
      <div class="menu-separator"></div>
      <div class="menu-item" data-action="autosizeThis">
        <svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="5 12 3 12 3 3 12 3"/><polyline points="19 12 21 12 21 21 12 21"/>
        </svg>
        <span>${t('columnMenu.autosizeThis')}</span>
      </div>
      <div class="menu-item" data-action="autosizeAll">
        <svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
        <span>${t('columnMenu.autosizeAll')}</span>
      </div>
      <div class="menu-separator"></div>
      <div class="menu-item" data-action="pinLeft">
        <svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="5" r="3"/><path d="M12 8v8"/><path d="M5 20h14"/><line x1="5" y1="12" x2="9" y2="12"/>
        </svg>
        <span>${t('columnMenu.pinLeft')}</span>
      </div>
      <div class="menu-item" data-action="pinRight">
        <svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="5" r="3"/><path d="M12 8v8"/><path d="M5 20h14"/><line x1="15" y1="12" x2="19" y2="12"/>
        </svg>
        <span>${t('columnMenu.pinRight')}</span>
      </div>
      ${isPinned ? `<div class="menu-item" data-action="unpin"><svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><path d="M12 8v8"/><path d="M5 20h14"/><line x1="3" y1="3" x2="21" y2="21"/></svg><span>${t('columnMenu.unpin')}</span></div>` : ''}
      <div class="menu-separator"></div>
      <div class="menu-item" data-action="resetColumn">
        <svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36M20.49 15a9 9 0 01-14.85 3.36"/>
        </svg>
        <span>${t('columnMenu.resetColumn')}</span>
      </div>
      <div class="menu-item" data-action="resetAll">
        <svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
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
        // Forza refresh degli header per aggiornare icone filtro
        api.refreshHeader()
        break
      case 'sortAsc':
        columnApi.applyColumnState({
          state: [{ colId: this.colId, sort: 'asc' }],
          defaultState: { sort: null }
        })
        // Forza refresh per mostrare l'icona sort
        api.refreshHeader()
        break
      case 'sortDesc':
        columnApi.applyColumnState({
          state: [{ colId: this.colId, sort: 'desc' }],
          defaultState: { sort: null }
        })
        // Forza refresh per mostrare l'icona sort
        api.refreshHeader()
        break
      case 'sortNone':
        columnApi.applyColumnState({
          state: [{ colId: this.colId, sort: null }]
        })
        // Forza refresh per nascondere l'icona sort
        api.refreshHeader()
        break
      case 'autosizeThis':
        columnApi.autoSizeColumn(this.colId)
        break
      case 'autosizeAll':
        const allColumnIds = api.getColumns ? api.getColumns().map(col => col.getColId()) : columnApi.getAllColumns().map(col => col.getColId())
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
        api.refreshHeader()
        break
      case 'resetAll':
        const allColumns = api.getColumns ? api.getColumns() : columnApi.getAllColumns()
        const defaultOrder = allColumns.map(col => col.getColId())

        columnApi.resetColumnState()
        columnApi.applyColumnState({
          state: defaultOrder.map(colId => ({
            colId,
            hide: false,
            sort: null,
            pinned: null,
            rowGroup: false,
            pivot: false,
            aggFunc: null
          })),
          applyOrder: true,
          defaultState: {
            hide: false,
            sort: null,
            pinned: null,
            rowGroup: false,
            pivot: false,
            aggFunc: null
          }
        })

        api.setFilterModel(null)
        api.onFilterChanged()
        api.refreshHeader()

        if (this.params.context && typeof this.params.context.resetPreferences === 'function') {
          try {
            this.params.context.resetPreferences()
            if (typeof this.params.context.setColumnOrder === 'function') {
              this.params.context.setColumnOrder(defaultOrder)
            }
            if (typeof this.params.context.setSorts === 'function') {
              this.params.context.setSorts([])
            }
            if (typeof this.params.context.setFilters === 'function') {
              this.params.context.setFilters({})
            }
            if (typeof this.params.context.setDefaultColumns === 'function') {
              this.params.context.setDefaultColumns(defaultOrder)
            }
          } catch (err) {
            console.error('Error calling resetPreferences:', err)
          }
        }
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

const BondTable = ({ onSelectBond, onDoubleClickBond, countryBonds = [], searchTerm = '', columnSearchTerm = '' }) => {
  const gridRef = useRef()
  const { t, language } = useLanguage()
  const applyingPreferencesRef = useRef(false)
  const { preferences, setColumnOrder, setSorts, setFilters, setDefaultColumns, resetPreferences } = usePreferences()
  const [rowData, setRowData] = useState(countryBonds.length > 0 ? countryBonds : [])
  const [selectedBondIsin, setSelectedBondIsin] = useState(null)
  const [highlightedColumnId, setHighlightedColumnId] = useState(null)

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
          __isSelected: selectedBondIsin === bond.isin,
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
  }, [countryBonds, selectedBondIsin])

  const columnDefs = useMemo(() => [
    { 
      field: 'description', 
      headerName: 'DESCRIPTION',
      width: 180,
      cellClass: 'description-cell',
      filter: 'agTextColumnFilter',
      headerComponent: CustomHeaderWithMenu
    },
    { 
      field: 'isin', 
      headerName: 'ISIN',
      width: 130,
      filter: 'agTextColumnFilter',
      headerComponent: CustomHeaderWithMenu
    },
    { 
      field: 'ccy', 
      headerName: 'CCY',
      width: 60,
      filter: 'agTextColumnFilter',
      headerComponent: CustomHeaderWithMenu
    },
    { 
      field: 'bidSprd', 
      headerName: 'BID SPRD',
      width: 95,
      cellClass: 'bid-cell',
      valueFormatter: params => params.value?.toFixed(5) || '',
      filter: 'agNumberColumnFilter',
      headerComponent: CustomHeaderWithMenu
    },
    { 
      field: 'bidYield', 
      headerName: 'BID YIELD',
      width: 95,
      cellClass: 'bid-cell',
      valueFormatter: params => params.value?.toFixed(4) || '',
      filter: 'agNumberColumnFilter',
      headerComponent: CustomHeaderWithMenu
    },
    { 
      field: 'bidPrice', 
      headerName: 'BID PRICE',
      width: 95,
      cellClass: 'bid-cell',
      valueFormatter: params => params.value?.toFixed(5) || '',
      filter: 'agNumberColumnFilter',
      headerComponent: CustomHeaderWithMenu
    },
    { 
      field: 'askPrice', 
      headerName: 'ASK PRICE',
      width: 95,
      cellClass: 'ask-cell',
      valueFormatter: params => params.value?.toFixed(5) || '',
      filter: 'agNumberColumnFilter',
      headerComponent: CustomHeaderWithMenu
    },
    { 
      field: 'askYield', 
      headerName: 'ASK YIELD',
      width: 95,
      cellClass: 'ask-cell',
      valueFormatter: params => params.value?.toFixed(4) || '',
      filter: 'agNumberColumnFilter',
      headerComponent: CustomHeaderWithMenu
    },
    { 
      field: 'askSprd', 
      headerName: 'ASK SPRD',
      width: 95,
      cellClass: 'ask-cell',
      valueFormatter: params => params.value?.toFixed(5) || '',
      filter: 'agNumberColumnFilter',
      headerComponent: CustomHeaderWithMenu
    },
    { 
      field: 'midPrice', 
      headerName: 'MID PRICE',
      width: 95,
      valueFormatter: params => params.value?.toFixed(5) || '',
      filter: 'agNumberColumnFilter',
      headerComponent: CustomHeaderWithMenu
    },
    { 
      field: 'midYield', 
      headerName: 'MID YIELD',
      width: 95,
      valueFormatter: params => params.value?.toFixed(4) || '',
      filter: 'agNumberColumnFilter',
      headerComponent: CustomHeaderWithMenu
    },
    { 
      field: 'coupon', 
      headerName: 'COUPON',
      width: 85,
      valueFormatter: params => params.value?.toFixed(3) || '',
      filter: 'agNumberColumnFilter',
      headerComponent: CustomHeaderWithMenu
    },
    { 
      field: 'maturity', 
      headerName: 'MATURITY',
      width: 105,
      filter: 'agTextColumnFilter',
      headerComponent: CustomHeaderWithMenu
    }
  ], [language])

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true,
    suppressMenu: false,
    headerClass: (params) => (params.column.getColId() === highlightedColumnId ? 'bond-column-header-match' : '')
  }), [highlightedColumnId])

  const onRowClicked = useCallback((event) => {
    const clickedIsin = event.data?.isin || null
    setSelectedBondIsin(clickedIsin)
    setRowData(prev => prev.map(row => ({ ...row, __isSelected: row.isin === clickedIsin })))
    onSelectBond(event.data)
  }, [onSelectBond])

  const onCellDoubleClicked = useCallback((event) => {
    // Ignore cell double-click - use row double-click instead to avoid duplicate opens
  }, [onDoubleClickBond])

  const onRowDoubleClicked = useCallback((event) => {
    if (onDoubleClickBond) {
      onDoubleClickBond(event.data)
    }
  }, [onDoubleClickBond])

  const rowClassRules = useMemo(() => ({
    'bond-row-selected-persistent': (params) => Boolean(params.data?.__isSelected)
  }), [selectedBondIsin])

  // Evidenzia la riga che matcha la ricerca
  const getRowStyle = useCallback((params) => {
    if (selectedBondIsin && params.data?.isin === selectedBondIsin) return null

    if (searchTerm && params.data.description) {
      const description = params.data.description.toLowerCase()
      const search = searchTerm.toLowerCase()
      if (description.includes(search)) {
        return { backgroundColor: 'rgba(77, 184, 184, 0.25)', fontWeight: 'bold' }
      }
    }
    return null
  }, [searchTerm, selectedBondIsin])

  // Force grid refresh when language changes
  useEffect(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.refreshHeader()
    }
  }, [language])

  useEffect(() => {
    if (!gridRef.current?.api || !gridRef.current?.columnApi) return

    const query = columnSearchTerm.trim().toLowerCase()
    if (!query) {
      if (highlightedColumnId) {
        setHighlightedColumnId(null)
        gridRef.current.api.refreshHeader()
      }
      return
    }

    const allColumns = gridRef.current.api.getColumns
      ? gridRef.current.api.getColumns()
      : gridRef.current.columnApi.getAllColumns()

    const matchedColumn = allColumns.find((col) => {
      const colId = col.getColId()?.toLowerCase() || ''
      const headerName = String(col.getColDef()?.headerName || '').toLowerCase()
      return headerName.includes(query) || colId.includes(query)
    })

    if (!matchedColumn) {
      setHighlightedColumnId(null)
      gridRef.current.api.refreshHeader()
      return
    }

    const matchedColId = matchedColumn.getColId()
    gridRef.current.api.ensureColumnVisible(matchedColId)
    setHighlightedColumnId(matchedColId)
    gridRef.current.api.refreshHeader()
  }, [columnSearchTerm, highlightedColumnId])

  // Auto-scroll alla riga evidenziata quando c'è una sola corrispondenza
  useEffect(() => {
    if (searchTerm && gridRef.current?.api) {
      const matches = []
      gridRef.current.api.forEachNode((node) => {
        if (node.data.description) {
          const description = node.data.description.toLowerCase()
          const search = searchTerm.toLowerCase()
          if (description.includes(search)) {
            matches.push(node)
          }
        }
      })
      
      if (matches.length === 1) {
        gridRef.current.api.ensureIndexVisible(matches[0].rowIndex, 'middle')
      }
    }
  }, [searchTerm])

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

  // Listener per salvataggio posizione colonne
  useEffect(() => {
    if (!gridRef.current?.api || !gridRef.current?.columnApi) return

    const onColumnMoved = () => {
      const columnState = gridRef.current.columnApi.getColumnState()
      const columnOrder = columnState.map(col => col.colId)
      setColumnOrder(columnOrder)
      console.log('Column order saved:', columnOrder)
    }

    gridRef.current.api.addEventListener('columnMoved', onColumnMoved)

    return () => {
      if (gridRef.current?.api) {
        gridRef.current.api.removeEventListener('columnMoved', onColumnMoved)
      }
    }
  }, [setColumnOrder])

  // Applica l'ordine salvato delle colonne all'avvio
  useEffect(() => {
    if (!gridRef.current?.api || !gridRef.current?.columnApi) return
    if (!preferences?.columnOrder || preferences.columnOrder.length === 0) return

    // Piccola delay per assicurare che le colonne siano renderizzate
    const timer = setTimeout(() => {
      try {
        // Ottieni tutte le colonne disponibili (ag-grid v31 compatibility)
        const allColumns = gridRef.current.api.getColumns ? gridRef.current.api.getColumns() : gridRef.current.api.getAllColumns()
        const allColIds = allColumns.map(col => col.getColId())
        
        // Riordina: metti columnOrder all'inizio, poi il resto
        const columnOrderSet = new Set(preferences.columnOrder)
        const reorderedColIds = [
          ...preferences.columnOrder.filter(id => allColIds.includes(id)),
          ...allColIds.filter(id => !columnOrderSet.has(id))
        ]
        
        gridRef.current.api.applyColumnState({
          state: reorderedColIds.map(colId => ({ colId })),
          applyOrder: true
        })
        console.log('Column order applied:', reorderedColIds)
      } catch (error) {
        console.error('Failed to apply column order:', error)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [preferences?.columnOrder])

  useEffect(() => {
    if (!gridRef.current?.api || !gridRef.current?.columnApi) return

    const hasSavedSorts = Array.isArray(preferences?.sorts) && preferences.sorts.length > 0
    const hasSavedFilters = preferences?.filters && Object.keys(preferences.filters).length > 0
    if (!hasSavedSorts && !hasSavedFilters) return

    applyingPreferencesRef.current = true
    try {
      if (hasSavedSorts) {
        gridRef.current.api.applyColumnState({
          state: preferences.sorts,
          defaultState: { sort: null }
        })
      }

      if (hasSavedFilters) {
        gridRef.current.api.setFilterModel(preferences.filters)
        gridRef.current.api.onFilterChanged()
      }
    } catch (error) {
      console.error('Failed to apply saved grid preferences:', error)
    } finally {
      setTimeout(() => {
        applyingPreferencesRef.current = false
      }, 0)
    }
  }, [preferences?.sorts, preferences?.filters])

  const onSortChanged = useCallback(() => {
    if (!gridRef.current?.api || applyingPreferencesRef.current) return
    const columnState = gridRef.current.api.getColumnState()
    const activeSorts = columnState
      .filter(col => col.sort)
      .map(col => ({ colId: col.colId, sort: col.sort, sortIndex: col.sortIndex }))
    setSorts(activeSorts)
  }, [setSorts])

  const onFilterChanged = useCallback(() => {
    if (!gridRef.current?.api) return
    gridRef.current.api.refreshHeader()
    if (applyingPreferencesRef.current) return
    const filterModel = gridRef.current.api.getFilterModel()
    setFilters(filterModel)
  }, [setFilters])

  const onGridReady = useCallback((params) => {
    // Registra l'API globalmente per i test Playwright
    window.__bondGridApi = params.api
  }, [])

  return (
    <div className="bond-table-container">
      <div className="ag-theme-alpine-dark bond-grid">
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          deltaRowDataMode={true}
          suppressHeaderFocus={true}
          onRowClicked={onRowClicked}
          onCellDoubleClicked={onCellDoubleClicked}
          onRowDoubleClicked={onRowDoubleClicked}
          onGridReady={onGridReady}
          onSortChanged={onSortChanged}
          onFilterChanged={onFilterChanged}
          rowClassRules={rowClassRules}
          getRowStyle={getRowStyle}
          getRowId={(params) => params.data.isin}
          animateRows={true}
          suppressCellFocus={true}
          context={{ t, language, resetPreferences, setColumnOrder, setSorts, setFilters, setDefaultColumns }}
        />
      </div>
    </div>
  )
}

export default BondTable
