import express from 'express';

const router = express.Router();

// Default preferences
const defaultPreferences = {
  theme: 'dark',
  language: 'en',
  defaultColumns: ['isin', 'description', 'price', 'yield', 'maturity'],
  lastTab: 'government-bonds',
  gridLayout: 'comfortable'
};

// Get user preferences
router.get('/', (req, res) => {
  // For now, return default preferences in the expected format
  // In production, fetch from database based on user from token
  res.json({
    preferences: {
      ui_settings: defaultPreferences
    }
  });
});

// Update user preference
router.put('/ui_settings', (req, res) => {
  // For now, just return success
  // In production, save to database
  res.json({ message: 'Preferences saved successfully', preferences: { ui_settings: req.body } });
});

export default router;
