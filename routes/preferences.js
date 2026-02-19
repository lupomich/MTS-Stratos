// User Preferences Routes
const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const redisClient = require('../config/redis');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/preferences - Get all user preferences
router.get('/', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT preference_key, preference_value, updated_at FROM user_preferences WHERE user_id = $1',
            [req.user.id]
        );

        const preferences = {};
        result.rows.forEach(row => {
            preferences[row.preference_key] = row.preference_value;
        });

        res.json({ preferences });
    } catch (error) {
        console.error('Get preferences error:', error);
        res.status(500).json({ error: 'Failed to get preferences' });
    }
});

// GET /api/preferences/:key - Get specific preference
router.get('/:key', async (req, res) => {
    try {
        const { key } = req.params;

        // Try Redis cache first
        const cached = await redisClient.get(`pref:${req.user.id}:${key}`);
        if (cached) {
            return res.json({ 
                key,
                value: JSON.parse(cached)
            });
        }

        // Get from database
        const result = await db.query(
            'SELECT preference_value, updated_at FROM user_preferences WHERE user_id = $1 AND preference_key = $2',
            [req.user.id, key]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Preference not found' });
        }

        const preference = result.rows[0];

        // Cache for 1 hour
        await redisClient.setEx(
            `pref:${req.user.id}:${key}`,
            3600,
            JSON.stringify(preference.preference_value)
        );

        res.json({
            key,
            value: preference.preference_value,
            updated_at: preference.updated_at
        });
    } catch (error) {
        console.error('Get preference error:', error);
        res.status(500).json({ error: 'Failed to get preference' });
    }
});

// PUT /api/preferences/:key - Set/update preference
router.put('/:key',
    [
        body('value').notEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { key } = req.params;
        const { value } = req.body;

        try {
            // Upsert preference
            const result = await db.query(
                `INSERT INTO user_preferences (user_id, preference_key, preference_value)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (user_id, preference_key)
                 DO UPDATE SET preference_value = $3, updated_at = CURRENT_TIMESTAMP
                 RETURNING *`,
                [req.user.id, key, JSON.stringify(value)]
            );

            // Update cache
            await redisClient.setEx(
                `pref:${req.user.id}:${key}`,
                3600,
                JSON.stringify(value)
            );

            // Log audit
            await db.query(
                `INSERT INTO audit_log (user_id, action, entity_type, details, ip_address)
                 VALUES ($1, 'PREFERENCE_UPDATED', 'preference', $2, $3)`,
                [req.user.id, JSON.stringify({ key, value }), req.ip]
            );

            res.json({
                message: 'Preference updated successfully',
                preference: {
                    key,
                    value,
                    updated_at: result.rows[0].updated_at
                }
            });
        } catch (error) {
            console.error('Update preference error:', error);
            res.status(500).json({ error: 'Failed to update preference' });
        }
    }
);

// DELETE /api/preferences/:key - Delete preference
router.delete('/:key', async (req, res) => {
    try {
        const { key } = req.params;

        const result = await db.query(
            'DELETE FROM user_preferences WHERE user_id = $1 AND preference_key = $2 RETURNING *',
            [req.user.id, key]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Preference not found' });
        }

        // Delete from cache
        await redisClient.del(`pref:${req.user.id}:${key}`);

        // Log audit
        await db.query(
            `INSERT INTO audit_log (user_id, action, entity_type, details, ip_address)
             VALUES ($1, 'PREFERENCE_DELETED', 'preference', $2, $3)`,
            [req.user.id, JSON.stringify({ key }), req.ip]
        );

        res.json({ message: 'Preference deleted successfully' });
    } catch (error) {
        console.error('Delete preference error:', error);
        res.status(500).json({ error: 'Failed to delete preference' });
    }
});

// POST /api/preferences/bulk - Bulk update preferences (useful for saving multiple settings at once)
router.post('/bulk',
    [
        body('preferences').isObject()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { preferences } = req.body;

        try {
            const client = await db.connect();
            
            try {
                await client.query('BEGIN');

                for (const [key, value] of Object.entries(preferences)) {
                    await client.query(
                        `INSERT INTO user_preferences (user_id, preference_key, preference_value)
                         VALUES ($1, $2, $3)
                         ON CONFLICT (user_id, preference_key)
                         DO UPDATE SET preference_value = $3, updated_at = CURRENT_TIMESTAMP`,
                        [req.user.id, key, JSON.stringify(value)]
                    );

                    // Update cache
                    await redisClient.setEx(
                        `pref:${req.user.id}:${key}`,
                        3600,
                        JSON.stringify(value)
                    );
                }

                await client.query('COMMIT');

                // Log audit
                await db.query(
                    `INSERT INTO audit_log (user_id, action, entity_type, details, ip_address)
                     VALUES ($1, 'PREFERENCES_BULK_UPDATED', 'preference', $2, $3)`,
                    [req.user.id, JSON.stringify({ keys: Object.keys(preferences) }), req.ip]
                );

                res.json({
                    message: 'Preferences updated successfully',
                    count: Object.keys(preferences).length
                });
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Bulk update preferences error:', error);
            res.status(500).json({ error: 'Failed to update preferences' });
        }
    }
);

module.exports = router;
