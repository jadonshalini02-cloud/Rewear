import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import authRoutes from './server/routes/auth.js';
import itemRoutes from './server/routes/items.js';
import swapRoutes from './server/routes/swaps.js';
import conversationRoutes from './server/routes/conversations.js';
import favoriteRoutes from './server/routes/favorites.js';
import userRoutes from './server/routes/users.js';
import reportRoutes from './server/routes/reports.js';
import adminRoutes from './server/routes/admin.js';
import uploadRoutes from './server/routes/upload.js';
import calculatorRoutes from './server/routes/calculator.js';
import notificationRoutes from './server/routes/notifications.js';
import { initializeDatabase } from './server/db/database.js';

export const app = express();
const PORT = Number(process.env.PORT || 3000);

// Middleware
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// CORS headers for local/custom frontend origins
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Initialize the durable database once per serverless instance and make every
// request wait for it before touching the in-memory compatibility cache.
const databaseReady = initializeDatabase();
app.use(async (_req, res, next) => {
  try {
    await databaseReady;
    next();
  } catch (error) {
    console.error('Database initialization failed:', error);
    res.status(503).json({ error: 'Database is temporarily unavailable.' });
  }
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/swaps', swapRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/calculator', calculatorRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), platform: 'ReWear Sustainable Fashion Marketplace' });
});

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌿 ReWear Server running on http://0.0.0.0:${PORT}`);
  });
}

export default app;

if (process.env.VERCEL !== '1') {
  startServer().catch((err) => {
    console.error('Failed to start ReWear server:', err);
  });
}
