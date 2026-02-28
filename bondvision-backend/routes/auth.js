import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const SESSION_IDLE_TIMEOUT_SECONDS = Number(process.env.SESSION_IDLE_TIMEOUT_SECONDS || 120);

const getOnlineKey = (userId) => `auth:online:${userId}`;

const normalizeLanguage = (language) => (language === 'it' ? 'it' : 'en');

const getAlreadyLoggedMessage = (language) => {
  const normalized = normalizeLanguage(language);
  if (normalized === 'it') {
    return "Utente già collegato da un'altra sessione";
  }
  return 'User already logged in from another session';
};

const getUserPreferredLanguage = async (pool, userId) => {
  const result = await pool.query(
    `SELECT preference_value->>'language' AS language
     FROM user_preferences
     WHERE user_id = $1 AND preference_key = 'ui_settings'
     LIMIT 1`,
    [userId]
  );

  return normalizeLanguage(result.rows[0]?.language);
};

const syncOnlineCache = async (redis, userId, sessionId) => {
  if (!redis) return;
  await redis.set(getOnlineKey(userId), sessionId, { EX: 60 * 60 * 24 });
};

const clearOnlineCache = async (redis, userId) => {
  if (!redis) return;
  await redis.del(getOnlineKey(userId));
};

const clearUserSessionState = async (pool, redis, userId) => {
  await pool.query(
    `UPDATE users
     SET is_logged_in = false,
         active_session_id = NULL,
         active_session_at = NULL
     WHERE id = $1`,
    [userId]
  );
  await clearOnlineCache(redis, userId);
};

const isSessionStale = (activeSessionAt) => {
  if (!activeSessionAt) return true;
  const activeAtMs = new Date(activeSessionAt).getTime();
  if (!Number.isFinite(activeAtMs)) return true;
  return (Date.now() - activeAtMs) > (SESSION_IDLE_TIMEOUT_SECONDS * 1000);
};

router.post('/login',
  body('username').isString(),
  body('password').isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid input' });
    const { username, password } = req.body;
    const pool = req.app.get('pool');
    const redis = req.app.get('redis');
    try {
      const result = await pool.query('SELECT * FROM users WHERE username = $1 AND is_active = true', [username]);
      if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });

      let cachedSessionId = null;
      try {
        cachedSessionId = await redis?.get(getOnlineKey(user.id));
      } catch (cacheErr) {
        console.error('Redis read error on login:', cacheErr.message);
      }

      if (cachedSessionId && user.is_logged_in) {
        const language = await getUserPreferredLanguage(pool, user.id);
        return res.status(409).json({
          error: getAlreadyLoggedMessage(language),
          code: 'ALREADY_LOGGED_IN',
          language
        });
      }

      if (!cachedSessionId && user.is_logged_in) {
        if (isSessionStale(user.active_session_at)) {
          try {
            await clearUserSessionState(pool, redis, user.id);
            user.is_logged_in = false;
            user.active_session_id = null;
            user.active_session_at = null;
          } catch (cleanupErr) {
            console.error('Stale session cleanup error on login:', cleanupErr.message);
          }
        } else {
          try {
            await syncOnlineCache(redis, user.id, user.active_session_id || randomUUID());
          } catch (cacheErr) {
            console.error('Redis sync error on login conflict path:', cacheErr.message);
          }
          const language = await getUserPreferredLanguage(pool, user.id);
          return res.status(409).json({
            error: getAlreadyLoggedMessage(language),
            code: 'ALREADY_LOGGED_IN',
            language
          });
        }
      }

      if (cachedSessionId && !user.is_logged_in) {
        try {
          await clearOnlineCache(redis, user.id);
        } catch (cacheErr) {
          console.error('Redis stale cleanup error on login:', cacheErr.message);
        }
      }

      const sessionId = randomUUID();
      await pool.query(
        `UPDATE users
         SET last_login = CURRENT_TIMESTAMP,
             is_logged_in = true,
             active_session_id = $2,
             active_session_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [user.id, sessionId]
      );

      try {
        await syncOnlineCache(redis, user.id, sessionId);
      } catch (cacheErr) {
        console.error('Redis write error on login:', cacheErr.message);
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role, sessionId },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get current authenticated user
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const pool = req.app.get('pool');
    const redis = req.app.get('redis');
    const result = await pool.query(
      'SELECT id, username, role, is_logged_in, active_session_id, active_session_at FROM users WHERE id = $1 AND is_active = true LIMIT 1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token user' });
    }

    const user = result.rows[0];
    if (isSessionStale(user.active_session_at)) {
      await clearUserSessionState(pool, redis, user.id);
      return res.status(401).json({ error: 'Session expired' });
    }

    if (!user.is_logged_in || !user.active_session_id || user.active_session_id !== decoded.sessionId) {
      return res.status(401).json({ error: 'Session expired' });
    }

    try {
      const cachedSessionId = await redis?.get(getOnlineKey(user.id));
      if (!cachedSessionId) {
        await syncOnlineCache(redis, user.id, user.active_session_id);
      } else if (cachedSessionId !== user.active_session_id) {
        return res.status(401).json({ error: 'Session expired' });
      }
    } catch (cacheErr) {
      console.error('Redis read error on /me:', cacheErr.message);
    }

    await pool.query('UPDATE users SET active_session_at = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    res.json({ user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Heartbeat endpoint keeps active session alive and avoids false stale locks
router.post('/heartbeat', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const pool = req.app.get('pool');
    const redis = req.app.get('redis');

    const result = await pool.query(
      'SELECT id, is_logged_in, active_session_id, active_session_at FROM users WHERE id = $1 AND is_active = true LIMIT 1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token user' });
    }

    const user = result.rows[0];
    if (isSessionStale(user.active_session_at)) {
      await clearUserSessionState(pool, redis, user.id);
      return res.status(401).json({ error: 'Session expired' });
    }

    if (!user.is_logged_in || !user.active_session_id || user.active_session_id !== decoded.sessionId) {
      return res.status(401).json({ error: 'Session expired' });
    }

    await pool.query('UPDATE users SET active_session_at = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
    try {
      await syncOnlineCache(redis, user.id, user.active_session_id);
    } catch (cacheErr) {
      console.error('Redis write error on heartbeat:', cacheErr.message);
    }

    return res.json({ ok: true });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout endpoint clears persistent online status and cache in real-time
router.post('/logout', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.json({ message: 'Logged out successfully' });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const pool = req.app.get('pool');
    const redis = req.app.get('redis');
    await clearUserSessionState(pool, redis, decoded.id);
  } catch (err) {
    console.error('Logout token parse error:', err.message);
  }

  res.json({ message: 'Logged out successfully' });
});

export default router;
