import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const PreferencesContext = createContext(null);

const defaultPreferences = {
    theme: 'light',
    language: 'en',
    defaultColumns: ['isin', 'description', 'price', 'yield'],
    lastTab: 'government-bonds',
    gridLayout: 'comfortable'
};

export const PreferencesProvider = ({ children }) => {
    const [preferences, setPreferences] = useState(defaultPreferences);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuth();

    // Load preferences on mount
    useEffect(() => {
        if (isAuthenticated) {
            loadPreferences();
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
    }, [isAuthenticated]);

    const loadPreferences = async () => {
        try {
            const response = await axios.get('/preferences');
            // Handle both response formats
            let uiSettings = defaultPreferences;
            
            if (response.data?.preferences?.ui_settings) {
                uiSettings = response.data.preferences.ui_settings;
            } else if (response.data?.ui_settings) {
                uiSettings = response.data.ui_settings;
            } else if (response.data && Object.keys(response.data).length > 0) {
                // If response.data is the preferences object itself
                uiSettings = response.data?.ui_settings || response.data;
            }
            
            setPreferences(uiSettings);
        } catch (error) {
            console.error('Failed to load preferences:', error);
            // Use defaults on error
            setPreferences(defaultPreferences);
        } finally {
            setLoading(false);
        }
    };

    const updatePreference = async (key, value) => {
        const newPreferences = { ...preferences, [key]: value };
        setPreferences(newPreferences);

        if (isAuthenticated) {
            try {
                // Save to backend (bulk update with all preferences)
                await axios.put('/preferences/ui_settings', {
                    value: newPreferences
                });
            } catch (error) {
                console.error('Failed to save preference:', error);
                // Revert on error
                setPreferences(preferences);
            }
        } else {
            // Save to localStorage for non-authenticated users
            localStorage.setItem('preferences', JSON.stringify(newPreferences));
        }
    };

    const updatePreferences = async (updates) => {
        const newPreferences = { ...preferences, ...updates };
        setPreferences(newPreferences);

        if (isAuthenticated) {
            try {
                await axios.put('/preferences/ui_settings', {
                    value: newPreferences
                });
            } catch (error) {
                console.error('Failed to save preferences:', error);
                setPreferences(preferences);
            }
        } else {
            localStorage.setItem('preferences', JSON.stringify(newPreferences));
        }
    };

    const resetPreferences = async () => {
        setPreferences(defaultPreferences);

        if (isAuthenticated) {
            try {
                await axios.put('/preferences/ui_settings', {
                    value: defaultPreferences
                });
            } catch (error) {
                console.error('Failed to reset preferences:', error);
            }
        } else {
            localStorage.removeItem('preferences');
        }
    };

    const value = {
        preferences,
        loading,
        updatePreference,
        updatePreferences,
        resetPreferences
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
