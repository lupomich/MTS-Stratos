// Shared bridge so AuthContext.logout() can flush any pending preferences save
// BEFORE the backend invalidates the auth token. PreferencesContext registers its
// flush here; logout awaits it. This guarantees a column change is persisted even
// if the user logs out immediately after (before the debounce timer fires).

let flushFn = null;

export const registerPreferencesFlush = (fn) => {
    flushFn = fn;
};

export const flushPendingPreferences = async () => {
    if (typeof flushFn === 'function') {
        try {
            await flushFn();
        } catch (err) {
            console.error('[preferencesFlush] flush error:', err);
        }
    }
};
