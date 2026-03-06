/**
 * MainContent.jsx
 *
 * Top-level content area for MTS Stratos BondVision.
 *
 * Responsibilities:
 *   1. Dispatch between the DOCKABLE workspace (mode='blank') and the
 *      LEGACY fixed workspace (mode='legacy') based on the active workspace's
 *      `workspaceMode` prop.
 *   2. Manage shared application state: bond selection, search terms, the
 *      country/filter tabs, and all RFQ modal instances.
 *   3. Provide `renderBlankPanelContent` and `getBlankPanelTitle` so the
 *      DockableWorkspaceGrid can render the correct financial panel in each
 *      slot without knowing about bonds, market depth, or RFQ directly.
 *
 * ── Architecture notes ───────────────────────────────────────────────────────
 *
 * DOCKABLE WORKSPACE (mode = 'blank')
 *   - Layout rendered by <DockableWorkspaceGrid>.
 *   - Slot assignments and hidden-slot encoding managed by WorkspaceContext via
 *     App.jsx callbacks (onWorkspaceSlotChange, onWorkspaceHiddenSlotsChange).
 *   - Column/row proportions (colWidths, rowHeights) are controlled state here;
 *     live feedback via onResize, persistence trigger via onResizeCommit.
 *
 * LEGACY WORKSPACE (mode = 'legacy')  ← SCHEDULED FOR REMOVAL
 *   - Hard-coded 3-panel layout (bond table | market depth | data section).
 *   - Resized via drag handles tracked in this component's state.
 *   - Will be deleted once all users have migrated to dockable workspaces.
 */

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import BondTable from './BondTable'
import MarketDepth from './MarketDepth'
import RfqOutright from './RfqOutright'
import DockablePanelShell from './DockablePanelShell'
import DockableWorkspaceGrid from './DockableWorkspaceGrid'
import { getBondsByCountry, generatePriceData, getCountryName } from '../data/governmentBonds'
import { usePreferences } from '../context/PreferencesContext'
import { useLanguage } from '../context/LanguageContext'
import {
  SIDEBAR_PANEL_DRAG_MIME,
  BLANK_WORKSPACE_SLOT_COUNT,
  BLANK_WORKSPACE_PANEL_KEYS,
} from '../constants/workspaceConstants'
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

const RFQ_POPUP_WIDTH = 1250
const RFQ_POPUP_HEIGHT = 800
const RFQ_CASCADE_X = 30
const RFQ_CASCADE_Y = 10

const DEFAULT_LAYOUT_STATE = {
  tradingWidth: 60,
  marketWidth: 40,
  dataHeight: 35,
  isMarketDepthCollapsed: false,
  isDataPanelCollapsed: false
}

const areLayoutStatesEqual = (first, second) => {
  if (!first || !second) return false

  return first.tradingWidth === second.tradingWidth
    && first.marketWidth === second.marketWidth
    && first.dataHeight === second.dataHeight
    && first.isMarketDepthCollapsed === second.isMarketDepthCollapsed
    && first.isDataPanelCollapsed === second.isDataPanelCollapsed
}

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

const blotterColumnDefs = [
  { headerName: 'TIME', field: 'time', flex: 1 },
  { headerName: 'EVENT', field: 'event', flex: 2 },
  { headerName: 'STATUS', field: 'status', flex: 1 }
]

const alertsColumnDefs = [
  { headerName: 'TIME', field: 'time', flex: 1 },
  { headerName: 'TYPE', field: 'type', flex: 1 },
  { headerName: 'MESSAGE', field: 'message', flex: 2 }
]

const ordersColumnDefs = [
  { headerName: 'TIME', field: 'time', flex: 1 },
  { headerName: 'ISIN', field: 'isin', flex: 2 },
  { headerName: 'SIDE', field: 'side', flex: 1 },
  { headerName: 'QTY', field: 'qty', flex: 1 },
  { headerName: 'PRICE', field: 'price', flex: 1 },
  { headerName: 'STATUS', field: 'status', flex: 1 }
]

// SIDEBAR_PANEL_DRAG_MIME, BLANK_WORKSPACE_SLOT_COUNT, BLANK_WORKSPACE_PANEL_KEYS
// are imported from ../constants/workspaceConstants — see that module for documentation.

const MainContent = ({
  panelCommand,
  workspaceLayout,
  onWorkspaceLayoutChange,
  workspaceMode = 'legacy',
  workspaceSlots = [],
  onWorkspaceSlotChange,
  workspaceHiddenSlots = [],
  onWorkspaceHiddenSlotsChange,
  isWorkspaceEditMode = false
}) => {
  const { preferences, loading: preferencesLoading, setSelectedCountryTab } = usePreferences()
  const { t } = useLanguage()
  const [selectedBond, setSelectedBond] = useState(null)
  const [selectedTopTab, setSelectedTopTab] = useState('ALL')
  const [selectedCountry, setSelectedCountry] = useState('IT')
  const [countryTabHydrated, setCountryTabHydrated] = useState(false)
  const countryTabHydrationDoneRef = useRef(false)
  const [expandedRFQ, setExpandedRFQ] = useState(false)
  const [selectedRFQ, setSelectedRFQ] = useState('RFQ OUTRIGHT')
  const [searchTerm, setSearchTerm] = useState('')
  const [columnSearchTerm, setColumnSearchTerm] = useState('')
  const [dataTableRows, setDataTableRows] = useState([])
  const [activeBottomPanel, setActiveBottomPanel] = useState('data')
  const [isBottomPanelFullScreen, setIsBottomPanelFullScreen] = useState(false)

  // ── Dockable workspace grid proportions (controlled) ──────────────────────
  // colWidths/rowHeights are owned here and passed as controlled props to
  // DockableWorkspaceGrid. They are also kept in sync refs so legacy-workspace
  // drag-end handlers can read them synchronously (React 18 async batching).
  const [colWidths, setColWidths] = useState(() => workspaceLayout?.colWidths ?? [1, 1, 1])
  const [rowHeights, setRowHeights] = useState(() => workspaceLayout?.rowHeights ?? [1, 1])
  const [rightColumnRowHeights, setRightColumnRowHeights] = useState(() => workspaceLayout?.rightColumnRowHeights ?? [1, 1])
  /** Sync ref — always equals the latest colWidths state value. */
  const colWidthsRef  = useRef(workspaceLayout?.colWidths  ?? [1, 1, 1])
  /** Sync ref — always equals the latest rowHeights state value. */
  const rowHeightsRef = useRef(workspaceLayout?.rowHeights ?? [1, 1])
  /** Sync ref — always equals the latest right-column row proportions. */
  const rightColumnRowHeightsRef = useRef(workspaceLayout?.rightColumnRowHeights ?? [1, 1])
  // Note: blankFullScreenSlotIndex, dragOverSlotIndex, isGridDragging, blankGridRef,
  // and gridDragRef have been moved into DockableWorkspaceGrid (internal state).

  // Multiple RFQ modals support
  const [rfqModals, setRfqModals] = useState([]) // Array of {id, bond, pricingData, window, container}
  const rfqWindowsRef = useRef(new Map()) // Map id -> {window, container}
  const popupActivationOrderRef = useRef([])
  const lastBringToFrontRef = useRef({ id: null, at: 0 })
  const [errorMessage, setErrorMessage] = useState(null)
  
  const priceUpdateIntervalRef = useRef(null)
  
  // ══════════════════════════════════════════════════════════════════════════
  // LEGACY WORKSPACE — resize state (SCHEDULED FOR REMOVAL with legacy mode)
  // Tracks the proportions and collapse state of the hard-coded 3-panel layout.
  // None of this state is used when workspaceMode === 'blank'.
  // ══════════════════════════════════════════════════════════════════════════

  /** Persisted layout proportions for the legacy workspace (tradingWidth, etc.). */
  const [layoutState, setLayoutState] = useState(() => workspaceLayout || DEFAULT_LAYOUT_STATE)
  const {
    tradingWidth,
    marketWidth,
    dataHeight,
    isMarketDepthCollapsed,
    isDataPanelCollapsed
  } = layoutState
  /**
   * Sync ref for layoutState — allows legacy drag-end handlers to read the
   * current layout without stale closures and without extra effect deps.
   */
  const layoutStateRef = useRef(layoutState)
  useEffect(() => { layoutStateRef.current = layoutState }, [layoutState])
  // Keep grid-proportion refs in sync with state (also updated eagerly in
  // handleGridResize for immediate reads inside zero-dep callbacks).
  useEffect(() => { colWidthsRef.current  = colWidths  }, [colWidths])
  useEffect(() => { rowHeightsRef.current = rowHeights }, [rowHeights])
  useEffect(() => { rightColumnRowHeightsRef.current = rightColumnRowHeights }, [rightColumnRowHeights])

  const setTradingWidth = useCallback((value) => {
    setLayoutState((prev) => ({ ...prev, tradingWidth: value }))
  }, [])
  const setMarketWidth = useCallback((value) => {
    setLayoutState((prev) => ({ ...prev, marketWidth: value }))
  }, [])
  const setDataHeight = useCallback((value) => {
    setLayoutState((prev) => ({ ...prev, dataHeight: value }))
  }, [])
  const setIsMarketDepthCollapsed = useCallback((value) => {
    setLayoutState((prev) => ({ ...prev, isMarketDepthCollapsed: value }))
  }, [])
  const setIsDataPanelCollapsed = useCallback((value) => {
    setLayoutState((prev) => ({ ...prev, isDataPanelCollapsed: value }))
  }, [])
  const previousMarketWidthRef = useRef(40)
  const previousDataHeightRef = useRef(35)
  const previousBottomPanelDepthCollapsedRef = useRef(false)
  const lastProcessedPanelCommandAtRef = useRef(null)
  const [isDraggingVertical, setIsDraggingVertical] = useState(false)
  const [isDraggingHorizontal, setIsDraggingHorizontal] = useState(false)
  const contentBodyRef = useRef(null)
  const mainContentRef = useRef(null)
  /** Stable ref for the onWorkspaceLayoutChange callback — avoids listing it
   *  as a useEffect/useCallback dep while still calling the latest version. */
  const onWorkspaceLayoutChangeRef = useRef(onWorkspaceLayoutChange)
  useEffect(() => { onWorkspaceLayoutChangeRef.current = onWorkspaceLayoutChange }, [onWorkspaceLayoutChange])

  // ── Derived flags ─────────────────────────────────────────────────────────

  /** True when legacy trading + market-depth panels are both collapsed (full-screen bond table). */
  const isBondTableFullScreen = isMarketDepthCollapsed && isDataPanelCollapsed
  /** Set when the active workspace is in dockable (blank-grid) mode. */
  const isBlankWorkspace = workspaceMode === 'blank'

  // ── Normalised slot data ───────────────────────────────────────────────────

  /**
   * Normalised slot array: guaranteed exactly BLANK_WORKSPACE_SLOT_COUNT entries,
   * with undefined/missing values coerced to null. Passed to DockableWorkspaceGrid.
   */
  const normalizedWorkspaceSlots = useMemo(() => {
    const normalizedSlots = Array.from({ length: BLANK_WORKSPACE_SLOT_COUNT }, (_, index) => workspaceSlots?.[index] || null)
    return normalizedSlots
  }, [workspaceSlots])

  /** List of occupied slots as {panelKey, slotIndex} for quick iteration. */
  const blankOccupiedSlots = useMemo(() => normalizedWorkspaceSlots
    .map((panelKey, index) => ({ panelKey, slotIndex: index }))
    .filter((item) => Boolean(item.panelKey)), [normalizedWorkspaceSlots])
  /** Just the panel keys of occupied slots. */
  const blankPanelKeys = useMemo(() => blankOccupiedSlots.map((item) => item.panelKey), [blankOccupiedSlots])
  /**
   * True when the workspace has exactly the 3-panel default replica layout:
   * trading + data + depth. Used to enable layout-shortcut actions.
   */
  const canUseDefaultReplicaLayout = useMemo(() => {
    if (blankPanelKeys.length !== 3) return false
    const uniquePanels = new Set(blankPanelKeys)
    return uniquePanels.size === 3
      && uniquePanels.has('trading')
      && uniquePanels.has('data')
      && uniquePanels.has('depth')
  }, [blankPanelKeys])

  useEffect(() => {
    if (!workspaceLayout) return

    setLayoutState((previousLayoutState) => {
      if (areLayoutStatesEqual(previousLayoutState, workspaceLayout)) {
        return previousLayoutState
      }
      return { ...workspaceLayout }
    })

    // Sync blank-grid proportions when switching workspace or loading from DB.
    // Always reset — if colWidths/rowHeights are absent (new workspace) fall back to [1,1,1]/[1,1]
    const nextCols = Array.isArray(workspaceLayout.colWidths)  ? workspaceLayout.colWidths  : [1, 1, 1]
    const nextRows = Array.isArray(workspaceLayout.rowHeights) ? workspaceLayout.rowHeights : [1, 1]
    const nextRightRows = Array.isArray(workspaceLayout.rightColumnRowHeights) ? workspaceLayout.rightColumnRowHeights : [1, 1]
    setColWidths(nextCols)
    colWidthsRef.current  = nextCols
    setRowHeights(nextRows)
    rowHeightsRef.current = nextRows
    setRightColumnRowHeights(nextRightRows)
    rightColumnRowHeightsRef.current = nextRightRows
  }, [workspaceLayout])

  // Removed the layoutState→parent sync useEffect.
  // The parent is notified directly at drag-end (see handleMouseUpVertical / handleMouseUpHorizontal)
  // to avoid the workspace-switch feedback loop.

  const getRfqTypeLabel = useCallback((type) => {
    switch (type) {
      case 'RFQ OUTRIGHT':
        return t('mainContent.rfqTypes.outright')
      case 'RFQ SWITCH':
        return t('mainContent.rfqTypes.switch')
      case 'RFQ BUTTERFLY':
        return t('mainContent.rfqTypes.butterfly')
      case 'RFQ LIST':
        return t('mainContent.rfqTypes.list')
      case 'RFQ PORTFOLIO':
        return t('mainContent.rfqTypes.portfolio')
      default:
        return type
    }
  }, [t])

  const getTopTabLabel = useCallback((code, fallbackName) => {
    if (code === 'ALL') return t('mainContent.topTabs.all')
    if (code === 'AXED') return t('mainContent.topTabs.axed')
    return fallbackName
  }, [t])

  // Load persisted country tab preference when available
  useEffect(() => {
    if (preferencesLoading || countryTabHydrationDoneRef.current) return

    const persistedCountry = preferences?.selectedCountryTab
    const isValidCountry = countries.some((country) => country.code === persistedCountry && country.code !== '+')

    if (isValidCountry) {
      setSelectedCountry(persistedCountry)
    }

    countryTabHydrationDoneRef.current = true
    setCountryTabHydrated(true)
  }, [preferencesLoading, preferences?.selectedCountryTab])

  // Persist selected country tab (skip the '+' action tab)
  useEffect(() => {
    if (preferencesLoading || !countryTabHydrated) return
    if (selectedCountry === '+') return

    if (preferences?.selectedCountryTab !== selectedCountry) {
      setSelectedCountryTab(selectedCountry)
    }
  }, [selectedCountry, preferencesLoading, countryTabHydrated, preferences?.selectedCountryTab, setSelectedCountryTab])

  // Load all available bonds when the selected country changes
  useEffect(() => {
    const countryName = getCountryName(selectedCountry)
    const bonds = getBondsByCountry(countryName)
    const dataBonds = bonds.map(bond => generatePriceData(bond))
    setDataTableRows(dataBonds)
  }, [selectedCountry])

  // ══════════════════════════════════════════════════════════════════════════
  // DOCKABLE WORKSPACE — grid resize bridge callbacks
  // These are the integration point between MainContent (which owns the controlled
  // colWidths/rowHeights state) and DockableWorkspaceGrid (which drives the drags).
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Called by DockableWorkspaceGrid on every pointer-move during a resize drag.
   * Updates controlled state so the grid visually reflects the new proportions
   * immediately, and eagerly syncs refs so legacy-workspace saves include them.
   */
  const handleGridResize = useCallback((cw, rh) => {
    setColWidths(cw)
    colWidthsRef.current = cw
    setRowHeights(rh)
    rowHeightsRef.current = rh
  }, [])

  /**
   * Called by DockableWorkspaceGrid once at drag end.
   * Syncs refs with the definitive final values and persists the updated layout
   * (with proportions merged in) to the workspace record via WorkspaceContext.
   */
  const handleGridResizeCommit = useCallback((cw, rh) => {
    colWidthsRef.current = cw
    rowHeightsRef.current = rh
    onWorkspaceLayoutChangeRef.current?.({
      ...layoutStateRef.current,
      colWidths: cw,
      rowHeights: rh,
      rightColumnRowHeights: rightColumnRowHeightsRef.current,
    })
  }, [])

  const handleRightColumnResize = useCallback((rh) => {
    setRightColumnRowHeights(rh)
    rightColumnRowHeightsRef.current = rh
  }, [])

  const handleRightColumnResizeCommit = useCallback((rh) => {
    rightColumnRowHeightsRef.current = rh
    onWorkspaceLayoutChangeRef.current?.({
      ...layoutStateRef.current,
      colWidths: colWidthsRef.current,
      rowHeights: rowHeightsRef.current,
      rightColumnRowHeights: rh,
    })
  }, [])

  // ══════════════════════════════════════════════════════════════════════════
  // LEGACY WORKSPACE — panel visibility handlers (SCHEDULED FOR REMOVAL)
  // All handlers below control the hard-coded 3-panel layout collapse/expand.
  // ══════════════════════════════════════════════════════════════════════════

  // Vertical resize: trading area ↔ market depth
  const handleMouseDownVertical = useCallback((e) => {
    if (isMarketDepthCollapsed) return
    e.preventDefault()
    setIsDraggingVertical(true)
  }, [isMarketDepthCollapsed])

  /**
   * Vertical resize drag end: flush final layout proportions to WorkspaceContext.
   * colWidths/rowHeights are included so a later switch to a dockable workspace
   * does not accidentally overwrite the saved grid proportions.
   */
  const handleMouseUpVertical = useCallback(() => {
    setIsDraggingVertical(false)
    // Persist layout at drag end only — avoids a re-render cascade during the drag.
    setLayoutState((current) => {
      onWorkspaceLayoutChangeRef.current?.({
        ...current,
        colWidths: colWidthsRef.current,
        rowHeights: rowHeightsRef.current,
        rightColumnRowHeights: rightColumnRowHeightsRef.current,
      })
      return current
    })
  }, [])

  const handleMouseMoveVertical = useCallback((e) => {
    if (isMarketDepthCollapsed) return
    if (!isDraggingVertical || !contentBodyRef.current) return
    e.preventDefault()

    const rect = contentBodyRef.current.getBoundingClientRect()
    const newWidth = ((e.clientX - rect.left) / rect.width) * 100

    if (newWidth > 20 && newWidth < 80) {
      setTradingWidth(newWidth)
      setMarketWidth(100 - newWidth)
    }
  }, [isDraggingVertical, isMarketDepthCollapsed])

  const collapseMarketDepthPanel = useCallback(() => {
    if (isMarketDepthCollapsed) return
    previousMarketWidthRef.current = marketWidth
    setMarketWidth(0)
    setTradingWidth(100)
    setIsMarketDepthCollapsed(true)
  }, [isMarketDepthCollapsed, marketWidth])

  const expandMarketDepthPanel = useCallback(() => {
    if (!isMarketDepthCollapsed) return
    const restoredMarketWidth = Math.min(80, Math.max(20, previousMarketWidthRef.current || 40))
    setMarketWidth(restoredMarketWidth)
    setTradingWidth(100 - restoredMarketWidth)
    setIsMarketDepthCollapsed(false)
  }, [isMarketDepthCollapsed])

  const toggleMarketDepthCollapse = useCallback(() => {
    if (isMarketDepthCollapsed) {
      expandMarketDepthPanel()
      return
    }
    collapseMarketDepthPanel()
  }, [isMarketDepthCollapsed, collapseMarketDepthPanel, expandMarketDepthPanel])

  // Horizontal resize: content area ↔ data panel
  const handleMouseDownHorizontal = useCallback((e) => {
    if (isDataPanelCollapsed) return
    e.preventDefault()
    setIsDraggingHorizontal(true)
  }, [isDataPanelCollapsed])

  /** Horizontal resize drag end: persist final layout with grid proportions merged in. */
  const handleMouseUpHorizontal = useCallback(() => {
    setIsDraggingHorizontal(false)
    setLayoutState((current) => {
      onWorkspaceLayoutChangeRef.current?.({
        ...current,
        colWidths: colWidthsRef.current,
        rowHeights: rowHeightsRef.current,
        rightColumnRowHeights: rightColumnRowHeightsRef.current,
      })
      return current
    })
  }, [])

  const handleMouseMoveHorizontal = useCallback((e) => {
    if (isDataPanelCollapsed) return
    if (!isDraggingHorizontal || !mainContentRef.current) return
    e.preventDefault()

    const rect = mainContentRef.current.getBoundingClientRect()
    const newHeight = ((rect.bottom - e.clientY) / rect.height) * 100

    if (newHeight > 15 && newHeight < 60) {
      setDataHeight(newHeight)
    }
  }, [isDraggingHorizontal, isDataPanelCollapsed])

  const collapseDataPanel = useCallback(() => {
    if (isDataPanelCollapsed) return
    previousDataHeightRef.current = dataHeight
    setDataHeight(0)
    setIsDataPanelCollapsed(true)
    setIsBottomPanelFullScreen(false)
  }, [isDataPanelCollapsed, dataHeight])

  const expandDataPanel = useCallback(() => {
    if (!isDataPanelCollapsed) return
    const restoredHeight = Math.min(60, Math.max(15, previousDataHeightRef.current || 35))
    setDataHeight(restoredHeight)
    setIsDataPanelCollapsed(false)
  }, [isDataPanelCollapsed])

  const toggleDataPanelCollapse = useCallback(() => {
    if (isDataPanelCollapsed) {
      expandDataPanel()
      return
    }
    collapseDataPanel()
  }, [isDataPanelCollapsed, collapseDataPanel, expandDataPanel])

  const toggleBottomPanelFullScreen = useCallback(() => {
    if (isBottomPanelFullScreen) {
      setIsBottomPanelFullScreen(false)
      if (!previousBottomPanelDepthCollapsedRef.current) {
        expandMarketDepthPanel()
      }
      return
    }

    if (isDataPanelCollapsed) {
      expandDataPanel()
    }

    previousBottomPanelDepthCollapsedRef.current = isMarketDepthCollapsed
    collapseMarketDepthPanel()
    setIsBottomPanelFullScreen(true)
  }, [
    isBottomPanelFullScreen,
    isDataPanelCollapsed,
    isMarketDepthCollapsed,
    collapseMarketDepthPanel,
    expandDataPanel,
    expandMarketDepthPanel
  ])

  const toggleDataWorkspacePanel = useCallback(() => {
    if (isDataPanelCollapsed) {
      setActiveBottomPanel('data')
      expandDataPanel()
      return
    }

    if (activeBottomPanel === 'data') {
      collapseDataPanel()
      return
    }

    setActiveBottomPanel('data')
  }, [isDataPanelCollapsed, activeBottomPanel, expandDataPanel, collapseDataPanel])

  const toggleBlotterPanel = useCallback(() => {
    if (isDataPanelCollapsed) {
      setActiveBottomPanel('blotter')
      expandDataPanel()
      return
    }

    if (activeBottomPanel === 'blotter') {
      collapseDataPanel()
      return
    }

    setActiveBottomPanel('blotter')
  }, [isDataPanelCollapsed, activeBottomPanel, expandDataPanel, collapseDataPanel])

  const toggleAlertsPanel = useCallback(() => {
    if (isDataPanelCollapsed) {
      setActiveBottomPanel('alerts')
      expandDataPanel()
      return
    }

    if (activeBottomPanel === 'alerts') {
      collapseDataPanel()
      return
    }

    setActiveBottomPanel('alerts')
  }, [isDataPanelCollapsed, activeBottomPanel, expandDataPanel, collapseDataPanel])

  const toggleOrdersPanel = useCallback(() => {
    if (isDataPanelCollapsed) {
      setActiveBottomPanel('orders')
      expandDataPanel()
      return
    }

    if (activeBottomPanel === 'orders') {
      collapseDataPanel()
      return
    }

    setActiveBottomPanel('orders')
  }, [isDataPanelCollapsed, activeBottomPanel, expandDataPanel, collapseDataPanel])

  const toggleBondTableFullScreen = useCallback(() => {
    if (isBondTableFullScreen) {
      expandMarketDepthPanel()
      expandDataPanel()
      return
    }

    collapseMarketDepthPanel()
    collapseDataPanel()
  }, [
    isBondTableFullScreen,
    collapseMarketDepthPanel,
    collapseDataPanel,
    expandMarketDepthPanel,
    expandDataPanel
  ])

  useEffect(() => {
    if (workspaceMode === 'blank') return
    if (!panelCommand?.panelKey || !panelCommand?.requestedAt) return
    if (lastProcessedPanelCommandAtRef.current === panelCommand.requestedAt) return

    lastProcessedPanelCommandAtRef.current = panelCommand.requestedAt

    if (panelCommand.panelKey === 'trading') {
      toggleBondTableFullScreen()
      return
    }

    if (panelCommand.panelKey === 'data') {
      toggleDataWorkspacePanel()
      return
    }

    if (panelCommand.panelKey === 'blotter') {
      toggleBlotterPanel()
      return
    }

    if (panelCommand.panelKey === 'alerts') {
      toggleAlertsPanel()
      return
    }

    if (panelCommand.panelKey === 'orders') {
      toggleOrdersPanel()
      return
    }

    if (panelCommand.panelKey === 'depth') {
      toggleMarketDepthCollapse()
    }
  }, [
    panelCommand,
    toggleBondTableFullScreen,
    toggleDataWorkspacePanel,
    toggleBlotterPanel,
    toggleAlertsPanel,
    toggleOrdersPanel,
    toggleMarketDepthCollapse,
    workspaceMode
  ])

  const getBlankPanelTitle = useCallback((panelKey) => {
    switch (panelKey) {
      case 'trading':
        return t('sidebar.trading')
      case 'data':
        return t('sidebar.data')
      case 'depth':
        return t('sidebar.depth')
      case 'blotter':
        return t('sidebar.blotter')
      case 'alerts':
        return t('sidebar.alerts')
      case 'orders':
        return t('sidebar.orders')
      default:
        return panelKey
    }
  }, [t])

  // ══════════════════════════════════════════════════════════════════════════════════════════
  // DOCKABLE WORKSPACE — slot + grid interaction handlers
  // These have been moved into DockableWorkspaceGrid.jsx as internal handlers.
  // They are NO LONGER NEEDED in MainContent.
  //
  // Removed:
  //   handleBlankSlotDrop       → DockableWorkspaceGrid#handleSlotDrop
  //   handleBlankSlotDragOver   → DockableWorkspaceGrid#handleSlotDragOver
  //   handleBlankSlotDragLeave  → DockableWorkspaceGrid#handleSlotDragLeave
  //   handleBlankSlotClear      → DockableWorkspaceGrid#handleSlotClear
  //   handleBlankSlotCollapse   → DockableWorkspaceGrid#handleSlotCollapse
  //   toggleBlankSlotFullScreen → DockableWorkspaceGrid internal state
  //   findBlankSlotIndexByPanel → no longer needed (DockableWorkspaceGrid owns full-screen state)
  //   handleGridResizeStart     → DockableWorkspaceGrid#handleGridResizeStart
  //   handleGridResizeMove      → DockableWorkspaceGrid#handleGridResizeMove
  //   handleGridResizeEnd       → DockableWorkspaceGrid#handleGridResizeEnd
  //   grid resize useEffect     → owned by DockableWorkspaceGrid
  // ══════════════════════════════════════════════════════════════════════════════════════════

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

  // New RFQ modal management (multiple windows support)
  const getInlineRfqPosition = useCallback((windowIndex) => {
    const existingInlineModal = document.querySelector('.rfq-modal.rfq-floating-window')
    const measuredWidth = existingInlineModal?.offsetWidth
    const measuredHeight = existingInlineModal?.offsetHeight
    const appElement = document.querySelector('.main-content')

    const modalWidth = measuredWidth || Math.min(RFQ_POPUP_WIDTH, Math.max(320, window.innerWidth - 20))
    const modalHeight = measuredHeight || Math.max(220, window.innerHeight - 20)
    const appRect = appElement?.getBoundingClientRect()

    const centeredX = appRect
      ? Math.max(8, Math.round(appRect.left + ((appRect.width - modalWidth) / 2)))
      : Math.max(8, Math.round((window.innerWidth - modalWidth) / 2))
    const centeredY = appRect
      ? Math.max(8, Math.round(appRect.top + ((appRect.height - modalHeight) / 2)))
      : Math.max(8, Math.round((window.innerHeight - modalHeight) / 2))

    return {
      x: centeredX + (windowIndex * RFQ_CASCADE_X),
      y: centeredY + (windowIndex * RFQ_CASCADE_Y)
    }
  }, [])

  const getPopupRfqPosition = useCallback((windowIndex) => {
    const hostLeft = Number.isFinite(window.screenX) ? window.screenX : window.screenLeft || 0
    const hostTop = Number.isFinite(window.screenY) ? window.screenY : window.screenTop || 0
    const hostWidth = window.outerWidth || window.innerWidth || RFQ_POPUP_WIDTH
    const hostHeight = window.outerHeight || window.innerHeight || RFQ_POPUP_HEIGHT

    const centeredLeft = Math.round(hostLeft + ((hostWidth - RFQ_POPUP_WIDTH) / 2))
    const centeredTop = Math.round(hostTop + ((hostHeight - RFQ_POPUP_HEIGHT) / 2))

    return {
      left: centeredLeft + (windowIndex * RFQ_CASCADE_X),
      top: centeredTop + (windowIndex * RFQ_CASCADE_Y)
    }
  }, [])

  const rfqAlwaysOnTopEnabled = Boolean(preferences?.rfqOpenInPopup && preferences?.rfqAlwaysOnTop)

  const markPopupAsActive = useCallback((rfqId) => {
    const nextOrder = popupActivationOrderRef.current.filter((id) => id !== rfqId)
    nextOrder.push(rfqId)
    popupActivationOrderRef.current = nextOrder
  }, [])

  const getTopPopupId = useCallback(() => {
    const orderedIds = popupActivationOrderRef.current
    for (let i = orderedIds.length - 1; i >= 0; i -= 1) {
      const id = orderedIds[i]
      const windowInfo = rfqWindowsRef.current.get(id)
      if (windowInfo?.window && !windowInfo.window.closed) {
        return id
      }
    }

    const modalWithPopup = [...rfqModals].reverse().find((modal) => {
      const windowInfo = rfqWindowsRef.current.get(modal.id)
      return Boolean(windowInfo?.window && !windowInfo.window.closed)
    })

    return modalWithPopup?.id || null
  }, [rfqModals])

  const bringPopupToFront = useCallback((forcedId = null, options = {}) => {
    const { bypassThrottle = false } = options
    if (!rfqAlwaysOnTopEnabled) return

    const targetId = forcedId || getTopPopupId()
    if (!targetId) return

    const windowInfo = rfqWindowsRef.current.get(targetId)
    if (!windowInfo?.window || windowInfo.window.closed) return

    const now = Date.now()
    if (!bypassThrottle && lastBringToFrontRef.current.id === targetId && (now - lastBringToFrontRef.current.at) < 180) {
      return
    }

    try {
      windowInfo.window.focus()
      markPopupAsActive(targetId)
      lastBringToFrontRef.current = { id: targetId, at: Date.now() }
    } catch (error) {
      console.debug('Unable to focus RFQ popup window:', error)
    }
  }, [getTopPopupId, markPopupAsActive, rfqAlwaysOnTopEnabled])

  const restackAllPopups = useCallback(() => {
    if (!rfqAlwaysOnTopEnabled) {
      return
    }

    const openPopupIds = popupActivationOrderRef.current.filter((id) => {
      const info = rfqWindowsRef.current.get(id)
      return Boolean(info?.window && !info.window.closed)
    })

    if (openPopupIds.length === 0) {
      return
    }

    if (openPopupIds.length === 1) {
      bringPopupToFront(openPopupIds[0], { bypassThrottle: true })
      return
    }

    openPopupIds.forEach((id, index) => {
      window.setTimeout(() => {
        bringPopupToFront(id, { bypassThrottle: true })
      }, index * 24)
    })

    const topId = openPopupIds[openPopupIds.length - 1]
    window.setTimeout(() => {
      bringPopupToFront(topId, { bypassThrottle: true })
    }, openPopupIds.length * 24 + 36)
  }, [bringPopupToFront, rfqAlwaysOnTopEnabled])

  const requestBringPopupToFront = useCallback((forcedId = null) => {
    if (!rfqAlwaysOnTopEnabled) {
      return
    }

    bringPopupToFront(forcedId)

    const retryDelays = [70, 170]
    retryDelays.forEach((delayMs) => {
      window.setTimeout(() => {
        bringPopupToFront(forcedId, { bypassThrottle: true })
      }, delayMs)
    })
  }, [bringPopupToFront, rfqAlwaysOnTopEnabled])

  const requestRestackAllPopups = useCallback(() => {
    if (!rfqAlwaysOnTopEnabled) {
      return
    }

    restackAllPopups()

    const retryDelays = [90, 210]
    retryDelays.forEach((delayMs) => {
      window.setTimeout(() => {
        restackAllPopups()
      }, delayMs)
    })
  }, [restackAllPopups, rfqAlwaysOnTopEnabled])

  const createRfqWindow = useCallback((rfqId, windowIndex, openMode = 'popup') => {
    const windowInfo = rfqWindowsRef.current.get(rfqId)
    if (windowInfo && !windowInfo.window.closed) {
      return windowInfo
    }

    const safeIndex = Number.isFinite(windowIndex) ? windowIndex : rfqWindowsRef.current.size
    const isTabMode = openMode === 'tab'
    const popupPosition = getPopupRfqPosition(safeIndex)

    const popup = isTabMode
      ? window.open('', `_blank`)
      : window.open(
        '',
        `rfq-outright-window-${rfqId}`,
        `width=${RFQ_POPUP_WIDTH},height=${RFQ_POPUP_HEIGHT},left=${popupPosition.left},top=${popupPosition.top},resizable=yes,scrollbars=no`
      )
    if (!popup) {
      console.error('Failed to open RFQ window')
      return null
    }

    popup.document.title = `${windowIndex + 1}. RFQ OUTRIGHT`
    popup.document.body.style.margin = '0'
    popup.document.body.style.padding = '0'
    popup.document.body.style.background = '#0a1f1f'
    popup.document.body.style.overflow = 'hidden'

    // Clone stylesheets
    popup.document.head.innerHTML = ''
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
      popup.document.head.appendChild(node.cloneNode(true))
    })

    const root = popup.document.createElement('div')
    root.id = 'rfq-popup-root'
    root.style.width = '100%'
    root.style.height = '100%'
    root.style.display = 'flex'
    root.style.flexDirection = 'column'
    popup.document.body.appendChild(root)

    popup.focus()
    markPopupAsActive(rfqId)

    popup.addEventListener('focus', () => {
      markPopupAsActive(rfqId)
    })

    popup.addEventListener('mousedown', () => {
      markPopupAsActive(rfqId)
    })

    popup.onbeforeunload = () => {
      // Clean up when window is closed
      rfqWindowsRef.current.delete(rfqId)
      popupActivationOrderRef.current = popupActivationOrderRef.current.filter((id) => id !== rfqId)
      setRfqModals(prev => prev.filter(m => m.id !== rfqId))
    }

    const newWindowInfo = { window: popup, container: root }
    rfqWindowsRef.current.set(rfqId, newWindowInfo)

    if (rfqAlwaysOnTopEnabled) {
      requestAnimationFrame(() => requestBringPopupToFront(rfqId))
    }

    return newWindowInfo
  }, [getPopupRfqPosition, markPopupAsActive, requestBringPopupToFront, rfqAlwaysOnTopEnabled])

  const closeRfqWindow = useCallback((rfqId) => {
    const windowInfo = rfqWindowsRef.current.get(rfqId)
    if (windowInfo && !windowInfo.window.closed) {
      windowInfo.window.close()
    }
    rfqWindowsRef.current.delete(rfqId)
    popupActivationOrderRef.current = popupActivationOrderRef.current.filter((id) => id !== rfqId)
    setRfqModals(prev => prev.filter(m => m.id !== rfqId))
  }, [])

  const minimizeInlineRfqWindow = useCallback((rfqId) => {
    setRfqModals(prev => prev.map((modal) => (
      modal.id === rfqId ? { ...modal, minimized: true } : modal
    )))
  }, [])

  const restoreInlineRfqWindow = useCallback((rfqId) => {
    setRfqModals(prev => prev.map((modal) => (
      modal.id === rfqId ? { ...modal, minimized: false } : modal
    )))
  }, [])

  useEffect(() => {
    if (!rfqAlwaysOnTopEnabled) {
      return
    }

    const scheduleBringToFront = () => {
      requestAnimationFrame(() => requestBringPopupToFront())
    }

    const handleHostFocus = () => {
      scheduleBringToFront()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        scheduleBringToFront()
      }
    }

    const handleHostPointerInteraction = () => {
      requestAnimationFrame(() => requestRestackAllPopups())
    }

    window.addEventListener('focus', handleHostFocus)
    window.addEventListener('pointerdown', handleHostPointerInteraction, true)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleHostFocus)
      window.removeEventListener('pointerdown', handleHostPointerInteraction, true)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [requestBringPopupToFront, requestRestackAllPopups, rfqAlwaysOnTopEnabled])

  useEffect(() => {
    if (!rfqAlwaysOnTopEnabled || rfqModals.length === 0) {
      return
    }

    requestAnimationFrame(() => requestBringPopupToFront())
  }, [requestBringPopupToFront, rfqAlwaysOnTopEnabled, rfqModals])

  // Cleanup all windows on unmount
  useEffect(() => {
    return () => {
      rfqWindowsRef.current.forEach((info) => {
        if (info.window && !info.window.closed) {
          info.window.close()
        }
      })
      rfqWindowsRef.current.clear()
    }
  }, [])

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

  // Handle RFQ OUTRIGHT button click
  const handleOpenRfqOutright = useCallback(async () => {
    if (!selectedBond) {
      console.warn('No bond selected')
      return
    }

    // Check max 5 windows limit
    if (rfqModals.length >= 5) {
      setErrorMessage(t('rfq.maxWindowsError'))
      setTimeout(() => setErrorMessage(null), 5000)
      return
    }

    try {
      // Fetch pricing data from backend
      const response = await fetch(`/api/bonds/${selectedBond.isin}/rfq-data`)
      if (!response.ok) throw new Error(t('rfq.fetchError'))
      
      const data = await response.json()
      
      if (data && data.dealers && data.quotes) {
        // Create new RFQ modal with unique ID
        const rfqId = `rfq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        
        const totalModalCount = rfqModals.length
        const initialPosition = getInlineRfqPosition(totalModalCount)
        const centerOnMount = totalModalCount === 0
        
        const newModal = {
          id: rfqId,
          bond: selectedBond,
          pricingData: data,
          initialPosition,
          centerOnMount,
          minimized: false
        }

        if (preferences?.rfqOpenInPopup || preferences?.rfqOpenInTab) {
          const openMode = preferences?.rfqOpenInTab ? 'tab' : 'popup'
          const windowInfo = createRfqWindow(rfqId, totalModalCount, openMode)
          if (!windowInfo) {
            setErrorMessage(t('rfq.loadingError'))
            setTimeout(() => setErrorMessage(null), 5000)
            return
          }
          newModal.window = windowInfo.window
          newModal.container = windowInfo.container
        }

        // Add to modals array
        setRfqModals(prev => [...prev, newModal])
      } else {
        console.error('Invalid pricing data:', data)
        setErrorMessage(t('rfq.loadingError'))
        setTimeout(() => setErrorMessage(null), 5000)
      }
    } catch (error) {
      console.error('Error fetching RFQ data:', error)
      setErrorMessage(t('rfq.loadingError'))
      setTimeout(() => setErrorMessage(null), 5000)
    }
  }, [selectedBond, preferences?.rfqOpenInPopup, preferences?.rfqOpenInTab, rfqModals.length, createRfqWindow, getInlineRfqPosition, t])

  // Handle double-click on bond row to open RFQ OUTRIGHT (new window each time)
  const handleBondDoubleClick = useCallback((bond) => {
    // Check max 5 windows limit
    if (rfqModals.length >= 5) {
      setErrorMessage(t('rfq.maxWindowsError'))
      setTimeout(() => setErrorMessage(null), 5000)
      return
    }

    setSelectedBond(bond)
    
    const url = `/api/bonds/${bond.isin}/rfq-data`
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        return response.json()
      })
      .then(data => {
        if (data && data.dealers && data.quotes) {
          // Create new RFQ modal with unique ID for EACH double-click
          const rfqId = `rfq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          
          const totalModalCount = rfqModals.length
          const initialPosition = getInlineRfqPosition(totalModalCount)
          const centerOnMount = totalModalCount === 0
          
          const newModal = {
            id: rfqId,
            bond: bond,
            pricingData: data,
            initialPosition,
            centerOnMount,
            minimized: false
          }

          if (preferences?.rfqOpenInPopup || preferences?.rfqOpenInTab) {
            const openMode = preferences?.rfqOpenInTab ? 'tab' : 'popup'
            const windowInfo = createRfqWindow(rfqId, totalModalCount, openMode)
            if (!windowInfo) {
              setErrorMessage(t('rfq.loadingError'))
              setTimeout(() => setErrorMessage(null), 5000)
              return
            }
            newModal.window = windowInfo.window
            newModal.container = windowInfo.container
          }

          // Add to modals array (don't replace, just add)
          setRfqModals(prev => [...prev, newModal])
        } else {
          console.error('Invalid pricing data structure:', data)
          setErrorMessage(t('rfq.loadingError'))
          setTimeout(() => setErrorMessage(null), 5000)
        }
      })
      .catch(error => {
        console.error('Error fetching RFQ data:', error)
        setErrorMessage(t('rfq.loadingError'))
        setTimeout(() => setErrorMessage(null), 5000)
      })
  }, [rfqModals.length, preferences?.rfqOpenInPopup, preferences?.rfqOpenInTab, createRfqWindow, getInlineRfqPosition, t])

  const renderBlankPanelContent = useCallback((panelKey) => {
    if (panelKey === 'trading') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Top tabs row: All / Axed / BV + Search Column (no maximize — DockablePanelShell provides it) */}
          <div className="top-tabs" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {topTabs.map((tab, i) => (
              <button
                key={`top-${tab.code}-${i}`}
                className={`country-tab ${selectedTopTab === tab.code ? 'active' : ''}`}
                onClick={() => setSelectedTopTab(tab.code)}
                title={tab.name}
              >
                <span className="flag">{tab.flag}</span>
                <span className="code">{getTopTabLabel(tab.code, tab.name)}</span>
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <div className="column-search-wrap" style={{ width: 220, minWidth: 220 }}>
              <input
                type="text"
                className="column-search-input"
                placeholder="Search Column"
                value={columnSearchTerm}
                onChange={(e) => setColumnSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Country tabs row: Gov selector + flag buttons */}
          <div className="country-tabs" style={{ flexShrink: 0 }}>
            <div className="gov-selector-container">
              <select id="gov-selector" className="gov-selector">
                <option>{t('mainContent.govOptions.govCountry')}</option>
                <option>{t('mainContent.govOptions.govMaturity')}</option>
                <option>{t('mainContent.govOptions.govSwitches')}</option>
                <option>{t('mainContent.govOptions.govGtdSsa')}</option>
                <option>{t('mainContent.govOptions.coveredMaturity')}</option>
                <option>{t('mainContent.govOptions.ssasMaturity')}</option>
                <option>{t('mainContent.govOptions.corporateIndustry')}</option>
                <option>{t('mainContent.govOptions.banksFinancials')}</option>
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

          {/* Bond table */}
          <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
            <BondTable
              onSelectBond={setSelectedBond}
              onDoubleClickBond={handleBondDoubleClick}
              countryBonds={dataTableRows}
              searchTerm={searchTerm}
              columnSearchTerm={columnSearchTerm}
            />
          </div>
        </div>
      )
    }

    if (panelKey === 'data') {
      return (
        <div className="ag-theme-alpine-dark data-grid">
          <AgGridReact
            rowData={dataTableRows}
            columnDefs={dataColumnDefs}
            defaultColDef={dataDefaultColDef}
            domLayout='normal'
            suppressCellFocus={true}
          />
        </div>
      )
    }

    if (panelKey === 'depth') {
      return (
        <MarketDepth
          selectedBond={selectedBond}
          collapsed={false}
          onToggleCollapse={() => {}}
        />
      )
    }

    if (panelKey === 'blotter') {
      return (
        <div className="ag-theme-alpine-dark data-grid">
          <AgGridReact
            rowData={[]}
            columnDefs={blotterColumnDefs}
            defaultColDef={dataDefaultColDef}
            domLayout='normal'
            suppressCellFocus={true}
          />
        </div>
      )
    }

    if (panelKey === 'orders') {
      return (
        <div className="ag-theme-alpine-dark data-grid">
          <AgGridReact
            rowData={[]}
            columnDefs={ordersColumnDefs}
            defaultColDef={dataDefaultColDef}
            domLayout='normal'
            suppressCellFocus={true}
          />
        </div>
      )
    }

    return (
      <div className="ag-theme-alpine-dark data-grid">
        <AgGridReact
          rowData={[]}
          columnDefs={alertsColumnDefs}
          defaultColDef={dataDefaultColDef}
          domLayout='normal'
          suppressCellFocus={true}
        />
      </div>
    )
  }, [
    columnSearchTerm,
    dataColumnDefs,
    dataDefaultColDef,
    dataTableRows,
    getTopTabLabel,
    handleBondDoubleClick,
    searchTerm,
    selectedBond,
    selectedCountry,
    selectedTopTab,
    setColumnSearchTerm,
    setSelectedBond,
    setSelectedCountry,
    setSelectedTopTab,
    t,
  ])

  // Handle RFQ submission
  const handleRfqSubmit = useCallback((rfqData) => {
    // Send to backend
    fetch('/api/rfq/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rfqData)
    })
      .then(response => response.json())
      .then(data => {
        // Could add success notification here
      })
      .catch(error => console.error('Error submitting RFQ:', error))
  }, [])

  useEffect(() => {
    rfqModals.forEach((modal, index) => {
      const popupWindow = rfqWindowsRef.current.get(modal.id)?.window || modal.window
      if (popupWindow && !popupWindow.closed) {
        popupWindow.document.title = `${index + 1}. ${t('rfq.title')}`
      }
    })
  }, [rfqModals, t])

  // ══════════════════════════════════════════════════════════════════════════════════════════
  // DOCKABLE WORKSPACE — render
  //
  // All grid layout computation (collapsedSet, vSpanSet, span logic, handle segments, CSS
  // templates) and all slot interaction handlers now live inside DockableWorkspaceGrid.
  // MainContent's responsibility here is only: pass controlled props, bridge callbacks,
  // and compose the outer shell (toolbar + grid component).
  // ══════════════════════════════════════════════════════════════════════════════════════════
  if (isBlankWorkspace) {
    return (
      <div className="main-content blank-workspace-content">
        {/* ── RFQ toolbar ──────────────────────────────────────────────────── */}
        <div className="rfq-toolbar">
          <div className="toolbar-left">
            <div className="rfq-dropdown">
              <button
                className={`rfq-button ${expandedRFQ ? 'expanded' : ''}`}
                onClick={() => setExpandedRFQ(!expandedRFQ)}
              >
                {t('mainContent.openRfq')} ▼
              </button>
              {expandedRFQ && (
                <div className="rfq-menu">
                  {rfqTypes.map(type => (
                    <div
                      key={type}
                      className={`rfq-option ${selectedRFQ === type ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedRFQ(type)
                        if (type === 'RFQ OUTRIGHT') handleOpenRfqOutright()
                        setExpandedRFQ(false)
                      }}
                    >
                      {getRfqTypeLabel(type)}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <input
              type="text"
              placeholder={t('mainContent.searchBondsPlaceholder')}
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="toolbar-right">
            <button className="rfq-toolbar-button">{t('mainContent.rfqToolbar')}</button>
          </div>
        </div>

        {/* ── Dockable panel grid ──────────────────────────────────────────── */}
        <DockableWorkspaceGrid
          slots={normalizedWorkspaceSlots}
          hiddenSlots={workspaceHiddenSlots}
          isEditMode={isWorkspaceEditMode}
          colWidths={colWidths}
          rowHeights={rowHeights}
          rightColumnRowHeights={rightColumnRowHeights}
          onResize={handleGridResize}
          onResizeCommit={handleGridResizeCommit}
          onRightColumnResize={handleRightColumnResize}
          onRightColumnResizeCommit={handleRightColumnResizeCommit}
          onSlotChange={onWorkspaceSlotChange}
          onHiddenSlotsChange={onWorkspaceHiddenSlotsChange}
          renderPanelContent={renderBlankPanelContent}
          getPanelTitle={getBlankPanelTitle}
        />
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════════════════════════
  // LEGACY WORKSPACE — render  ┌ SCHEDULED FOR REMOVAL ┐
  //
  // This branch renders when workspaceMode === 'legacy'. It implements the original
  // fixed-panel layout with a split trading table, market depth, blotter, alerts and
  // orders panels using explicit flex/resize logic.
  //
  // All state, handlers and JSX below this comment are LEGACY and will be deleted once
  // the dockable workspace is the sole mode. Do NOT add new features here.
  // ══════════════════════════════════════════════════════════════════════════════════════════
  return (
    <div className="main-content" ref={mainContentRef}>
      <div className="rfq-toolbar">
        <div className="toolbar-left">
          <div className="rfq-dropdown">
            <button 
              className={`rfq-button ${expandedRFQ ? 'expanded' : ''}`} 
              onClick={() => setExpandedRFQ(!expandedRFQ)}
            >
              {t('mainContent.openRfq')} ▼
            </button>
            {expandedRFQ && (
              <div className="rfq-menu">
                {rfqTypes.map(type => (
                  <div 
                    key={type} 
                    className={`rfq-option ${selectedRFQ === type ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedRFQ(type)
                      if (type === 'RFQ OUTRIGHT') {
                        handleOpenRfqOutright()
                      }
                      setExpandedRFQ(false)
                    }}
                  >
                    {getRfqTypeLabel(type)}
                  </div>
                ))}
              </div>
            )}
          </div>
          <input 
            type="text" 
            placeholder={t('mainContent.searchBondsPlaceholder')} 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="toolbar-right">
          <button className="rfq-toolbar-button">{t('mainContent.rfqToolbar')}</button>
        </div>
      </div>

      <div className="workspace-body" ref={contentBodyRef} style={{ cursor: isDraggingVertical ? 'col-resize' : 'default' }}>
        <div className="left-workspace" style={{ flex: isMarketDepthCollapsed ? '0 0 100%' : `0 0 ${tradingWidth}%` }}>
          <div className="top-tabs">
            {topTabs.map((t, i) => (
              <button
                key={`top-${t.code}-${i}`}
                className={`country-tab ${selectedTopTab === t.code ? 'active' : ''}`}
                onClick={() => setSelectedTopTab(t.code)}
                title={t.name}
              >
                <span className="flag">{t.flag}</span>
                <span className="code">{getTopTabLabel(t.code, t.name)}</span>
              </button>
            ))}
          </div>

          <div className="country-tabs">
            <div className="gov-selector-container">
              <select id="gov-selector" className="gov-selector">
                <option>{t('mainContent.govOptions.govCountry')}</option>
                <option>{t('mainContent.govOptions.govMaturity')}</option>
                <option>{t('mainContent.govOptions.govSwitches')}</option>
                <option>{t('mainContent.govOptions.govGtdSsa')}</option>
                <option>{t('mainContent.govOptions.coveredMaturity')}</option>
                <option>{t('mainContent.govOptions.ssasMaturity')}</option>
                <option>{t('mainContent.govOptions.corporateIndustry')}</option>
                <option>{t('mainContent.govOptions.banksFinancials')}</option>
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

          <div className="content-body">
            <div className="trading-area-container">
              {!isBottomPanelFullScreen && (
                <BondTable 
                  onSelectBond={setSelectedBond} 
                  onDoubleClickBond={handleBondDoubleClick}
                  countryBonds={dataTableRows} 
                  searchTerm={searchTerm}
                  columnSearchTerm={columnSearchTerm}
                />
              )}

              {!isBottomPanelFullScreen && (
                <div
                  className={`resize-handle-horizontal ${isDataPanelCollapsed ? 'collapsed' : ''}`}
                  onMouseDown={handleMouseDownHorizontal}
                >
                  <button
                    className="panel-split-toggle panel-split-toggle-horizontal"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onClick={toggleDataPanelCollapse}
                    aria-label={isDataPanelCollapsed ? t('mainContent.expandDataPanel') : t('mainContent.collapseDataPanel')}
                    title={isDataPanelCollapsed ? t('mainContent.expandDataPanel') : t('mainContent.collapseDataPanel')}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {isDataPanelCollapsed ? (
                        <polyline points="18 15 12 9 6 15"/>
                      ) : (
                        <polyline points="6 9 12 15 18 9"/>
                      )}
                    </svg>
                  </button>
                </div>
              )}

              {!isDataPanelCollapsed && (
                <div className="data-section" style={{ flex: isBottomPanelFullScreen ? '1 1 auto' : `0 0 ${dataHeight}%` }}>
                  {activeBottomPanel === 'blotter' ? (
                    <DockablePanelShell
                      title={t('sidebar.blotter')}
                      isFullScreen={isBottomPanelFullScreen}
                      onToggleFullScreen={toggleBottomPanelFullScreen}
                      onClose={toggleBlotterPanel}
                    >
                      <div className="ag-theme-alpine-dark data-grid">
                        <AgGridReact
                          rowData={[]}
                          columnDefs={blotterColumnDefs}
                          defaultColDef={dataDefaultColDef}
                          domLayout='normal'
                          suppressCellFocus={true}
                        />
                      </div>
                    </DockablePanelShell>
                  ) : activeBottomPanel === 'alerts' ? (
                    <DockablePanelShell
                      title={t('sidebar.alerts')}
                      isFullScreen={isBottomPanelFullScreen}
                      onToggleFullScreen={toggleBottomPanelFullScreen}
                      onClose={toggleAlertsPanel}
                    >
                      <div className="ag-theme-alpine-dark data-grid">
                        <AgGridReact
                          rowData={[]}
                          columnDefs={alertsColumnDefs}
                          defaultColDef={dataDefaultColDef}
                          domLayout='normal'
                          suppressCellFocus={true}
                        />
                      </div>
                    </DockablePanelShell>
                  ) : activeBottomPanel === 'orders' ? (
                    <DockablePanelShell
                      title={t('sidebar.orders')}
                      isFullScreen={isBottomPanelFullScreen}
                      onToggleFullScreen={toggleBottomPanelFullScreen}
                      onClose={toggleOrdersPanel}
                    >
                      <div className="ag-theme-alpine-dark data-grid">
                        <AgGridReact
                          rowData={[]}
                          columnDefs={ordersColumnDefs}
                          defaultColDef={dataDefaultColDef}
                          domLayout='normal'
                          suppressCellFocus={true}
                        />
                      </div>
                    </DockablePanelShell>
                  ) : (
                    <DockablePanelShell
                      title={t('mainContent.dataTitle')}
                      isFullScreen={isBottomPanelFullScreen}
                      onToggleFullScreen={toggleBottomPanelFullScreen}
                      onClose={toggleDataWorkspacePanel}
                    >
                      <div className="ag-theme-alpine-dark data-grid">
                        <AgGridReact
                          rowData={dataTableRows}
                          columnDefs={dataColumnDefs}
                          defaultColDef={dataDefaultColDef}
                          domLayout='normal'
                          suppressCellFocus={true}
                        />
                      </div>
                    </DockablePanelShell>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className={`resize-handle-vertical ${isMarketDepthCollapsed ? 'collapsed' : ''}`}
          onMouseDown={handleMouseDownVertical}
        >
          <div
            className="column-search-wrap column-search-wrap-edge"
            onMouseDown={(e) => {
              e.stopPropagation()
            }}
          >
            <input
              type="text"
              className="column-search-input"
              placeholder="Search Column"
              value={columnSearchTerm}
              onMouseDown={(e) => {
                e.stopPropagation()
              }}
              onChange={(e) => setColumnSearchTerm(e.target.value)}
            />
          </div>

          <button
            className="fullscreen-toggle-button fullscreen-toggle-edge"
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onClick={toggleBondTableFullScreen}
            aria-label={isBondTableFullScreen ? t('mainContent.closeFullScreen') : t('mainContent.fullScreen')}
            title={isBondTableFullScreen ? t('mainContent.closeFullScreen') : t('mainContent.fullScreen')}
          >
            {isBondTableFullScreen ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 3 9 9 3 9" />
                <line x1="9" y1="9" x2="3" y2="3" />
                <polyline points="15 3 15 9 21 9" />
                <line x1="15" y1="9" x2="21" y2="3" />
                <polyline points="9 21 9 15 3 15" />
                <line x1="9" y1="15" x2="3" y2="21" />
                <polyline points="15 21 15 15 21 15" />
                <line x1="15" y1="15" x2="21" y2="21" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9" />
                <line x1="14" y1="10" x2="21" y2="3" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="10" y1="14" x2="3" y2="21" />
                <polyline points="3 9 3 3 9 3" />
                <line x1="3" y1="3" x2="10" y2="10" />
                <polyline points="21 15 21 21 15 21" />
                <line x1="14" y1="14" x2="21" y2="21" />
              </svg>
            )}
          </button>

          <button
            className="panel-split-toggle"
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onClick={toggleMarketDepthCollapse}
            aria-label={isMarketDepthCollapsed ? t('marketDepth.expandPanel') : t('marketDepth.collapsePanel')}
            title={isMarketDepthCollapsed ? t('marketDepth.expandPanel') : t('marketDepth.collapsePanel')}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isMarketDepthCollapsed ? (
                <polyline points="15 18 9 12 15 6"/>
              ) : (
                <polyline points="9 18 15 12 9 6"/>
              )}
            </svg>
          </button>
        </div>

        {!isMarketDepthCollapsed && (
          <div className="market-info" style={{ flex: `0 0 ${marketWidth}%` }}>
            <MarketDepth
              selectedBond={selectedBond}
              collapsed={isMarketDepthCollapsed}
              onToggleCollapse={toggleMarketDepthCollapse}
            />
          </div>
        )}
      </div>

      {/* Error notification */}
      {errorMessage && (
        <div style={{
          position: 'fixed',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#CF1D43',
          color: '#FFF',
          padding: '12px 20px',
          borderRadius: '4px',
          zIndex: 9999,
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
        }}>
          {errorMessage}
        </div>
      )}

      {/* Render multiple RFQ modals */}
      {rfqModals.map((modal, index) => {
        const isPopup = !!modal.container
        const rfqNode = (
          <RfqOutright
            key={modal.id}
            bond={modal.bond}
            pricingData={modal.pricingData}
            rfqSequence={index + 1}
            hostWindow={modal.window || window}
            initialPosition={modal.initialPosition}
            centerOnMount={!!modal.centerOnMount}
            isPopup={isPopup}
            isMinimized={!!modal.minimized}
            onMinimize={() => minimizeInlineRfqWindow(modal.id)}
            onRestore={() => restoreInlineRfqWindow(modal.id)}
            onClose={() => closeRfqWindow(modal.id)}
            onSubmit={handleRfqSubmit}
          />
        )

        // If popup, render in popup container
        if (modal.container) {
          return createPortal(rfqNode, modal.container)
        }

        // Otherwise render inline
        return rfqNode
      })}

      {rfqModals.some((modal) => !modal.container && modal.minimized) && (
        <div className="rfq-inline-dock" role="toolbar" aria-label={t('mainContent.openRfq')}>
          {rfqModals
            .filter((modal) => !modal.container && modal.minimized)
            .map((modal) => {
              const sequence = rfqModals.findIndex((item) => item.id === modal.id) + 1
              return (
                <div key={`dock-${modal.id}`} className="rfq-inline-dock-item">
                  <button
                    className="rfq-inline-dock-restore"
                    onClick={() => restoreInlineRfqWindow(modal.id)}
                  >
                    {`${sequence}. ${t('rfq.title')}`}
                  </button>
                  <button
                    className="rfq-inline-dock-close"
                    onClick={() => closeRfqWindow(modal.id)}
                    aria-label={t('rfq.closeAria')}
                  >
                    ✕
                  </button>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}

export default MainContent
