// Debug entrypoint for backend container
console.log('--- Bondvision Backend Entrypoint ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('REDIS_URL:', process.env.REDIS_URL);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'set' : 'missing');
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);

import('./server.js').catch((err) => {
  console.error('Entrypoint error:', err);
  process.exit(1);
});