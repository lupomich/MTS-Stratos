import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Default preferences
const defaultPreferences = {
  theme: 'dark',
  language: 'en',
  defaultColumns: ['isin', 'description', 'price', 'yield', 'maturity'],
  lastTab: 'government-bonds',
  selectedCountryTab: 'IT',
  gridLayout: 'comfortable',
  rfqOpenInPopup: false
};

function getUserFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) {
      return null;
    }

    return {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role
    };
  } catch {
    return null;
  }
}

async function getUiSettingsFromDb(pool, userId) {
  const result = await pool.query(
    `SELECT preference_value
     FROM user_preferences
     WHERE user_id = $1 AND preference_key = 'ui_settings'
     LIMIT 1`,
    [userId]
  );

  if (result.rows.length === 0) {
    await pool.query(
      `INSERT INTO user_preferences (user_id, preference_key, preference_value)
       VALUES ($1, 'ui_settings', $2::jsonb)
       ON CONFLICT (user_id, preference_key) DO NOTHING`,
      [userId, JSON.stringify(defaultPreferences)]
    );

    return defaultPreferences;
  }

  return { ...defaultPreferences, ...(result.rows[0].preference_value || {}) };
}

// Get user preferences
router.get('/', async (req, res) => {
  const user = getUserFromRequest(req);

  if (!user) {
    return res.json({
      preferences: {
        ui_settings: defaultPreferences
      }
    });
  }

  const pool = req.app.get('pool');

  try {
    const uiSettings = await getUiSettingsFromDb(pool, user.id);

    res.json({
      preferences: {
        ui_settings: uiSettings
      }
    });
  } catch (error) {
    console.error('Failed to load preferences from DB:', error);
    res.status(500).json({ error: 'Failed to load preferences' });
  }
});

router.get('/ui_settings', async (req, res) => {
  const user = getUserFromRequest(req);

  if (!user) {
    return res.json({
      preferences: {
        ui_settings: defaultPreferences
      }
    });
  }

  const pool = req.app.get('pool');

  try {
    const uiSettings = await getUiSettingsFromDb(pool, user.id);

    res.json({
      preferences: {
        ui_settings: uiSettings
      }
    });
  } catch (error) {
    console.error('Failed to load ui_settings from DB:', error);
    res.status(500).json({ error: 'Failed to load preferences' });
  }
});

// Update user preference
router.put('/ui_settings', async (req, res) => {
  const user = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const pool = req.app.get('pool');
  const nextSettings = { ...defaultPreferences, ...req.body };

  try {
    await pool.query(
      `INSERT INTO user_preferences (user_id, preference_key, preference_value)
       VALUES ($1, 'ui_settings', $2::jsonb)
       ON CONFLICT (user_id, preference_key)
       DO UPDATE SET
         preference_value = EXCLUDED.preference_value,
         updated_at = CURRENT_TIMESTAMP`,
      [user.id, JSON.stringify(nextSettings)]
    );

    res.json({ message: 'Preferences saved successfully', preferences: { ui_settings: nextSettings } });
  } catch (error) {
    console.error('Failed to save preferences to DB:', error);
    res.status(500).json({ error: 'Failed to save preferences' });
  }
});

export default router;
