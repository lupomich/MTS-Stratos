import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const PreferencesContext = createContext(null);

const defaultPreferences = {
    theme: 'dark',
    language: 'en',
    defaultColumns: ['description', 'isin', 'ccy', 'bidSprd', 'bidYield', 'bidPrice', 'askPrice', 'askYield', 'askSprd', 'midPrice', 'midYield', 'coupon', 'maturity'],
    columnOrder: [],
    lastTab: 'government-bonds',
    selectedCountryTab: 'IT',
    gridLayout: 'comfortable',
    rfqOpenInPopup: false,
    columnWidths: {},
    filters: {},
    sorts: []
};

export const PreferencesProvider = ({ children }) => {
    const [preferences, setPreferences] = useState(defaultPreferences);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated, token } = useAuth();
    const saveTimeoutRef = useRef(null);

    // Load preferences on mount
    useEffect(() => {
        if (isAuthenticated) {
            loadPreferencesFromBackend();
        } else {
            // Load from localStorage for non-authenticated users
            const stored = localStorage.getItem('preferences');
            if (stored) {
                try {
                    setPreferences(JSON.parse(stored));
                } catch (error) {
                    console.error('Failed to parse stored preferences:', error);
                }
            }
            setLoading(false);
        }
    }, [isAuthenticated, token]);

    const loadPreferencesFromBackend = async () => {
        try {
            console.log('Loading preferences from backend - token:', token ? 'present' : 'absent')
            const axiosConfig = {};
            if (token) {
                axiosConfig.headers = {
                    'Authorization': `Bearer ${token}`
                };
            }
            
            const response = await axios.get('/preferences/ui_settings', axiosConfig);
            console.log('Preferences loaded from backend:', response.data)
            let uiSettings = defaultPreferences;
            
            if (response.data?.preferences?.ui_settings) {
                uiSettings = { ...defaultPreferences, ...response.data.preferences.ui_settings };
            }
            
            console.log('Final preferences object:', uiSettings)
            setPreferences(uiSettings);
        } catch (error) {
            console.error('Failed to load preferences:', error);
            setPreferences(defaultPreferences);
        } finally {
            setLoading(false);
        }
    };

    // Save preferences to backend (debounced)
    const savePreferencesToBackend = useCallback(async (newPrefs) => {
        if (!isAuthenticated) {
            // Save to localStorage for non-authenticated users
            localStorage.setItem('preferences', JSON.stringify(newPrefs));
            return;
        }

        try {
            const axiosConfig = {};
            if (token) {
                axiosConfig.headers = {
                    'Authorization': `Bearer ${token}`
                };
            }
            
            await axios.put('/preferences/ui_settings', newPrefs, axiosConfig);
        } catch (error) {
            console.error('Failed to save preferences:', error);
        }
    }, [isAuthenticated, token]);

    const updatePreference = useCallback((key, value, options = {}) => {
        const { immediate = false } = options;

        setPreferences(prev => {
            const newPreferences = { ...prev, [key]: value };
            
            // Debounce the save operation
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            if (immediate) {
                savePreferencesToBackend(newPreferences);
            } else {
                saveTimeoutRef.current = setTimeout(() => {
                    savePreferencesToBackend(newPreferences);
                }, 1000);
            }
            
            return newPreferences;
        });
    }, [savePreferencesToBackend]);

    const updatePreferences = useCallback((updates) => {
        setPreferences(prev => {
            const newPreferences = { ...prev, ...updates };
            
            // Debounce the save operation
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            
            saveTimeoutRef.current = setTimeout(() => {
                savePreferencesToBackend(newPreferences);
            }, 1000);
            
            return newPreferences;
        });
    }, [savePreferencesToBackend]);

    const resetPreferences = useCallback(async () => {
        setPreferences(defaultPreferences);

        if (isAuthenticated) {
            try {
                await axios.put('/preferences/ui_settings', defaultPreferences);
            } catch (error) {
                console.error('Failed to reset preferences:', error);
            }
        } else {
            localStorage.removeItem('preferences');
        }
    }, [isAuthenticated]);

    const value = {
        preferences,
        loading,
        updatePreference,
        updatePreferences,
        resetPreferences,
        // Convenience methods
        setTheme: (theme) => updatePreference('theme', theme),
        setLanguage: (language) => updatePreference('language', language),
        setLastTab: (tab) => updatePreference('lastTab', tab),
        setSelectedCountryTab: (countryCode) => updatePreference('selectedCountryTab', countryCode, { immediate: true }),
        setGridLayout: (layout) => updatePreference('gridLayout', layout),
        setRfqOpenInPopup: (enabled) => updatePreference('rfqOpenInPopup', enabled, { immediate: true }),
        setColumnOrder: (order) => updatePreference('columnOrder', order),
        setColumnWidths: (widths) => updatePreference('columnWidths', widths),
        setFilters: (filters) => updatePreference('filters', filters),
        setSorts: (sorts) => updatePreference('sorts', sorts, { immediate: true }),
        setDefaultColumns: (columns) => updatePreference('defaultColumns', columns)
    };

    return (
        <PreferencesContext.Provider value={value}>
            {children}
        </PreferencesContext.Provider>
    );
};

export const usePreferences = () => {
    const context = useContext(PreferencesContext);
    if (!context) {
        throw new Error('usePreferences must be used within a PreferencesProvider');
    }
    return context;
};

export default PreferencesContext;
