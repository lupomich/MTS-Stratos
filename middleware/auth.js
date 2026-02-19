// Authentication Middleware
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');

const JWT_SECRET = process.env.JWT_SECRET || 'stratos-secret-key-2026-change-in-production';

// Verify JWT token
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        // Check if token is blacklisted in Redis
        const isBlacklisted = await redisClient.get(`blacklist:${token}`);
        if (isBlacklisted) {
            return res.status(403).json({ error: 'Token has been revoked' });
        }

        // Verify token
        const user = jwt.verify(token, JWT_SECRET);
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ error: 'Token expired' });
        }
        return res.status(403).json({ error: 'Invalid token' });
    }
};

// Check if user has required role
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: 'Insufficient permissions',
                required: allowedRoles,
                current: req.user.role
            });
        }

        next();
    };
};

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Blacklist token in Redis
const blacklistToken = async (token, expiresIn = 86400) => {
    await redisClient.setEx(`blacklist:${token}`, expiresIn, 'true');
};

module.exports = {
    authenticateToken,
    requireRole,
    generateToken,
    blacklistToken,
    JWT_SECRET
};
