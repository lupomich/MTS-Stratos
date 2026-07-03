import React, { createContext, useContext, useState } from 'react'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

export const translations = {
  en: {
    common: {
      close: 'Close',
      loading: 'Loading...'
    },
    // Sidebar
    sidebar: {
      menu: 'MENU',
      orders: 'ORDERS',
      trading: 'TRADING',
      blotter: 'BLOTTER',
      data: 'DATA',
      alerts: 'ALERTS',
      depth: 'DEPTH',
      settings: 'SETTINGS',
      admin: 'ADMIN',
      logout: 'LOG OUT',
      logoutConfirm: 'Are you sure you want to log out?',
      overlayAriaLabel: 'Main menu',
      closeMenuAriaLabel: 'Close menu'
    },
    header: {
      guest: 'Guest',
      market: 'Market',
      member: 'Member',
      trader: 'Trader',
      autoEx: 'AutoEx',
      language: 'Language'
    },
    login: {
      title: 'MTS Stratos',
      username: 'Username',
      password: 'Password',
      usernamePlaceholder: 'Enter your username',
      passwordPlaceholder: 'Enter your password',
      submit: 'Login',
      demoAccounts: 'Demo Accounts:',
      alreadyLoggedIn: 'User already logged in from another session'
    },
    userSettings: {
      title: 'User Settings',
      rfqSettings: 'RFQ Settings',
      ticketPosition: 'Ticket Position',
      tradingSettings: 'Trading settings',
      openRfqInPopup: 'Open RFQ in separate window',
      openRfqInTab: 'Open RFQ in separate tab',
      rfqAlwaysOnTop: 'RFQ Always On Top (best effort)',
      maxNoDealersRfq: 'Max No. of Dealers in the RFQ',
      workspacesSection: 'Workspaces',
      hideLegacyWorkspace: 'Hide legacy default workspace'
    },
    mainContent: {
      openRfq: 'OPEN RFQ',
      searchBondsPlaceholder: 'Search bonds...',
      rfqToolbar: 'RFQ TOOLBAR',
      fullScreen: 'Full Screen',
      closeFullScreen: 'Close Full Screen',
      dataTitle: 'DATA',
      collapseDataPanel: 'Collapse DATA panel',
      expandDataPanel: 'Expand DATA panel',
      topTabs: {
        all: 'All',
        axed: 'Axed'
      },
      govOptions: {
        govCountry: 'Gov / Country',
        govMaturity: 'Gov / Maturity',
        govSwitches: 'Gov / Switches',
        govGtdSsa: 'Govt gtd / SSA',
        coveredMaturity: 'Covered / Maturity',
        ssasMaturity: 'SSAs / Maturity',
        corporateIndustry: 'Corporate / Industry',
        banksFinancials: 'Banks-Financials'
      },
      rfqTypes: {
        outright: 'RFQ OUTRIGHT',
        switch: 'RFQ SWITCH',
        butterfly: 'RFQ BUTTERFLY',
        list: 'RFQ LIST',
        portfolio: 'RFQ PORTFOLIO'
      }
    },
    // Bond Table
    bondTable: {
      clearFilters: 'Clear Filters'
    },
    // Custom Menu Grid
    columnMenu: {
      filter: 'Filter',
      sortAsc: 'Sort Ascending',
      sortDesc: 'Sort Descending',
      sortNone: 'Remove Sort',
      autosizeThis: 'Autosize This Column',
      autosizeAll: 'Autosize All Columns',
      pinLeft: 'Pin Left',
      pinRight: 'Pin Right',
      unpin: 'Unpin',
      resetColumn: 'Reset Column',
      resetAll: 'Reset All Columns',
      showHidden: 'Show Hidden Columns',
      hiddenColumnsTitle: 'Hidden Columns',
      showColumn: 'Show',
      showAllColumns: 'Show All'
    },
    // RFQ Modals
    rfq: {
      maxWindowsError: 'Maximum of 5 RFQ windows allowed. Close one before opening a new one.',
      loadingError: 'Error loading pricing data. Please try again.',
      fetchError: 'Failed to fetch RFQ data',
      title: 'RFQ OUTRIGHT',
      stripTransparency: 'TRANSPARENCY',
      stripPostTradePublish: 'POST-TRADE PUBLISH',
      stripRealtime: 'Real-Time',
      side: 'SIDE',
      description: 'DESCRIPTION',
      isin: 'ISIN',
      sizeMm: 'SIZE (MM)',
      minSizeMm: 'MIN. SIZE (MM)',
      settlement: 'SETTL.',
      date: 'DATE',
      bvBidAsk: 'BV BID/ASK',
      ytm: 'YTM',
      accruedDays: 'ACCRUED / DAYS',
      principal: 'PRINCIPAL',
      proceeds: 'PROCEEDS',
      dv01: 'DV01 (U)',
      allocation: 'ALLOCATION',
      info: 'INFO',
      analytics: 'ANALYTICS',
      refPrices: 'REF. PRICES',
      pricing: 'PRICING',
      limitPrice: 'Limit Price',
      limitYield: 'Limit Yield',
      autoMatch: 'Auto Match',
      dealerSelection: 'DEALER SELECTION',
      bestQuotes: 'BEST QUOTES',
      manual: 'MANUAL',
      oneWayAxed: '1-WAY AXED',
      clearSelection: 'CLEAR SELECTION',
      processedTrade: 'Processed Trade',
      dealerGroups: 'Dealer Groups',
      save: 'SAVE',
      sendRfq: 'SEND RFQ',
      close: 'CLOSE',
      sizeValidation: 'SIZE (MM): enter a value greater than 0',
      dealerSelectionValidation: 'DEALER SELECTION: select at least one dealer',
      minimizeAria: 'Minimize',
      maximizeAria: 'Maximize',
      closeAria: 'Close'
    },
    admin: {
      accessDenied: 'Access Denied',
      accessDeniedMessage: 'You need admin privileges to access this panel.',
      panelTitle: 'Admin Panel - User Management',
      createUser: 'Create User',
      createNewUser: 'Create New User',
      loadingUsers: 'Loading users...',
      allFieldsRequired: 'All fields are required.',
      passwordValidation: 'Password must be at least 8 characters and include a letter, number, and symbol.',
      failedCreateUser: 'Failed to create user',
      failedLoadUsers: 'Failed to load users',
      failedUpdateUserStatus: 'Failed to update user status',
      failedDeleteUser: 'Failed to delete user',
      failedUpdateUserRole: 'Failed to update user role',
      deleteUserConfirm: 'Are you sure you want to delete user "{username}"?',
      active: 'Active',
      inactive: 'Inactive',
      never: 'Never',
      system: 'System',
      deactivateUser: 'Deactivate user',
      activateUser: 'Activate user',
      deleteUser: 'Delete user',
      username: 'Username',
      email: 'Email',
      password: 'Password',
      role: 'Role',
      usernamePlaceholder: 'Enter username',
      emailPlaceholder: 'Enter email',
      passwordPlaceholder: 'At least 8 chars, 1 letter, 1 number, 1 symbol',
      creating: 'Creating...',
      colUsername: 'Username',
      colEmail: 'Email',
      colRole: 'Role',
      colStatus: 'Status',
      colLastLogin: 'Last Login',
      colCreatedBy: 'Created By',
      colActions: 'Actions',
      roleViewer: 'Viewer',
      roleTrader: 'Trader',
      roleAdmin: 'Admin'
    },
    marketDepth: {
      mtsCashOrderBook: 'MTS Cash Order Book',
      ebmOrderBook: 'EBM Order Book',
      bondvisionComposite: 'BondVision Composite',
      bondvisionDealerPricing: 'BondVision Dealer Pricing',
      collapsePanel: 'Collapse panel',
      expandPanel: 'Expand panel'
    },
    workspace: {
      label: 'WORKSPACE',
      newBlank: 'New blank workspace',
      options: 'Workspace options',
      rename: 'Rename',
      editLayout: 'Edit layout',
      duplicate: 'Duplicate',
      delete: 'Delete',
      done: 'Done',
      exitEditMode: 'Exit edit mode',
      dropPanelHere: 'Drop panel here',
      removeEmptySlot: 'Remove this empty slot',
      fullScreen: 'Full Screen',
      closeFullScreen: 'Close Full Screen',
      close: 'Close'
    }
  },
  it: {
    common: {
      close: 'Chiudi',
      loading: 'Caricamento...'
    },
    // Sidebar
    sidebar: {
      menu: 'MENU',
      orders: 'ORDINI',
      trading: 'TRADING',
      blotter: 'BLOTTER',
      data: 'DATI',
      alerts: 'AVVISI',
      depth: 'DEPTH',
      settings: 'IMPOSTAZIONI',
      admin: 'ADMIN',
      logout: 'LOG OUT',
      logoutConfirm: 'Confermi il log out?',
      overlayAriaLabel: 'Menu principale',
      closeMenuAriaLabel: 'Chiudi menu'
    },
    header: {
      guest: 'Ospite',
      market: 'Mercato',
      member: 'Member',
      trader: 'Trader',
      autoEx: 'AutoEx',
      language: 'Lingua'
    },
    login: {
      title: 'MTS Stratos',
      username: 'Username',
      password: 'Password',
      usernamePlaceholder: 'Inserisci username',
      passwordPlaceholder: 'Inserisci password',
      submit: 'Login',
      demoAccounts: 'Account demo:',
      alreadyLoggedIn: 'Utente già collegato da un\'altra sessione'
    },
    userSettings: {
      title: 'Impostazioni utente',
      rfqSettings: 'Impostazioni RFQ',
      ticketPosition: 'Posizione ticket',
      tradingSettings: 'Impostazioni trading',
      openRfqInPopup: 'Apri RFQ in finestra separata',
      openRfqInTab: 'Apri RFQ in scheda separata',
      rfqAlwaysOnTop: 'RFQ sempre in primo piano (best effort)',
      maxNoDealersRfq: 'N. max di dealer nella RFQ',
      workspacesSection: 'Workspace',
      hideLegacyWorkspace: 'Nascondi workspace legacy predefinito'
    },
    mainContent: {
      openRfq: 'APRI RFQ',
      searchBondsPlaceholder: 'Cerca bond...',
      rfqToolbar: 'BARRA RFQ',
      fullScreen: 'Schermo intero',
      closeFullScreen: 'Chiudi schermo intero',
      dataTitle: 'DATI',
      collapseDataPanel: 'Comprimi pannello DATI',
      expandDataPanel: 'Espandi pannello DATI',
      topTabs: {
        all: 'Tutti',
        axed: 'Axed'
      },
      govOptions: {
        govCountry: 'Gov / Country',
        govMaturity: 'Gov / Maturity',
        govSwitches: 'Gov / Switches',
        govGtdSsa: 'Govt gtd / SSA',
        coveredMaturity: 'Covered / Maturity',
        ssasMaturity: 'SSAs / Maturity',
        corporateIndustry: 'Corporate / Industry',
        banksFinancials: 'Banks-Financials'
      },
      rfqTypes: {
        outright: 'RFQ OUTRIGHT',
        switch: 'RFQ SWITCH',
        butterfly: 'RFQ BUTTERFLY',
        list: 'RFQ LIST',
        portfolio: 'RFQ PORTFOLIO'
      }
    },
    // Bond Table
    bondTable: {
      clearFilters: 'Azzera Filtri'
    },
    // Custom Menu Grid
    columnMenu: {
      filter: 'Filtra',
      sortAsc: 'Ordina Crescente',
      sortDesc: 'Ordina Decrescente',
      sortNone: 'Rimuovi Ordinamento',
      autosizeThis: 'Adatta Questa Colonna',
      autosizeAll: 'Adatta Tutte le Colonne',
      pinLeft: 'Blocca a Sinistra',
      pinRight: 'Blocca a Destra',
      unpin: 'Sblocca',
      resetColumn: 'Reset Colonna',
      resetAll: 'Reset Tutte',
      showHidden: 'Mostra Colonne Nascoste',
      hiddenColumnsTitle: 'Colonne Nascoste',
      showColumn: 'Mostra',
      showAllColumns: 'Mostra Tutte'
    },
    // RFQ Modals
    rfq: {
      maxWindowsError: 'Massimo 5 finestre RFQ consentite. Chiuderne una prima di aprirne una nuova.',
      loadingError: 'Errore nel caricamento dei dati dei prezzi. Riprovare.',
      fetchError: 'Impossibile caricare i dati RFQ',
      title: 'RFQ OUTRIGHT',
      stripTransparency: 'TRANSPARENCY',
      stripPostTradePublish: 'POST-TRADE PUBLISH',
      stripRealtime: 'Real-Time',
      side: 'SIDE',
      description: 'DESCRIPTION',
      isin: 'ISIN',
      sizeMm: 'SIZE (MM)',
      minSizeMm: 'MIN. SIZE (MM)',
      settlement: 'SETTL.',
      date: 'DATE',
      bvBidAsk: 'BV BID/ASK',
      ytm: 'YTM',
      accruedDays: 'ACCRUED / DAYS',
      principal: 'PRINCIPAL',
      proceeds: 'PROCEEDS',
      dv01: 'DV01 (U)',
      allocation: 'ALLOCATION',
      info: 'INFO',
      analytics: 'ANALYTICS',
      refPrices: 'REF. PRICES',
      pricing: 'PRICING',
      limitPrice: 'Limit Price',
      limitYield: 'Limit Yield',
      autoMatch: 'Auto Match',
      dealerSelection: 'DEALER SELECTION',
      bestQuotes: 'BEST QUOTES',
      manual: 'MANUAL',
      oneWayAxed: '1-WAY AXED',
      clearSelection: 'AZZERA SELEZIONE',
      processedTrade: 'Processed Trade',
      dealerGroups: 'Dealer Groups',
      save: 'SAVE',
      sendRfq: 'SEND RFQ',
      close: 'CLOSE',
      sizeValidation: 'SIZE (MM): inserire un valore maggiore di 0',
      dealerSelectionValidation: 'DEALER SELECTION: selezionare almeno un dealer',
      minimizeAria: 'Riduci',
      maximizeAria: 'Ingrandisci',
      closeAria: 'Chiudi'
    },
    admin: {
      accessDenied: 'Accesso negato',
      accessDeniedMessage: 'Servono privilegi admin per accedere a questo pannello.',
      panelTitle: 'Admin Panel - User Management',
      createUser: 'Create User',
      createNewUser: 'Create New User',
      loadingUsers: 'Caricamento utenti...',
      allFieldsRequired: 'Tutti i campi sono obbligatori.',
      passwordValidation: 'La password deve avere almeno 8 caratteri e includere lettera, numero e simbolo.',
      failedCreateUser: 'Errore nella creazione utente',
      failedLoadUsers: 'Errore nel caricamento utenti',
      failedUpdateUserStatus: 'Errore nell’aggiornamento stato utente',
      failedDeleteUser: 'Errore nell’eliminazione utente',
      failedUpdateUserRole: 'Errore nell’aggiornamento ruolo utente',
      deleteUserConfirm: 'Confermi l\'eliminazione dell\'utente "{username}"?',
      active: 'Attivo',
      inactive: 'Inattivo',
      never: 'Mai',
      system: 'Sistema',
      deactivateUser: 'Disattiva utente',
      activateUser: 'Attiva utente',
      deleteUser: 'Elimina utente',
      username: 'Username',
      email: 'Email',
      password: 'Password',
      role: 'Role',
      usernamePlaceholder: 'Inserisci username',
      emailPlaceholder: 'Inserisci email',
      passwordPlaceholder: 'Almeno 8 caratteri, 1 lettera, 1 numero, 1 simbolo',
      creating: 'Creazione...',
      colUsername: 'Username',
      colEmail: 'Email',
      colRole: 'Ruolo',
      colStatus: 'Stato',
      colLastLogin: 'Ultimo Accesso',
      colCreatedBy: 'Creato Da',
      colActions: 'Azioni',
      roleViewer: 'Visualizzatore',
      roleTrader: 'Trader',
      roleAdmin: 'Amministratore'
    },
    marketDepth: {
      mtsCashOrderBook: 'MTS Cash Order Book',
      ebmOrderBook: 'EBM Order Book',
      bondvisionComposite: 'BondVision Composite',
      bondvisionDealerPricing: 'BondVision Dealer Pricing',
      collapsePanel: 'Collassa pannello',
      expandPanel: 'Espandi pannello'
    },
    workspace: {
      label: 'WORKSPACE',
      newBlank: 'Nuovo workspace vuoto',
      options: 'Opzioni workspace',
      rename: 'Rinomina',
      editLayout: 'Modifica layout',
      duplicate: 'Duplica',
      delete: 'Elimina',
      done: 'Fine',
      exitEditMode: 'Esci dalla modalità modifica',
      dropPanelHere: 'Trascina un pannello qui',
      removeEmptySlot: 'Rimuovi slot vuoto',
      fullScreen: 'Schermo intero',
      closeFullScreen: 'Chiudi schermo intero',
      close: 'Chiudi'
    }
  }
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en')

  const applyLanguage = (nextLanguage) => {
    setLanguage(nextLanguage === 'it' ? 'it' : 'en')
  }

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'it' : 'en')
  }

  const t = (key) => {
    const keys = key.split('.')
    let value = translations[language]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    return value || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: applyLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
