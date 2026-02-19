// Authentication Routes
const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const redisClient = require('../config/redis');
const { generateToken, blacklistToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register - Register new user
router.post('/register',
    [
        body('username').trim().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_-]+$/),
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 6 }),
        body('role').optional().isIn(['admin', 'trader', 'viewer'])
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password, role = 'viewer' } = req.body;

        try {
            // Check if user already exists
            const existingUser = await db.query(
                'SELECT id FROM users WHERE username = $1 OR email = $2',
                [username, email]
            );

            if (existingUser.rows.length > 0) {
                return res.status(409).json({ error: 'Username or email already exists' });
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);

            // Insert user
            const result = await db.query(
                `INSERT INTO users (username, email, password_hash, role) 
                 VALUES ($1, $2, $3, $4) 
                 RETURNING id, username, email, role, created_at`,
                [username, email, passwordHash, role]
            );

            const newUser = result.rows[0];

            // Create default preferences
            await db.query(
                `INSERT INTO user_preferences (user_id, preference_key, preference_value)
                 VALUES ($1, 'ui_settings', $2)`,
                [newUser.id, JSON.stringify({
                    theme: 'light',
                    language: 'en',
                    defaultColumns: ['isin', 'description', 'price', 'yield'],
                    lastTab: 'government-bonds',
                    gridLayout: 'comfortable'
                })]
            );

            // Log audit
            await db.query(
                `INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address)
                 VALUES ($1, 'USER_REGISTERED', 'user', $2, $3, $4)`,
                [newUser.id, newUser.id, JSON.stringify({ username }), req.ip]
            );

            res.status(201).json({
                message: 'User registered successfully',
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Registration failed' });
        }
    }
);

// POST /api/auth/login - Login user
router.post('/login',
    [
        body('username').trim().notEmpty(),
        body('password').notEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        try {
            // Get user
            const result = await db.query(
                'SELECT * FROM users WHERE username = $1 AND is_active = true',
                [username]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const user = result.rows[0];

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate JWT token
            const token = generateToken(user);

            // Update last login
            await db.query(
                'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
                [user.id]
            );

            // Store session
            await db.query(
                `INSERT INTO user_sessions (user_id, token_hash, ip_address, user_agent, expires_at)
                 VALUES ($1, $2, $3, $4, NOW() + INTERVAL '24 hours')`,
                [user.id, token.substring(0, 50), req.ip, req.get('user-agent')]
            );

            // Cache user in Redis (24h)
            await redisClient.setEx(
                `user:${user.id}`,
                86400,
                JSON.stringify({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                })
            );

            // Log audit
            await db.query(
                `INSERT INTO audit_log (user_id, action, details, ip_address)
                 VALUES ($1, 'USER_LOGIN', $2, $3)`,
                [user.id, JSON.stringify({ username }), req.ip]
            );

            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    }
);

// POST /api/auth/logout - Logout user
router.post('/logout', authenticateToken, async (req, res) => {
    try {
        const token = req.headers['authorization'].split(' ')[1];

        // Blacklist token
        await blacklistToken(token);

        // Deactivate session
        await db.query(
            'UPDATE user_sessions SET is_active = false WHERE user_id = $1 AND token_hash = $2',
            [req.user.id, token.substring(0, 50)]
        );

        // Log audit
        await db.query(
            `INSERT INTO audit_log (user_id, action, details, ip_address)
             VALUES ($1, 'USER_LOGOUT', $2, $3)`,
            [req.user.id, JSON.stringify({ username: req.user.username }), req.ip]
        );

        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
});

// GET /api/auth/me - Get current user info
router.get('/me', authenticateToken, async (req, res) => {
    try {
        // Try to get from Redis cache first
        const cached = await redisClient.get(`user:${req.user.id}`);
        
        if (cached) {
            return res.json({ user: JSON.parse(cached) });
        }

        // Get from database
        const result = await db.query(
            'SELECT id, username, email, role, created_at, last_login FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];

        // Cache for 1 hour
        await redisClient.setEx(`user:${user.id}`, 3600, JSON.stringify(user));

        res.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

module.exports = router;
