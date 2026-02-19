require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const preferenceRoutes = require('./routes/preferences');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        service: 'MTS-Stratos API'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/preferences', preferenceRoutes);

// Legacy endpoint (keeping for backward compatibility)
app.post('/api/greet', (req, res) => {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Nome richiesto' });
    }
    
    res.json({ message: `Hello ${name}` });
});

// Serve the client
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║           MTS-Stratos API Server                          ║
╠═══════════════════════════════════════════════════════════╣
║  Port:        ${PORT}                                        ║
║  Environment: ${process.env.NODE_ENV || 'development'}                              ║
║  Endpoints:                                               ║
║    POST   /api/auth/login                                 ║
║    POST   /api/auth/register                              ║
║    POST   /api/auth/logout                                ║
║    GET    /api/auth/me                                    ║
║    GET    /api/users                                      ║
║    GET    /api/preferences                                ║
║    GET    /health                                         ║
╚═══════════════════════════════════════════════════════════╝
    `);
});
