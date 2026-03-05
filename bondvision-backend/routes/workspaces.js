import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// ── Auth helper (mirrors preferences.js pattern) ─────────────────────────────

function decodeUserFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) return null;
    return { id: decoded.id, username: decoded.username, role: decoded.role, sessionId: decoded.sessionId };
  } catch { return null; }
}

async function requireAuth(req, res) {
  const decoded = decodeUserFromRequest(req);
  if (!decoded) { res.status(401).json({ error: 'Authentication required' }); return null; }
  const pool = req.app.get('pool');
  const result = await pool.query(
    'SELECT id, username, role, is_logged_in, active_session_id FROM users WHERE id = $1 AND is_active = true LIMIT 1',
    [decoded.id]
  );
  if (result.rows.length === 0) { res.status(401).json({ error: 'Invalid token user' }); return null; }
  const user = result.rows[0];
  if (!user.is_logged_in || !user.active_session_id || user.active_session_id !== decoded.sessionId) {
    res.status(401).json({ error: 'Session expired' }); return null;
  }
  return user;
}

// ── Shape helper ─────────────────────────────────────────────────────────────

const normalizeWorkspace = (row) => ({
  id: row.id,
  name: row.name,
  mode: row.mode,
  slots: row.slots ?? [],
  layout: row.layout ?? {},
  hiddenSlots: row.hidden_slots ?? [],
  sortOrder: row.sort_order ?? 0,
  lastActiveAt: row.last_active_at ?? null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// ── Routes ────────────────────────────────────────────────────────────────────

// GET /api/workspaces
router.get('/', async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const pool = req.app.get('pool');
  try {
    const result = await pool.query(
      'SELECT * FROM user_workspaces WHERE user_id = $1 ORDER BY sort_order ASC, created_at ASC',
      [user.id]
    );
    res.json({ workspaces: result.rows.map(normalizeWorkspace) });
  } catch (err) {
    console.error('GET /workspaces error:', err);
    res.status(500).json({ error: 'Failed to load workspaces' });
  }
});

// POST /api/workspaces
router.post('/', async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const pool = req.app.get('pool');
  const { name, mode, slots, layout, hidden_slots, hiddenSlots, sort_order, sortOrder } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO user_workspaces (user_id, name, mode, slots, layout, hidden_slots, sort_order)
       VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, $7)
       RETURNING *`,
      [
        user.id,
        name || 'Workspace',
        mode || 'legacy',
        JSON.stringify(slots || []),
        JSON.stringify(layout || {}),
        JSON.stringify(hidden_slots ?? hiddenSlots ?? []),
        sort_order ?? sortOrder ?? 0,
      ]
    );
    res.status(201).json({ workspace: normalizeWorkspace(result.rows[0]) });
  } catch (err) {
    console.error('POST /workspaces error:', err);
    res.status(500).json({ error: 'Failed to create workspace' });
  }
});

// PUT /api/workspaces/:id/activate  — must be BEFORE /:id to avoid conflict
router.put('/:id/activate', async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const pool = req.app.get('pool');
  try {
    await pool.query(
      `UPDATE user_workspaces
         SET last_active_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND id = $2`,
      [user.id, req.params.id]
    );
    res.json({ message: 'Workspace activated' });
  } catch (err) {
    console.error('PUT /workspaces/:id/activate error:', err);
    res.status(500).json({ error: 'Failed to activate workspace' });
  }
});

// PUT /api/workspaces/:id  — partial update
router.put('/:id', async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const pool = req.app.get('pool');
  const body = req.body;

  const setClauses = [];
  const values = [];
  let i = 1;

  // Support both camelCase (frontend) and snake_case
  const fields = [
    ['name',         body.name,                                       ''],
    ['mode',         body.mode,                                       ''],
    ['slots',        body.slots !== undefined        ? JSON.stringify(body.slots)        : undefined, '::jsonb'],
    ['layout',       body.layout !== undefined       ? JSON.stringify(body.layout)       : undefined, '::jsonb'],
    ['hidden_slots', (body.hidden_slots ?? body.hiddenSlots) !== undefined
                      ? JSON.stringify(body.hidden_slots ?? body.hiddenSlots)
                      : undefined,                                     '::jsonb'],
    ['sort_order',   body.sort_order ?? body.sortOrder,              ''],
  ];

  for (const [col, val, cast] of fields) {
    if (val !== undefined) {
      setClauses.push(`${col} = $${i}${cast}`);
      values.push(val);
      i += 1;
    }
  }

  if (setClauses.length === 0) return res.json({ message: 'Nothing to update' });

  values.push(user.id, req.params.id);
  try {
    const result = await pool.query(
      `UPDATE user_workspaces
          SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $${i} AND id = $${i + 1}
        RETURNING *`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Workspace not found' });
    res.json({ workspace: normalizeWorkspace(result.rows[0]) });
  } catch (err) {
    console.error('PUT /workspaces/:id error:', err);
    res.status(500).json({ error: 'Failed to update workspace' });
  }
});

// DELETE /api/workspaces/:id
router.delete('/:id', async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const pool = req.app.get('pool');
  try {
    await pool.query('DELETE FROM user_workspaces WHERE user_id = $1 AND id = $2', [user.id, req.params.id]);
    res.json({ message: 'Workspace deleted' });
  } catch (err) {
    console.error('DELETE /workspaces/:id error:', err);
    res.status(500).json({ error: 'Failed to delete workspace' });
  }
});

export default router;
