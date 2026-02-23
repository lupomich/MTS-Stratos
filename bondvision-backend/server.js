dotenv.config();
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from 'redis';
import { Pool } from 'pg';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import preferencesRoutes from './routes/preferences.js';
import bondsRouter from './routes/bonds.js';

dotenv.config();

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

console.log('Starting Bondvision backend...');
console.log('ENV:', process.env);

const app = express();
app.use(express.json());
const allowedOrigins = [
  'http://localhost:3002',
  'http://bondvision-digital:3002',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  credentials: true
}));

let pool, redis;
try {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  redis = createClient({ url: process.env.REDIS_URL });
  redis.connect();
  app.set('pool', pool);
  app.set('redis', redis);
} catch (err) {
  console.error('Failed to init DB/Redis:', err);
  process.exit(1);
}

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/bonds', bondsRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bondvision backend running on port ${PORT}`);
});
