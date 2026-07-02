import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { registerPreferencesFlush } from './preferencesFlush';

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
    rfqOpenInTab: false,
    rfqAlwaysOnTop: false,
    rfqMaxDealers: 6,
    hideLegacyWorkspace: false,
    columnWidths: {},
    filters: {},
    sorts: []
};

export const PreferencesProvider = ({ children }) => {
    const [preferences, setPreferences] = useState(defaultPreferences);
    const [loading, setLoading] = useState(true);
    // Bumped ONLY when a fresh set of preferences is loaded from the backend (login).
    // Consumers key their "restore saved layout" logic on this, so it fires on every real
    // load but NEVER on a local update — that avoids the save->apply->save feedback loop.
    const [loadedAt, setLoadedAt] = useState(0);
    const { isAuthenticated, token } = useAuth();
    const preferencesRef = useRef(defaultPreferences);
    // Serialized write queue. Every change is saved immediately, but writes are
    // strictly ordered (no race) and coalesced (bursts collapse to the latest state).
    // Nothing is ever left "pending" on a timer, so a change cannot be lost by a fast
    // logout, tab close, or navigation.
    //   dirtyRef    = { prefs, capturedToken } | null  -> latest state waiting to be written
    //   drainingRef = Promise | null                    -> in-flight drain of the queue
    const dirtyRef = useRef(null);
    const drainingRef = useRef(null);

    // Keep refs in sync
    useEffect(() => { preferencesRef.current = preferences; }, [preferences]);

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

    // Drain the write queue: keep writing the latest dirty state until none remains.
    // Serializes PUTs (last write wins) and coalesces bursts. Idempotent: if a drain
    // is already running, returns the existing promise.
    const drainSaveQueue = useCallback(() => {
        if (drainingRef.current) return drainingRef.current;
        const run = (async () => {
            while (dirtyRef.current) {
                const { prefs, capturedToken } = dirtyRef.current;
                dirtyRef.current = null;
                if (!isAuthenticated) {
                    localStorage.setItem('preferences', JSON.stringify(prefs));
                    continue;
                }
                try {
                    await axios.put('/preferences/ui_settings', prefs, {
                        headers: capturedToken ? { Authorization: `Bearer ${capturedToken}` } : {}
                    });
                } catch (err) {
                    console.error('[PreferencesContext] Save error:', err);
                }
            }
        })();
        drainingRef.current = run;
        run.finally(() => { if (drainingRef.current === run) drainingRef.current = null; });
        return run;
    }, [isAuthenticated]);

    // Enqueue the latest full prefs for saving, capturing the token valid right now.
    const enqueueSave = useCallback((prefs, capturedToken) => {
        dirtyRef.current = { prefs, capturedToken };
        drainSaveQueue();
    }, [drainSaveQueue]);

    // Flush the queue to completion NOW. Called by AuthContext.logout() BEFORE the
    // backend invalidates the token, so any just-made change is persisted with a valid
    // token. Guarantees no data loss on logout / tab close.
    const flushPendingSave = useCallback(async () => {
        if (dirtyRef.current) drainSaveQueue();
        if (drainingRef.current) {
            try { await drainingRef.current; } catch { /* logged inside drain */ }
        }
        console.log('[PreferencesContext] Save queue flushed before logout');
    }, [drainSaveQueue]);

    // Register the flush so logout can await it while the token is still valid
    useEffect(() => {
        registerPreferencesFlush(flushPendingSave);
    }, [flushPendingSave]);

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
            preferencesRef.current = uiSettings;
            setLoadedAt(Date.now());
        } catch (error) {
            console.error('Failed to load preferences:', error);
            setPreferences(defaultPreferences);
            preferencesRef.current = defaultPreferences;
            setLoadedAt(Date.now());
        } finally {
            setLoading(false);
        }
    };

    const updatePreference = useCallback((key, value) => {
        // Compute from the ref (always current) and update state + enqueue the save
        // OUTSIDE the state updater. Side effects inside a setState updater are a React
        // anti-pattern (StrictMode double-invokes and may discard them → the PUT never fires).
        const newPreferences = { ...preferencesRef.current, [key]: value };
        preferencesRef.current = newPreferences;
        setPreferences(newPreferences);
        enqueueSave(newPreferences, token);
    }, [enqueueSave, token]);

    const updatePreferences = useCallback((updates) => {
        const newPreferences = { ...preferencesRef.current, ...updates };
        preferencesRef.current = newPreferences;
        setPreferences(newPreferences);
        enqueueSave(newPreferences, token);
    }, [enqueueSave, token]);

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
        loadedAt,
        updatePreference,
        updatePreferences,
        resetPreferences,
        // Convenience methods
        setTheme: (theme) => updatePreference('theme', theme),
        setLanguage: (language) => updatePreference('language', language, { immediate: true }),
        setLastTab: (tab) => updatePreference('lastTab', tab),
        setSelectedCountryTab: (countryCode) => updatePreference('selectedCountryTab', countryCode, { immediate: true }),
        setGridLayout: (layout) => updatePreference('gridLayout', layout),
        setRfqOpenInPopup: (enabled) => updatePreference('rfqOpenInPopup', enabled, { immediate: true }),
        setRfqOpenInTab: (enabled) => updatePreference('rfqOpenInTab', enabled, { immediate: true }),
        setRfqAlwaysOnTop: (enabled) => updatePreference('rfqAlwaysOnTop', enabled, { immediate: true }),
        setRfqMaxDealers: (maxDealers) => updatePreference('rfqMaxDealers', maxDealers, { immediate: true }),
        setHideLegacyWorkspace: (enabled) => updatePreference('hideLegacyWorkspace', enabled, { immediate: true }),
        setColumnOrder: (order, opts) => updatePreference('columnOrder', order, opts),
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
