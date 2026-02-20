import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Default preferences
const defaultPreferences = {
  theme: 'dark',
  language: 'en',
  defaultColumns: ['isin', 'description', 'price', 'yield', 'maturity'],
  lastTab: 'government-bonds',
  gridLayout: 'comfortable'
};

const userPreferencesStore = new Map();

function getUserKey(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return 'anonymous';
  }

  try {
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.username || decoded.id || 'anonymous';
  } catch {
    return 'anonymous';
  }
}

// Get user preferences
router.get('/', (req, res) => {
  const userKey = getUserKey(req);
  const savedPreferences = userPreferencesStore.get(userKey) || defaultPreferences;

  res.json({
    preferences: {
      ui_settings: savedPreferences
    }
  });
});

router.get('/ui_settings', (req, res) => {
  const userKey = getUserKey(req);
  const savedPreferences = userPreferencesStore.get(userKey) || defaultPreferences;

  res.json({
    preferences: {
      ui_settings: savedPreferences
    }
  });
});

// Update user preference
router.put('/ui_settings', (req, res) => {
  const userKey = getUserKey(req);
  const nextSettings = { ...defaultPreferences, ...req.body };
  userPreferencesStore.set(userKey, nextSettings);

  res.json({ message: 'Preferences saved successfully', preferences: { ui_settings: nextSettings } });
});

export default router;
