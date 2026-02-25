import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
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

  // Initialize Database (will use in-memory for serverless)
  try {
    initializeDatabase();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    // Don't throw error, let the app continue with empty database
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
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        if (req.path.startsWith('/api/')) {
          res.status(404).json({ error: 'API endpoint not found' });
        } else {
          res.sendFile(path.join(distPath, 'index.html'));
        }
      });
    } else {
      // Fallback if dist doesn't exist
      app.get('*', (req, res) => {
        if (req.path.startsWith('/api/')) {
          res.status(404).json({ error: 'API endpoint not found' });
        } else {
          res.status(404).send('Application not built. Please run build command.');
        }
      });
    }
  }

  return app;
}

let appPromise: Promise<express.Express> | null = null;

// For Vercel serverless
export default async function handler(req: any, res: any) {
  // Add CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Initialize app if not already done
  if (!appPromise) {
    console.log('🚀 Initializing Express app for serverless...');
    appPromise = createApp();
  }
  
  try {
    const app = await appPromise;
    console.log(`📡 ${req.method} ${req.url}`);
    return app(req, res);
  } catch (error) {
    console.error('❌ Handler error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  createApp().then((app) => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}
