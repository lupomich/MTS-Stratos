/**
 * RFQ OUTRIGHT Floating Window Component
 * 
 * Implements a professional floating window for Request for Quote (RFQ) Outright trading.
 * Users can:
 * - Toggle SIDE between BUY (green) and SELL (red)
 * - Input SIZE with numerical validation
 * - View BONDVISION DEALER PRICING table with all dealer quotes
 * - Select/deselect dealers from the top 6 list (or extend selection)
 * - Submit RFQ with selected parameters
 * 
 * Design System: Stratos Design System
 * - Primary color: Teal #008D7F
 * - Success: #79D100 (for BUY side)
 * - Error: #CF1D43 (for SELL side)
 * - Dark theme: #0a1f1f
 * - Font: IBM Plex Sans
 * 
 * @component
 * @param {Object} bond - Bond data {isin, description}
 * @param {Object} pricingData - {dealers: string[], quotes: Object}
 * @param {Function} onClose - Callback to close the RFQ window
 * @param {Function} onSubmit - Callback when RFQ is submitted
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { usePreferences } from '../context/PreferencesContext';
import './RfqOutright.css';

const RfqOutright = ({ bond, pricingData, onClose, onSubmit, hostWindow, initialPosition, isPopup, centerOnMount = false, rfqSequence = 1, isMinimized = false, onMinimize, onRestore }) => {
  const { t } = useLanguage();
  const { preferences } = usePreferences();
  const [side, setSide] = useState('BUY');
  const [size, setSize] = useState('');
  const [minSize, setMinSize] = useState('');
  const [settlement, setSettlement] = useState('T + 2');
  const [tradeDate, setTradeDate] = useState('25/02/2026');
  const [bvBidAsk, setBvBidAsk] = useState('99.26176');
  const [ytm, setYtm] = useState('+7.7348');
  const [accruedDays, setAccruedDays] = useState('0.00 / 147');
  const [principal, setPrincipal] = useState('1,985,235.20');
  const [proceeds, setProceeds] = useState('EUR 1,985,235.20');
  const [dv01, setDv01] = useState('56.2');
  const [allocation, setAllocation] = useState('');
  const [infoValue, setInfoValue] = useState('');
  const [selectedDealers, setSelectedDealers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [validationError, setValidationError] = useState(null);
  const [showDealerActions, setShowDealerActions] = useState(false);
  const [activeDealerMode, setActiveDealerMode] = useState('bestQuotes');
  const [processedTradeEnabled, setProcessedTradeEnabled] = useState(false);
  const [position, setPosition] = useState(initialPosition || { x: 140, y: 90 });
  const [windowState, setWindowState] = useState('normal');
  const [windowSize, setWindowSize] = useState({ width: null, height: null });
  const [restoreSnapshot, setRestoreSnapshot] = useState(null);
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, originX: 0, originY: 0 });
  const resizeRef = useRef({
    resizing: false,
    handle: null,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    startLeft: 0,
    startTop: 0
  });
  const windowRef = useRef(null);
  const dealerActionsRef = useRef(null);
  const activeWindow = hostWindow || window;
  const maxDealersInRfq = Math.min(20, Math.max(1, Number.parseInt(preferences?.rfqMaxDealers, 10) || 6));
  const MIN_WINDOW_WIDTH = 760;
  const MIN_WINDOW_HEIGHT = 320;

  const clampPosition = useCallback((x, y) => {
    const fallbackWidth = Math.min(1070, Math.max(320, activeWindow.innerWidth - 20));
    const fallbackHeight = Math.min(760, Math.max(220, activeWindow.innerHeight - 20));
    const modalWidth = windowRef.current?.offsetWidth || fallbackWidth;
    const modalHeight = windowRef.current?.offsetHeight || fallbackHeight;
    const maxX = Math.max(8, activeWindow.innerWidth - modalWidth - 8);
    const maxY = Math.max(8, activeWindow.innerHeight - modalHeight - 8);

    return {
      x: Math.min(Math.max(8, x), maxX),
      y: Math.min(Math.max(8, y), maxY)
    };
  }, [activeWindow]);

  const clampSize = useCallback((width, height) => {
    const maxWidth = Math.max(MIN_WINDOW_WIDTH, activeWindow.innerWidth - 16);
    const maxHeight = Math.max(MIN_WINDOW_HEIGHT, activeWindow.innerHeight - 16);
    return {
      width: Math.min(Math.max(MIN_WINDOW_WIDTH, width), maxWidth),
      height: Math.min(Math.max(MIN_WINDOW_HEIGHT, height), maxHeight)
    };
  }, [activeWindow]);

  const clampPositionForSize = useCallback((x, y, width, height) => {
    const maxX = Math.max(8, activeWindow.innerWidth - width - 8);
    const maxY = Math.max(8, activeWindow.innerHeight - height - 8);

    return {
      x: Math.min(Math.max(8, x), maxX),
      y: Math.min(Math.max(8, y), maxY)
    };
  }, [activeWindow]);

  const getCurrentSnapshot = useCallback(() => {
    const rect = windowRef.current?.getBoundingClientRect();
    if (!rect) {
      const fallback = clampPosition(position.x, position.y);
      const fallbackWidth = windowSize.width || Math.min(1250, Math.max(320, activeWindow.innerWidth - 20));
      const fallbackHeight = windowSize.height || Math.min(760, Math.max(220, activeWindow.innerHeight - 20));
      return {
        x: fallback.x,
        y: fallback.y,
        width: fallbackWidth,
        height: fallbackHeight
      };
    }

    return {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    };
  }, [activeWindow, clampPosition, position.x, position.y, windowSize.height, windowSize.width]);

  const restoreWindow = useCallback(() => {
    const snapshot = restoreSnapshot || getCurrentSnapshot();
    const clampedSize = clampSize(snapshot.width, snapshot.height);
    const clampedPos = clampPositionForSize(snapshot.x, snapshot.y, clampedSize.width, clampedSize.height);
    setWindowSize(clampedSize);
    setPosition(clampedPos);
    setWindowState('normal');
  }, [clampPositionForSize, clampSize, getCurrentSnapshot, restoreSnapshot]);

  const maximizeWindow = useCallback(() => {
    if (windowState !== 'maximized') {
      setRestoreSnapshot(getCurrentSnapshot());
    }

    const width = Math.max(MIN_WINDOW_WIDTH, activeWindow.innerWidth - 16);
    const height = Math.max(MIN_WINDOW_HEIGHT, activeWindow.innerHeight - 16);
    setWindowSize({ width, height });
    setPosition({ x: 8, y: 8 });
    setWindowState('maximized');
  }, [activeWindow, getCurrentSnapshot, windowState]);

  const minimizeWindow = useCallback(() => {
    if (windowState !== 'minimized') {
      setRestoreSnapshot(getCurrentSnapshot());
    }
    setWindowState('minimized');
  }, [getCurrentSnapshot, windowState]);

  const toggleMaximizeRestore = useCallback(() => {
    if (windowState === 'maximized') {
      restoreWindow();
      return;
    }
    maximizeWindow();
  }, [maximizeWindow, restoreWindow, windowState]);

  const toggleMinimizeRestore = useCallback(() => {
    if (windowState === 'minimized') {
      restoreWindow();
      return;
    }
    minimizeWindow();
  }, [minimizeWindow, restoreWindow, windowState]);

  const handleMinimizeRestore = useCallback(() => {
    if (isPopup) {
      toggleMinimizeRestore();
      return;
    }

    if (isMinimized) {
      onRestore?.();
      return;
    }

    onMinimize?.();
  }, [isMinimized, isPopup, onMinimize, onRestore, toggleMinimizeRestore]);

  const defaultDealerPool = [
    '_D01', '_D02', '_D03', '_D04', '_D05', '_D06', '_D07', '_D09', '_D10', '_D11',
    '_D12', '_D13', '_D14', '_D15', '_D16', '_D17', '_D18', '_D19', '_D20', '_D21',
    'BARX', 'BBG', 'BNP', 'BOFA', 'BROAD', 'CACB', 'CACIB', 'CITI', 'DANS', 'DB',
    'GS', 'HSBC', 'IMI', 'ING', 'JEFF', 'JPM', 'JPM-T', 'MEDIO', 'MIZU', 'MPS',
    'MS', 'NATIX', 'NOMU', 'NWM', 'RBC EU', 'SCOTIA', 'SG', 'UBS', 'UNIGMB', 'UNISPA'
  ];

  const formatPastTime = () => {
    const now = new Date();
    const minutesAgo = Math.floor(Math.random() * 90) + 1;
    const past = new Date(now.getTime() - minutesAgo * 60000);
    return past.toTimeString().slice(0, 5);
  };

  const formatNumber = (value, decimals) => {
    if (value === null || value === undefined || value === '') return '';
    const numeric = Number.parseFloat(value);
    if (Number.isNaN(numeric)) return String(value);
    return numeric.toFixed(decimals);
  };

  const normalizeDealerId = (dealerId) => {
    if (!dealerId) return '';
    const trimmed = dealerId.trim().toUpperCase();
    if (/^_?D\d{2}$/.test(trimmed)) {
      return trimmed.startsWith('_') ? trimmed : `_${trimmed}`;
    }
    return trimmed;
  };

  const dealerButtons = Array.from(
    new Set([...(pricingData?.dealers || []), ...defaultDealerPool].map(normalizeDealerId))
  )
    .filter(Boolean)
    .sort((a, b) => {
      const aUnderscore = a.startsWith('_');
      const bUnderscore = b.startsWith('_');
      if (aUnderscore !== bUnderscore) {
        return aUnderscore ? -1 : 1;
      }
      return a.localeCompare(b);
    });

  const basePricingRows = useMemo(() => {
    const dealers = pricingData?.dealers || [];
    return dealers.map((dealerId) => {
      const normalizedDealerId = normalizeDealerId(dealerId);
      const quote = pricingData?.quotes?.[dealerId]
        || pricingData?.quotes?.[normalizedDealerId]
        || {};
      const useAsk = side === 'BUY';
      const priceValue = useAsk ? (quote.askPrice ?? quote.price) : (quote.bidPrice ?? quote.price);
      const yieldValue = useAsk ? (quote.askYield ?? quote.yield) : (quote.bidYield ?? quote.yield);
      const sizeValue = useAsk ? (quote.askSize ?? quote.size) : (quote.bidSize ?? quote.size);
      const axeValue = useAsk ? (quote.askAxe ?? quote.axe) : (quote.bidAxe ?? quote.axe);
      const antiAxeValue = useAsk ? (quote.bidAxe ?? quote.antiAxe) : (quote.askAxe ?? quote.antiAxe);
      return {
        dealer: normalizedDealerId,
        axe: Math.random() < 0.45 ? formatPastTime() : '',
        size: sizeValue ?? '',
        price: formatNumber(priceValue, 5),
        yield: formatNumber(yieldValue, 4),
        sprd: formatNumber(quote.spread ?? quote.sprd ?? '', 2),
        antiAxe: Math.random() < 0.35 ? formatPastTime() : ''
      };
    });
  }, [pricingData, side]);

  const sortedPricingRows = useMemo(() => {
    const rows = [...basePricingRows];
    rows.sort((a, b) => {
      const aPrice = Number.parseFloat(a.price);
      const bPrice = Number.parseFloat(b.price);
      const aValid = !Number.isNaN(aPrice);
      const bValid = !Number.isNaN(bPrice);
      if (!aValid && !bValid) return 0;
      if (!aValid) return 1;
      if (!bValid) return -1;
      return side === 'BUY' ? aPrice - bPrice : bPrice - aPrice;
    });
    return rows;
  }, [basePricingRows, side]);

  const bestDealerIds = useMemo(() => (
    sortedPricingRows
      .filter((row) => row.price !== '' && !Number.isNaN(Number.parseFloat(row.price)))
      .slice(0, maxDealersInRfq)
      .map((row) => row.dealer)
  ), [sortedPricingRows, maxDealersInRfq]);

  const oneWayAxedDealerIds = useMemo(() => {
    const parseSize = (sizeValue) => {
      const parsed = Number.parseFloat(String(sizeValue ?? '').replace(',', '.'));
      return Number.isNaN(parsed) ? -1 : parsed;
    };

    return sortedPricingRows
      .filter((row) => String(row.axe ?? '').trim() !== '' && String(row.antiAxe ?? '').trim() === '')
      .sort((a, b) => parseSize(b.size) - parseSize(a.size))
      .slice(0, maxDealersInRfq)
      .map((row) => row.dealer);
  }, [sortedPricingRows, maxDealersInRfq]);

  const isProcessedTradeToggleDisabled = !processedTradeEnabled && selectedDealers.length > 1;

  useEffect(() => {
    if (pricingData && pricingData.dealers) {
      setSelectedDealers((prev) => (prev.length === 0 ? bestDealerIds : prev));
      setActiveDealerMode('bestQuotes');
      setIsLoading(false);
    }
  }, [pricingData, bestDealerIds]);

  useEffect(() => {
    const shouldCenter = isPopup || centerOnMount;
    if (!shouldCenter) {
      return;
    }

    let rafId1 = null;
    let rafId2 = null;

    const updatePosition = () => {
      const modalRect = windowRef.current?.getBoundingClientRect();
      const modalWidth = modalRect?.width || windowRef.current?.offsetWidth || 900;
      const modalHeight = modalRect?.height || windowRef.current?.offsetHeight || 760;
      const appElement = !isPopup
        ? activeWindow.document.querySelector('.main-content')
        : null;
      const appRect = appElement?.getBoundingClientRect();

      const centeredX = appRect
        ? Math.max(16, Math.floor(appRect.left + ((appRect.width - modalWidth) / 2)))
        : Math.max(16, Math.floor((activeWindow.innerWidth - modalWidth) / 2));
      const centeredY = appRect
        ? Math.max(16, Math.floor(appRect.top + ((appRect.height - modalHeight) / 2)))
        : Math.max(16, Math.floor((activeWindow.innerHeight - modalHeight) / 2));
      setPosition(clampPosition(centeredX, centeredY));
    };

    rafId1 = activeWindow.requestAnimationFrame(() => {
      rafId2 = activeWindow.requestAnimationFrame(updatePosition);
    });

    if (isPopup) {
      activeWindow.addEventListener('resize', updatePosition);
      return () => {
        if (rafId1) activeWindow.cancelAnimationFrame(rafId1);
        if (rafId2) activeWindow.cancelAnimationFrame(rafId2);
        activeWindow.removeEventListener('resize', updatePosition);
      };
    }

    return () => {
      if (rafId1) activeWindow.cancelAnimationFrame(rafId1);
      if (rafId2) activeWindow.cancelAnimationFrame(rafId2);
    };
  }, [activeWindow, centerOnMount, clampPosition, isPopup, isLoading]);

  useEffect(() => {
    if (isLoading) return;

    const rafId = activeWindow.requestAnimationFrame(() => {
      setPosition((prev) => {
        const next = clampPosition(prev.x, prev.y);
        if (next.x === prev.x && next.y === prev.y) {
          return prev;
        }
        return next;
      });
    });

    return () => activeWindow.cancelAnimationFrame(rafId);
  }, [activeWindow, clampPosition, isLoading]);

  const handleDragMove = useCallback((event) => {
    if (!dragRef.current.dragging) return;

    if (event.cancelable) {
      event.preventDefault();
    }

    const nextX = dragRef.current.originX + (event.clientX - dragRef.current.startX);
    const nextY = dragRef.current.originY + (event.clientY - dragRef.current.startY);
    setPosition(clampPosition(nextX, nextY));
  }, [clampPosition]);

  const handleDragEnd = useCallback(() => {
    dragRef.current.dragging = false;
    activeWindow.removeEventListener('mousemove', handleDragMove);
    activeWindow.removeEventListener('mouseup', handleDragEnd);
    activeWindow.removeEventListener('mouseleave', handleDragEnd);
    activeWindow.removeEventListener('blur', handleDragEnd);
  }, [activeWindow, handleDragMove]);

  const handleDragStart = useCallback((event) => {
    if (windowState !== 'normal') return;
    if (event.button !== 0) return;

    event.preventDefault();
    event.stopPropagation();

    if (activeWindow.getSelection) {
      activeWindow.getSelection().removeAllRanges();
    }

    dragRef.current = {
      dragging: true,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y
    };

    activeWindow.addEventListener('mousemove', handleDragMove);
    activeWindow.addEventListener('mouseup', handleDragEnd);
    activeWindow.addEventListener('mouseleave', handleDragEnd);
    activeWindow.addEventListener('blur', handleDragEnd);
  }, [activeWindow, handleDragEnd, handleDragMove, position.x, position.y, windowState]);

  const handleResizeMove = useCallback((event) => {
    if (!resizeRef.current.resizing) return;

    if (event.cancelable) {
      event.preventDefault();
    }

    const {
      handle,
      startX,
      startY,
      startWidth,
      startHeight,
      startLeft,
      startTop
    } = resizeRef.current;

    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    let nextWidth = startWidth;
    let nextHeight = startHeight;
    let nextLeft = startLeft;
    let nextTop = startTop;

    if (handle.includes('e')) {
      nextWidth = startWidth + dx;
    }
    if (handle.includes('s')) {
      nextHeight = startHeight + dy;
    }
    if (handle.includes('w')) {
      nextWidth = startWidth - dx;
      nextLeft = startLeft + dx;
    }
    if (handle.includes('n')) {
      nextHeight = startHeight - dy;
      nextTop = startTop + dy;
    }

    const clampedSize = clampSize(nextWidth, nextHeight);

    if (handle.includes('w')) {
      nextLeft = startLeft + (startWidth - clampedSize.width);
    }
    if (handle.includes('n')) {
      nextTop = startTop + (startHeight - clampedSize.height);
    }

    const clampedPos = clampPosition(nextLeft, nextTop);
    setWindowSize(clampedSize);
    setPosition(clampedPos);
  }, [clampPosition, clampSize]);

  const handleResizeEnd = useCallback(() => {
    resizeRef.current.resizing = false;
    activeWindow.removeEventListener('mousemove', handleResizeMove);
    activeWindow.removeEventListener('mouseup', handleResizeEnd);
    activeWindow.removeEventListener('mouseleave', handleResizeEnd);
    activeWindow.removeEventListener('blur', handleResizeEnd);
  }, [activeWindow, handleResizeMove]);

  const handleResizeStart = useCallback((event, handle) => {
    if (windowState !== 'normal') return;
    if (event.button !== 0) return;

    event.preventDefault();
    event.stopPropagation();

    const rect = windowRef.current?.getBoundingClientRect();
    if (!rect) return;

    resizeRef.current = {
      resizing: true,
      handle,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: rect.width,
      startHeight: rect.height,
      startLeft: rect.left,
      startTop: rect.top
    };

    activeWindow.addEventListener('mousemove', handleResizeMove);
    activeWindow.addEventListener('mouseup', handleResizeEnd);
    activeWindow.addEventListener('mouseleave', handleResizeEnd);
    activeWindow.addEventListener('blur', handleResizeEnd);
  }, [activeWindow, handleResizeEnd, handleResizeMove, windowState]);

  useEffect(() => {
    return () => {
      activeWindow.removeEventListener('mousemove', handleDragMove);
      activeWindow.removeEventListener('mouseup', handleDragEnd);
      activeWindow.removeEventListener('mouseleave', handleDragEnd);
      activeWindow.removeEventListener('blur', handleDragEnd);
      activeWindow.removeEventListener('mousemove', handleResizeMove);
      activeWindow.removeEventListener('mouseup', handleResizeEnd);
      activeWindow.removeEventListener('mouseleave', handleResizeEnd);
      activeWindow.removeEventListener('blur', handleResizeEnd);
    };
  }, [activeWindow, handleDragEnd, handleDragMove, handleResizeEnd, handleResizeMove]);

  useEffect(() => {
    if (!showDealerActions) return;

    const handleOutsideClick = (event) => {
      if (!dealerActionsRef.current?.contains(event.target)) {
        setShowDealerActions(false);
      }
    };

    activeWindow.document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      activeWindow.document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [activeWindow, showDealerActions]);

  const toggleSide = () => {
    setSide((prevSide) => (prevSide === 'BUY' ? 'SELL' : 'BUY'));
  };

  const handleSizeChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+(\.\d*)?$/.test(value)) {
      setSize(value);
      if (validationError?.field === 'size') {
        setValidationError(null);
      }
    }
  };

  const handleNumericChange = (setter) => (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+(\.\d*)?$/.test(value)) {
      setter(value);
    }
  };

  const handleDealerToggle = (dealerId) => {
    const normalizedDealerId = normalizeDealerId(dealerId);
    setSelectedDealers((prev) => {
      if (prev.includes(normalizedDealerId)) {
        return prev.filter((d) => d !== normalizedDealerId);
      } else if (processedTradeEnabled) {
        return [normalizedDealerId];
      } else if (prev.length >= 20) {
        return prev;
      } else {
        return [...prev, normalizedDealerId];
      }
    });

    if (validationError?.field === 'dealers') {
      setValidationError(null);
    }
  };

  const handlePricingRowClick = (dealerId) => {
    handleDealerToggle(dealerId);
  };

  const handleSelectBestQuotes = () => {
    const nextDealers = processedTradeEnabled ? bestDealerIds.slice(0, 1) : bestDealerIds;
    setSelectedDealers(nextDealers);
    setActiveDealerMode('bestQuotes');
    setValidationError(null);
    setShowDealerActions(false);
  };

  const handleClearSelection = () => {
    setSelectedDealers([]);
    setActiveDealerMode('manual');
    setValidationError(null);
    setShowDealerActions(false);
  };

  const handleSelectOneWayAxed = () => {
    const nextDealers = processedTradeEnabled ? oneWayAxedDealerIds.slice(0, 1) : oneWayAxedDealerIds;
    setSelectedDealers(nextDealers);
    setActiveDealerMode('oneWayAxed');
    setValidationError(null);
    setShowDealerActions(false);
  };

  const toggleProcessedTrade = () => {
    if (isProcessedTradeToggleDisabled) {
      return;
    }

    setProcessedTradeEnabled((prev) => {
      const nextValue = !prev;
      if (nextValue) {
        setSelectedDealers((current) => current.slice(0, 1));
      }
      return nextValue;
    });
  };

  const getDealerModeLabel = useCallback((mode) => {
    if (mode === 'oneWayAxed') return t('rfq.oneWayAxed');
    if (mode === 'manual') return t('rfq.manual');
    if (mode === 'clearSelection') return t('rfq.clearSelection');
    return t('rfq.bestQuotes');
  }, [t]);

  const applyActiveDealerMode = () => {
    if (activeDealerMode === 'oneWayAxed') {
      handleSelectOneWayAxed();
      return;
    }

    if (activeDealerMode === 'clearSelection') {
      handleClearSelection();
      return;
    }

    handleSelectBestQuotes();
  };

  const handleSubmit = () => {
    if (!size || size === '' || parseFloat(size) <= 0) {
      setValidationError({
        field: 'size',
        message: t('rfq.sizeValidation')
      });
      return;
    }

    if (selectedDealers.length === 0) {
      setValidationError({
        field: 'dealers',
        message: t('rfq.dealerSelectionValidation')
      });
      return;
    }

    setValidationError(null);

    const rfqData = {
      isin: bond.isin,
      description: bond.description,
      side,
      size: parseFloat(size),
      processedTrade: processedTradeEnabled,
      selectedDealers,
      timestamp: new Date().toISOString(),
    };

    if (onSubmit) {
      onSubmit(rfqData);
    }
    onClose();
  };

  if (!isPopup && isMinimized) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="rfq-window-layer">
        <div ref={windowRef} className="rfq-modal rfq-floating-window" style={{ left: `${position.x}px`, top: `${position.y}px` }}>
          <div className="rfq-loading">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rfq-window-layer">
      <div
        ref={windowRef}
        className={`rfq-modal rfq-floating-window ${windowState}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: windowSize.width ? `${windowSize.width}px` : undefined,
          height: windowSize.height ? `${windowSize.height}px` : undefined
        }}
      >
        <div className="rfq-titlebar rfq-drag-handle" onMouseDown={handleDragStart}>
          <div className="rfq-title-left">
            <span className="rfq-title-badge">MTS</span>
            <span className="rfq-title-text">{`${rfqSequence}.${t('rfq.title')}`}</span>
          </div>
          <div className="rfq-window-controls">
            <button className="rfq-window-btn" onMouseDown={(e) => e.stopPropagation()} onClick={handleMinimizeRestore} aria-label={isPopup && windowState === 'minimized' ? t('rfq.maximizeAria') : t('rfq.minimizeAria')}>{isPopup && windowState === 'minimized' ? '▢' : '−'}</button>
            <button className="rfq-window-btn" onMouseDown={(e) => e.stopPropagation()} onClick={toggleMaximizeRestore} aria-label={windowState === 'maximized' ? t('rfq.minimizeAria') : t('rfq.maximizeAria')}>{windowState === 'maximized' ? '❐' : '□'}</button>
            <button className="rfq-window-btn rfq-window-btn-close" onMouseDown={(e) => e.stopPropagation()} onClick={onClose} aria-label={t('rfq.closeAria')}>✕</button>
          </div>
        </div>

        <div className="rfq-strip-row">
          <div className="rfq-strip-tab rfq-strip-tab-transparency">{t('rfq.stripTransparency')}</div>
          <div className="rfq-strip-tab">{t('rfq.stripPostTradePublish')}</div>
          <div className="rfq-strip-center">{t('rfq.stripRealtime')}</div>
          <div className="rfq-strip-right">Swiss / A Bockbe... / Client ID</div>
        </div>

        <div className="rfq-modal-body">
          <div className="rfq-form-grid rfq-form-grid-main">
            <div className="rfq-field rfq-field-side">
              <label className="rfq-label">{t('rfq.side')}</label>
              <button className={`rfq-side-toggle ${side === 'BUY' ? 'buy' : 'sell'}`} onClick={toggleSide}>{side}</button>
            </div>

            <div className="rfq-field rfq-field-description">
              <label className="rfq-label">{t('rfq.description')}</label>
              <div className="rfq-input with-icon">{bond.description}</div>
            </div>

            <div className="rfq-field">
              <label className="rfq-label">{t('rfq.isin')}</label>
              <div className="rfq-input">{bond.isin}</div>
            </div>

            <div className="rfq-field rfq-field-size">
              <label className="rfq-label">{t('rfq.sizeMm')}</label>
              <input className="rfq-size-input" value={size} onChange={handleSizeChange} placeholder="2" />
              {validationError?.field === 'size' && (
                <div className="rfq-error-bubble" role="alert">{validationError.message}</div>
              )}
            </div>

            <div className="rfq-field">
              <label className="rfq-label">{t('rfq.minSizeMm')}</label>
              <input className="rfq-size-input" value={minSize} onChange={handleNumericChange(setMinSize)} />
            </div>

            <div className="rfq-field">
              <label className="rfq-label">{t('rfq.settlement')}</label>
              <select className="rfq-size-input" value={settlement} onChange={(e) => setSettlement(e.target.value)}>
                <option>T + 2</option>
                <option>T + 1</option>
                <option>CASH</option>
              </select>
            </div>

            <div className="rfq-field">
              <label className="rfq-label">{t('rfq.date')}</label>
              <input className="rfq-size-input" value={tradeDate} onChange={(e) => setTradeDate(e.target.value)} />
            </div>

            <div className="rfq-field">
              <label className="rfq-label">{t('rfq.bvBidAsk')}</label>
              <input className="rfq-size-input" value={bvBidAsk} onChange={(e) => setBvBidAsk(e.target.value)} />
            </div>

            <div className="rfq-field">
              <label className="rfq-label">{t('rfq.ytm')}</label>
              <input className="rfq-size-input" value={ytm} onChange={(e) => setYtm(e.target.value)} />
            </div>
          </div>

          <div className="rfq-form-grid rfq-form-grid-secondary">
            <div className="rfq-field">
              <label className="rfq-label">{t('rfq.accruedDays')}</label>
              <input className="rfq-size-input" value={accruedDays} onChange={(e) => setAccruedDays(e.target.value)} />
            </div>
            <div className="rfq-field">
              <label className="rfq-label">{t('rfq.principal')}</label>
              <input className="rfq-size-input" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
            </div>
            <div className="rfq-field">
              <label className="rfq-label">{t('rfq.proceeds')}</label>
              <input className="rfq-size-input" value={proceeds} onChange={(e) => setProceeds(e.target.value)} />
            </div>
            <div className="rfq-field">
              <label className="rfq-label">{t('rfq.dv01')}</label>
              <input className="rfq-size-input" value={dv01} onChange={handleNumericChange(setDv01)} />
            </div>
            <div className="rfq-field">
              <label className="rfq-label">{t('rfq.allocation')}</label>
              <div className="rfq-input action-input">
                <input className="rfq-inline-input" value={allocation} onChange={(e) => setAllocation(e.target.value)} />
                <span className="rfq-inline-actions">＋ ▼</span>
              </div>
            </div>
            <div className="rfq-field">
              <label className="rfq-label">{t('rfq.info')}</label>
              <div className="rfq-input action-input">
                <input className="rfq-inline-input" value={infoValue} onChange={(e) => setInfoValue(e.target.value)} />
                <span className="rfq-inline-actions">＋ ✎ ✓</span>
              </div>
            </div>
          </div>

          <div className="rfq-subtabs">
            <button className="rfq-subtab active">{t('rfq.analytics')}</button>
            <button className="rfq-subtab">{t('rfq.refPrices')}</button>
            <div className="rfq-subtabs-right">ⓘ</div>
          </div>

          <div className={`rfq-pricing-panel ${side === 'BUY' ? 'buy' : 'sell'}`}>
            <div className="rfq-pricing-header-row">
              <h3 className="rfq-pricing-title">{t('rfq.pricing')}</h3>
              <div className="rfq-limit-controls">
                <button className="rfq-limit-btn">{t('rfq.limitPrice')}</button>
                <button className="rfq-limit-btn">{t('rfq.limitYield')}</button>
                <label className="rfq-switch-wrap">
                  <span className="rfq-switch" />
                  <span>{t('rfq.autoMatch')}</span>
                </label>
              </div>
            </div>

            <div className="rfq-pricing-table-wrapper">
              <table className="rfq-pricing-table">
                <thead>
                  <tr>
                    <th className="rfq-table-header">Dealer</th>
                    <th className="rfq-table-header rfq-axe-header">Axe</th>
                    <th className="rfq-table-header rfq-size-header">Size</th>
                    <th className="rfq-table-header rfq-price-header">Price</th>
                    <th className="rfq-table-header rfq-yield-header">Yield</th>
                    <th className="rfq-table-header rfq-sprd-header">Sprd</th>
                    <th className="rfq-table-header rfq-anti-header">Anti Axe</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPricingRows.slice(0, 30).map((row) => {
                      return (
                        <tr
                          key={row.dealer}
                          className={`rfq-table-row ${selectedDealers.includes(row.dealer) ? 'selected' : ''}`}
                          onClick={() => handlePricingRowClick(row.dealer)}
                        >
                          <td className="rfq-table-cell dealer-cell">{row.dealer}</td>
                          <td className="rfq-table-cell">{row.axe}</td>
                          <td className="rfq-table-cell">{row.size}</td>
                          <td className="rfq-table-cell price-cell">{row.price}</td>
                          <td className="rfq-table-cell">{row.yield}</td>
                          <td className={`rfq-table-cell spread-cell ${side === 'BUY' ? 'bid-spread' : 'ask-spread'}`}>{row.sprd}</td>
                          <td className="rfq-table-cell">{row.antiAxe}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rfq-dealer-section">
            <div className="rfq-dealer-section-head">
              <div className="rfq-section-title-wrap">
                <span className="rfq-section-title">{t('rfq.dealerSelection')}</span>
                {validationError?.field === 'dealers' && (
                  <div className="rfq-error-bubble rfq-error-bubble-dealers" role="alert">{validationError.message}</div>
                )}
              </div>
              <div className="rfq-dealer-head-controls">
                <div className="rfq-dealer-actions" ref={dealerActionsRef}>
                  <button className="rfq-bestquotes-btn" onClick={applyActiveDealerMode}>{getDealerModeLabel(activeDealerMode)}</button>
                  <button className="rfq-small-btn" onClick={() => setShowDealerActions((prev) => !prev)} aria-label={t('rfq.bestQuotes')}>▼</button>
                  {showDealerActions && (
                    <div className="rfq-dealer-actions-menu">
                      <button className="rfq-dealer-actions-item" onClick={handleSelectBestQuotes}>{t('rfq.bestQuotes')}</button>
                      <button className="rfq-dealer-actions-item" onClick={handleSelectOneWayAxed}>{t('rfq.oneWayAxed')}</button>
                      <button className="rfq-dealer-actions-item" onClick={handleClearSelection}>{t('rfq.clearSelection')}</button>
                    </div>
                  )}
                </div>
                <label
                  className={`rfq-switch-wrap compact processed-trade-toggle ${isProcessedTradeToggleDisabled ? 'disabled' : ''}`}
                  onClick={toggleProcessedTrade}
                >
                  <span className={`rfq-switch ${processedTradeEnabled ? 'active' : ''}`} />
                  <span>{t('rfq.processedTrade')}</span>
                </label>
              </div>
              <div className="rfq-dealer-group-box">
                <span>{t('rfq.dealerGroups')}</span>
                <span>＋ ▼</span>
              </div>
            </div>
            <div className="rfq-dealer-grid">
              {dealerButtons.map((dealerId) => (
                  <button
                    key={dealerId}
                    className={`rfq-dealer-btn ${
                      selectedDealers.includes(dealerId) ? 'selected' : ''
                    }`}
                    onClick={() => handleDealerToggle(dealerId)}
                  >
                    {dealerId}
                  </button>
                ))}
            </div>
          </div>
        </div>

        <div className="rfq-modal-footer">
          <button className="rfq-btn rfq-btn-save">{t('rfq.save')}</button>
          <button className="rfq-btn rfq-btn-primary" onClick={handleSubmit}>{t('rfq.sendRfq')}</button>
          <button className="rfq-btn rfq-btn-close" onClick={onClose}>{t('rfq.close')}</button>
        </div>

        {windowState === 'normal' && (
          <>
            <div className="rfq-resize-handle rfq-resize-handle-nw" onMouseDown={(event) => handleResizeStart(event, 'nw')} />
            <div className="rfq-resize-handle rfq-resize-handle-ne" onMouseDown={(event) => handleResizeStart(event, 'ne')} />
            <div className="rfq-resize-handle rfq-resize-handle-sw" onMouseDown={(event) => handleResizeStart(event, 'sw')} />
            <div className="rfq-resize-handle rfq-resize-handle-se" onMouseDown={(event) => handleResizeStart(event, 'se')} />
          </>
        )}
      </div>
    </div>
  );
};

export default RfqOutright;
