import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

const router = express.Router();

router.post('/login',
  body('username').isString(),
  body('password').isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid input' });
    const { username, password } = req.body;
    const pool = req.app.get('pool');
    try {
      const result = await pool.query('SELECT * FROM users WHERE username = $1 AND is_active = true', [username]);
      if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get current authenticated user
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: { id: decoded.id, username: decoded.username, role: decoded.role } });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout endpoint (just returns success, client handles token removal)
router.post('/logout', (req, res) => {
  // In a production app, you'd invalidate the token here using a blacklist
  // For now, just return success - client handles localStorage cleanup
  res.json({ message: 'Logged out successfully' });
});

export default router;
