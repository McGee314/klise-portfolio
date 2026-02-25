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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Serve uploaded files
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  // Initialize Database
  initializeDatabase();

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
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  return app;
}

let app: any;

// Initialize the app
async function initApp() {
  if (!app) {
    app = await startServer();
  }
  return app;
}

// Export for Vercel
export default async function handler(req: any, res: any) {
  const server = await initApp();
  return server(req, res);
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  initApp().then((server) => {
    server.listen(3000, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:3000`);
    });
  });
}
