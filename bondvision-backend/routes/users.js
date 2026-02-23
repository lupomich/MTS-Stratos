import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

const router = express.Router();

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

router.get('/', requireAdmin, async (req, res) => {
  const pool = req.app.get('pool');
  const result = await pool.query(`
    SELECT
      u.id,
      u.username,
      u.email,
      u.role,
      u.is_active,
      u.last_login,
      u.created_by,
      c.username AS created_by_username
    FROM users u
    LEFT JOIN users c ON c.id = u.created_by
    ORDER BY u.username
  `);
  res.json({ users: result.rows });
});

router.post('/',
  requireAdmin,
  body('username').isString().isLength({ min: 3 }),
  body('email').isEmail(),
  body('password').isString().isLength({ min: 8 }),
  body('role').isIn(['admin', 'trader', 'viewer']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid input' });
    const { username, email, password, role } = req.body;
    const pool = req.app.get('pool');
    try {
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL');

      const exists = await pool.query('SELECT 1 FROM users WHERE username = $1 OR email = $2', [username, email]);
      if (exists.rows.length > 0) return res.status(409).json({ error: 'Username or email already exists' });
      const hash = await bcrypt.hash(password, 10);
      await pool.query(
        'INSERT INTO users (username, email, password_hash, role, is_active, created_by) VALUES ($1, $2, $3, $4, true, $5)',
        [username, email, hash, role, req.user.id]
      );
      res.json({ message: 'User created' });
    } catch (err) {
      console.error('User creation error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

router.put('/:id', requireAdmin, async (req, res) => {
  const pool = req.app.get('pool');
  const { id } = req.params;
  const { is_active, role, password } = req.body;
  
  try {
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    if (typeof is_active === 'boolean') {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(is_active);
    }
    
    if (role) {
      updates.push(`role = $${paramIndex++}`);
      values.push(role);
    }
    
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      updates.push(`password_hash = $${paramIndex++}`);
      values.push(hash);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }
    
    values.push(id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id`;
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User updated' });
  } catch (err) {
    console.error('User update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const pool = req.app.get('pool');
  const { id } = req.params;
  
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('User delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
