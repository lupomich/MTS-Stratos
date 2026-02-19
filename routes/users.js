// User Management Routes (Admin)
const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const redisClient = require('../config/redis');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/users - List all users (admin only)
router.get('/', requireRole('admin'), async (req, res) => {
    try {
        const { page = 1, limit = 20, role, active } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT id, username, email, role, is_active, created_at, last_login FROM users';
        let params = [];
        let conditions = [];

        if (role) {
            conditions.push(`role = $${params.length + 1}`);
            params.push(role);
        }

        if (active !== undefined) {
            conditions.push(`is_active = $${params.length + 1}`);
            params.push(active === 'true');
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await db.query(query, params);

        // Get total count
        const countResult = await db.query('SELECT COUNT(*) FROM users');
        const total = parseInt(countResult.rows[0].count);

        res.json({
            users: result.rows,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('List users error:', error);
        res.status(500).json({ error: 'Failed to list users' });
    }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Users can view their own profile, admins can view any
        if (req.user.role !== 'admin' && req.user.id !== id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const result = await db.query(
            'SELECT id, username, email, role, is_active, created_at, last_login FROM users WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

// PUT /api/users/:id - Update user (admin or self)
router.put('/:id',
    [
        body('email').optional().isEmail().normalizeEmail(),
        body('role').optional().isIn(['user', 'admin', 'trader', 'viewer']),
        body('is_active').optional().isBoolean()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { email, role, is_active } = req.body;

        try {
            // Users can update their own email, admins can update everything
            if (req.user.role !== 'admin' && req.user.id !== id) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            // Only admins can change role or active status
            if ((role || is_active !== undefined) && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Only admins can change role or status' });
            }

            const updates = [];
            const params = [];
            let paramCount = 1;

            if (email) {
                updates.push(`email = $${paramCount++}`);
                params.push(email);
            }

            if (role && req.user.role === 'admin') {
                updates.push(`role = $${paramCount++}`);
                params.push(role);
            }

            if (is_active !== undefined && req.user.role === 'admin') {
                updates.push(`is_active = $${paramCount++}`);
                params.push(is_active);
            }

            if (updates.length === 0) {
                return res.status(400).json({ error: 'No updates provided' });
            }

            params.push(id);
            const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, username, email, role, is_active`;

            const result = await db.query(query, params);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Invalidate cache
            await redisClient.del(`user:${id}`);

            // Log audit
            await db.query(
                `INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address)
                 VALUES ($1, 'USER_UPDATED', 'user', $2, $3, $4)`,
                [req.user.id, id, JSON.stringify({ updates: req.body }), req.ip]
            );

            res.json({
                message: 'User updated successfully',
                user: result.rows[0]
            });
        } catch (error) {
            console.error('Update user error:', error);
            res.status(500).json({ error: 'Failed to update user' });
        }
    }
);

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', requireRole('admin'), async (req, res) => {
    try {
        const { id } = req.params;

        // Cannot delete yourself
        if (req.user.id === id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        const result = await db.query(
            'DELETE FROM users WHERE id = $1 RETURNING username',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Invalidate cache
        await redisClient.del(`user:${id}`);

        // Log audit
        await db.query(
            `INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address)
             VALUES ($1, 'USER_DELETED', 'user', $2, $3, $4)`,
            [req.user.id, id, JSON.stringify({ username: result.rows[0].username }), req.ip]
        );

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// PUT /api/users/:id/password - Change password
router.put('/:id/password',
    [
        body('currentPassword').if(() => false).notEmpty(), // Only for self
        body('newPassword').isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;

        try {
            // Users can change their own password, admins can change any
            const isAdmin = req.user.role === 'admin';
            const isSelf = req.user.id === id;

            if (!isAdmin && !isSelf) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            // If user is changing their own password, verify current password
            if (isSelf && !isAdmin) {
                const result = await db.query(
                    'SELECT password_hash FROM users WHERE id = $1',
                    [id]
                );

                const isValid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
                if (!isValid) {
                    return res.status(401).json({ error: 'Current password is incorrect' });
                }
            }

            // Hash new password
            const passwordHash = await bcrypt.hash(newPassword, 10);

            // Update password
            await db.query(
                'UPDATE users SET password_hash = $1 WHERE id = $2',
                [passwordHash, id]
            );

            // Log audit
            await db.query(
                `INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address)
                 VALUES ($1, 'PASSWORD_CHANGED', 'user', $2, $3, $4)`,
                [req.user.id, id, JSON.stringify({ changed_by: req.user.username }), req.ip]
            );

            res.json({ message: 'Password changed successfully' });
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({ error: 'Failed to change password' });
        }
    }
);

module.exports = router;
