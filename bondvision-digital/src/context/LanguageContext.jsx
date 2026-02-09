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
    // Sidebar
    sidebar: {
      menu: 'MENU',
      orders: 'ORDERS',
      trading: 'TRADING',
      blotter: 'BLOTTER',
      data: 'DATA',
      alerts: 'ALERTS'
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
    }
  },
  it: {
    // Sidebar
    sidebar: {
      menu: 'MENU',
      orders: 'ORDINI',
      trading: 'TRADING',
      blotter: 'BLOTTER',
      data: 'DATI',
      alerts: 'AVVISI'
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
