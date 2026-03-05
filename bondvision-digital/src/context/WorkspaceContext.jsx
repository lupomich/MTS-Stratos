import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const WorkspaceContext = createContext(null);

export const DEFAULT_WORKSPACE_LAYOUT = {
  tradingWidth: 60,
  marketWidth: 40,
  dataHeight: 35,
  isMarketDepthCollapsed: false,
  isDataPanelCollapsed: false,
};

export const EMPTY_WORKSPACE_SLOTS = Array.from({ length: 6 }, () => null);

const makeDefaultWorkspace = () => ({
  id: 'workspace-default',
  name: 'Default Workspace',
  mode: 'legacy',
  slots: [...EMPTY_WORKSPACE_SLOTS],
  layout: { ...DEFAULT_WORKSPACE_LAYOUT },
  hiddenSlots: [],
  sortOrder: 0,
  lastActiveAt: null,
});

const normalizeFromDb = (row) => ({
  id: row.id,
  name: row.name,
  mode: row.mode,
  slots: Array.isArray(row.slots) ? row.slots : [...EMPTY_WORKSPACE_SLOTS],
  layout: row.layout && typeof row.layout === 'object' ? row.layout : { ...DEFAULT_WORKSPACE_LAYOUT },
  hiddenSlots: Array.isArray(row.hiddenSlots) ? row.hiddenSlots : [],
  sortOrder: row.sortOrder ?? 0,
  lastActiveAt: row.lastActiveAt ?? null,
});

const makeTempId = () => `workspace-local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// ── Provider ──────────────────────────────────────────────────────────────────

export function WorkspaceProvider({ children }) {
  const { isAuthenticated, token } = useAuth();
  const [workspaces, setWorkspaces] = useState([makeDefaultWorkspace()]);
  const [activeWorkspaceId, setActiveWorkspaceIdRaw] = useState('workspace-default');
  const [loading, setLoading] = useState(true);

  // pendingSavesRef stores { [wsId]: { timerId, persist } } so we can flush on logout
  const pendingSavesRef = useRef({});
  const isAuthRef = useRef(isAuthenticated);
  const tokenRef = useRef(token);
  useEffect(() => { isAuthRef.current = isAuthenticated; }, [isAuthenticated]);
  useEffect(() => { tokenRef.current = token; }, [token]);

  // ── Load on auth state change ────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      // Flush any pending debounced saves before the session is invalidated
      Object.entries(pendingSavesRef.current).forEach(([wsId, { timerId, payload, capturedToken }]) => {
        clearTimeout(timerId);
        axios.put(`/workspaces/${wsId}`, payload, {
          headers: { Authorization: `Bearer ${capturedToken}` },
        }).catch((err) => console.error('[WorkspaceContext] Flush-on-logout error:', err));
      });
    } else {
      // Switching accounts / token refresh — just cancel pending saves
      Object.values(pendingSavesRef.current).forEach(({ timerId }) => clearTimeout(timerId));
    }
    pendingSavesRef.current = {};

    if (isAuthenticated) {
      loadFromBackend();
    } else {
      loadFromLocalStorage();
    }
  }, [isAuthenticated, token]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Persist to localStorage when not authenticated ───────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      try { localStorage.setItem('mts-bv-workspaces', JSON.stringify(workspaces)); } catch { /* ignore */ }
      try { localStorage.setItem('mts-bv-activeWorkspaceId', activeWorkspaceId); } catch { /* ignore */ }
    }
  }, [workspaces, activeWorkspaceId, isAuthenticated]);

  // ── Loaders ──────────────────────────────────────────────────────────────

  const loadFromBackend = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/workspaces');
      const rows = res.data.workspaces ?? [];
      if (rows.length > 0) {
        const normalized = rows.map(normalizeFromDb);
        setWorkspaces(normalized);
        // Activate the workspace with the most recent last_active_at
        const byActivity = [...normalized].sort((a, b) => {
          if (!a.lastActiveAt && !b.lastActiveAt) return 0;
          if (!a.lastActiveAt) return 1;
          if (!b.lastActiveAt) return -1;
          return new Date(b.lastActiveAt) - new Date(a.lastActiveAt);
        });
        setActiveWorkspaceIdRaw(byActivity[0].id);
      } else {
        // First login — create a default workspace in DB
        const createRes = await axios.post('/workspaces', {
          name: 'Default Workspace',
          mode: 'legacy',
          slots: EMPTY_WORKSPACE_SLOTS,
          layout: DEFAULT_WORKSPACE_LAYOUT,
          hidden_slots: [],
          sort_order: 0,
        });
        const created = normalizeFromDb(createRes.data.workspace);
        setWorkspaces([created]);
        setActiveWorkspaceIdRaw(created.id);
      }
    } catch (err) {
      console.error('[WorkspaceContext] Failed to load from DB:', err);
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('mts-bv-workspaces');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWorkspaces(parsed);
          const savedActive = localStorage.getItem('mts-bv-activeWorkspaceId');
          const validActive = savedActive && parsed.find((w) => w.id === savedActive) ? savedActive : parsed[0].id;
          setActiveWorkspaceIdRaw(validActive);
          setLoading(false);
          return;
        }
      }
    } catch { /* ignore */ }
    const def = makeDefaultWorkspace();
    setWorkspaces([def]);
    setActiveWorkspaceIdRaw(def.id);
    setLoading(false);
  };

  // ── CRUD actions ─────────────────────────────────────────────────────────

  const setActiveWorkspaceId = useCallback(async (id) => {
    setActiveWorkspaceIdRaw(id);
    if (isAuthRef.current) {
      try { await axios.put(`/workspaces/${id}/activate`); } catch { /* best-effort */ }
    }
  }, []);

  /** Create a new workspace. Optimistic local insert, then replace with DB id. */
  const addWorkspace = useCallback(async (wsData) => {
    const tempId = makeTempId();
    const optimistic = {
      id: tempId,
      name: wsData.name ?? 'Workspace',
      mode: wsData.mode ?? 'legacy',
      slots: wsData.slots ?? [...EMPTY_WORKSPACE_SLOTS],
      layout: wsData.layout ?? { ...DEFAULT_WORKSPACE_LAYOUT },
      hiddenSlots: wsData.hiddenSlots ?? [],
      sortOrder: wsData.sortOrder ?? 0,
      lastActiveAt: null,
    };
    setWorkspaces((prev) => [...prev, optimistic]);
    setActiveWorkspaceIdRaw(tempId);

    if (isAuthRef.current) {
      try {
        const res = await axios.post('/workspaces', {
          name: optimistic.name,
          mode: optimistic.mode,
          slots: optimistic.slots,
          layout: optimistic.layout,
          hidden_slots: optimistic.hiddenSlots,
          sort_order: optimistic.sortOrder,
        });
        const created = normalizeFromDb(res.data.workspace);
        // Swap the temp id for the real UUID
        setWorkspaces((prev) => prev.map((w) => w.id === tempId ? created : w));
        setActiveWorkspaceIdRaw((prev) => prev === tempId ? created.id : prev);
      } catch (err) {
        console.error('[WorkspaceContext] Failed to persist new workspace:', err);
      }
    }

    return tempId;
  }, []);

  /** Update one or more fields. Debounced DB write (immediate=true to skip debounce).
   *  Multiple rapid calls for the same workspace are MERGED into a single PUT so no
   *  field is lost when the timer is rescheduled (e.g. slots then hiddenSlots). */
  const updateWorkspace = useCallback((id, updates, immediate = false) => {
    setWorkspaces((prev) => prev.map((w) => w.id === id ? { ...w, ...updates } : w));

    if (!isAuthRef.current) return;

    // Build the DB-column fragment for this update
    const fragment = {};
    if (updates.name        !== undefined) fragment.name         = updates.name;
    if (updates.mode        !== undefined) fragment.mode         = updates.mode;
    if (updates.slots       !== undefined) fragment.slots        = updates.slots;
    if (updates.layout      !== undefined) fragment.layout       = updates.layout;
    if (updates.hiddenSlots !== undefined) fragment.hidden_slots = updates.hiddenSlots;
    if (updates.sortOrder   !== undefined) fragment.sort_order   = updates.sortOrder;
    if (Object.keys(fragment).length === 0) return;

    // Merge with any already-queued payload for this workspace (so no prior
    // fields are lost when the timer is rescheduled)
    const existing = pendingSavesRef.current[id];
    const mergedPayload = { ...(existing?.payload ?? {}), ...fragment };
    // Always capture the freshest token
    const capturedToken = tokenRef.current;

    if (existing?.timerId) clearTimeout(existing.timerId);

    const flush = () => {
      delete pendingSavesRef.current[id];
      axios.put(`/workspaces/${id}`, mergedPayload, {
        headers: { Authorization: `Bearer ${capturedToken}` },
      }).catch((err) => console.error('[WorkspaceContext] Save error:', err));
    };

    if (immediate) {
      flush();
    } else {
      const timerId = setTimeout(flush, 1500);
      pendingSavesRef.current[id] = { timerId, payload: mergedPayload, capturedToken };
    }
  }, []);

  /** Reorder workspaces given an array of ids in the new order. */
  const reorderWorkspaces = useCallback((orderedIds) => {
    setWorkspaces((prev) => {
      const map = Object.fromEntries(prev.map((w) => [w.id, w]));
      return orderedIds.map((id, i) => ({ ...map[id], sortOrder: i }));
    });
    if (isAuthRef.current) {
      orderedIds.forEach((id, i) => {
        axios.put(`/workspaces/${id}`, { sort_order: i }).catch((err) =>
          console.error('[WorkspaceContext] Reorder error:', err)
        );
      });
    }
  }, []);

  /** Delete a workspace (removes from list and DB). */
  const deleteWorkspace = useCallback(async (id) => {
    if (pendingSavesRef.current[id]) { clearTimeout(pendingSavesRef.current[id].timerId); delete pendingSavesRef.current[id]; }
    if (isAuthRef.current) {
      try { await axios.delete(`/workspaces/${id}`); } catch (err) { console.error('[WorkspaceContext] Delete error:', err); }
    }
    setWorkspaces((prev) => {
      const remaining = prev.filter((w) => w.id !== id);
      if (remaining.length === 0) {
        const def = makeDefaultWorkspace();
        setActiveWorkspaceIdRaw(def.id);
        return [def];
      }
      setActiveWorkspaceIdRaw((curr) => (curr === id ? remaining[0].id : curr));
      return remaining;
    });
  }, []);

  // ── Context value ─────────────────────────────────────────────────────────

  return (
    <WorkspaceContext.Provider value={{
      workspaces,
      activeWorkspaceId,
      loading,
      setActiveWorkspaceId,
      addWorkspace,
      updateWorkspace,
      deleteWorkspace,
      reorderWorkspaces,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}
