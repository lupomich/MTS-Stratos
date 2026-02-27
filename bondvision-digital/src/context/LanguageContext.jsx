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
      demoAccounts: 'Demo Accounts:'
    },
    userSettings: {
      title: 'User Settings',
      rfqSettings: 'RFQ Settings',
      openRfqInPopup: 'Open RFQ in separate window',
      rfqAlwaysOnTop: 'RFQ Always On Top (best effort)'
    },
    mainContent: {
      openRfq: 'OPEN RFQ',
      searchBondsPlaceholder: 'Search bonds...',
      rfqToolbar: 'RFQ TOOLBAR',
      dataTitle: 'DATA',
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
      resetAll: 'Reset All Columns'
    },
    // RFQ Modals
    rfq: {
      maxWindowsError: 'Maximum of 5 RFQ windows allowed. Close one before opening a new one.',
      loadingError: 'Error loading pricing data. Please try again.',
      fetchError: 'Failed to fetch RFQ data',
      title: '8.RFQ OUTRIGHT',
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
      creating: 'Creating...'
    },
    marketDepth: {
      mtsCashOrderBook: 'MTS Cash Order Book',
      ebmOrderBook: 'EBM Order Book',
      bondvisionComposite: 'BondVision Composite',
      bondvisionDealerPricing: 'BondVision Dealer Pricing'
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
      demoAccounts: 'Account demo:'
    },
    userSettings: {
      title: 'Impostazioni utente',
      rfqSettings: 'Impostazioni RFQ',
      openRfqInPopup: 'Apri RFQ in finestra separata',
      rfqAlwaysOnTop: 'RFQ Always On Top (best effort)'
    },
    mainContent: {
      openRfq: 'APRI RFQ',
      searchBondsPlaceholder: 'Cerca bond...',
      rfqToolbar: 'BARRA RFQ',
      dataTitle: 'DATI',
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
      resetAll: 'Reset Tutte'
    },
    // RFQ Modals
    rfq: {
      maxWindowsError: 'Massimo 5 finestre RFQ consentite. Chiuderne una prima di aprirne una nuova.',
      loadingError: 'Errore nel caricamento dei dati dei prezzi. Riprovare.',
      fetchError: 'Impossibile caricare i dati RFQ',
      title: '8.RFQ OUTRIGHT',
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
      creating: 'Creazione...'
    },
    marketDepth: {
      mtsCashOrderBook: 'MTS Cash Order Book',
      ebmOrderBook: 'EBM Order Book',
      bondvisionComposite: 'BondVision Composite',
      bondvisionDealerPricing: 'BondVision Dealer Pricing'
    }
  }
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en')

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
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
