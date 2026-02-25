import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
// Import MongoDB configuration
import { mongodb } from './server/mongodb';
// Keep the original db import as fallback
import { initializeDatabase } from './server/db';
import authRoutes from './server/routes/auth';
import activityRoutes from './server/routes/activities';
import galleryRoutes from './server/routes/gallery';
import contentRoutes from './server/routes/content';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Serve uploaded files (for development only)
  if (process.env.NODE_ENV !== 'production') {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    app.use('/uploads', express.static(uploadsDir));
  }

  // Initialize Database - try MongoDB first, fallback to in-memory
  try {
    if (process.env.MONGODB_URI) {
      console.log('🔗 Connecting to MongoDB...');
      await mongodb.connect();
      console.log('✅ MongoDB connected successfully');
    } else {
      console.log('⚠️  No MongoDB URI found, using in-memory database');
      initializeDatabase();
      console.log('✅ In-memory database initialized successfully');
    }
  } catch (error) {
    console.error('❌ MongoDB connection failed, falling back to in-memory database:', error);
    initializeDatabase();
    console.log('✅ Fallback to in-memory database successful');
  }

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/activities', activityRoutes);
  app.use('/api/gallery', galleryRoutes);
  app.use('/api/content', contentRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.ssrFixStacktrace);
    app.use(vite.middlewares);
  } else {
    // Production - serve static files
    app.use('/', express.static(path.join(__dirname, 'dist')));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  return app;
}

// Graceful shutdown for MongoDB
process.on('SIGINT', async () => {
  console.log('\n🚪 Shutting down gracefully...');
  try {
    await mongodb.disconnect();
  } catch (error) {
    console.error('Error during MongoDB disconnect:', error);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🚪 Received SIGTERM, shutting down gracefully...');
  try {
    await mongodb.disconnect();
  } catch (error) {
    console.error('Error during MongoDB disconnect:', error);
  }
  process.exit(0);
});

createApp().then(app => {
  const port = process.env.PORT || 3000;
  
  const server = app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Database: ${process.env.MONGODB_URI ? 'MongoDB' : 'In-Memory'}`);
  });

  // Handle server shutdown
  server.on('close', async () => {
    try {
      await mongodb.disconnect();
    } catch (error) {
      console.error('Error during server shutdown:', error);
    }
  });
}).catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});