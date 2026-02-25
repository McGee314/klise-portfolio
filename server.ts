import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============= DATABASE SETUP =============

let mongoClient: MongoClient | null = null;
let mongoDB: any = null;

let inMemoryDB: {
  users: Array<{id: number, username: string, password: string, role: string}>;
  activities: Array<{id: number, title: string, description: string, date: string, image: string, category: string}>;
  gallery: Array<{id: number, title: string, image: string, category?: string}>;
  site_content: Array<{id: number, key: string, value: string, type: string}>;
} = { users: [], activities: [], gallery: [], site_content: [] };

let userIdCounter = 1;
let activityIdCounter = 1;
let galleryIdCounter = 1;
let contentIdCounter = 1;

async function connectMongoDB() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not found');

    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    mongoDB = mongoClient.db(process.env.DB_NAME || 'klise_porto');
    console.log('✅ MongoDB connected');
    await initializeMongoData();
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    return false;
  }
}

async function initializeMongoData() {
  if (!mongoDB) return;
  try {
    const usersCol = mongoDB.collection('users');
    if (!(await usersCol.findOne({ username: 'admin' }))) {
      await usersCol.insertOne({
        username: 'admin',
        password: bcrypt.hashSync('admin123', 10),
        role: 'admin',
        createdAt: new Date()
      });
      console.log('👤 Default admin created');
    }

    const contentCol = mongoDB.collection('site_content');
    if (!(await contentCol.findOne({}))) {
      await contentCol.insertMany([
        { key: 'hero_image', value: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2070&auto=format&fit=crop', type: 'image' },
        { key: 'hero_title', value: 'KLISE', type: 'text' },
        { key: 'hero_subtitle', value: 'Photography and Cinematography Community', type: 'text' },
        { key: 'intro_title', value: 'Capturing Life in Motion', type: 'text' },
        { key: 'intro_description', value: "KLISE is more than just a club; it's a collective of visionaries, storytellers, and artists.", type: 'text' },
        { key: 'intro_image', value: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop', type: 'image' },
      ]);
      console.log('📝 Default content created');
    }
  } catch (error) {
    console.error('Error initializing MongoDB data:', error);
  }
}

function initializeInMemoryDB() {
  inMemoryDB = { users: [], activities: [], gallery: [], site_content: [] };
  userIdCounter = activityIdCounter = galleryIdCounter = contentIdCounter = 1;

  inMemoryDB.users.push({
    id: userIdCounter++, username: 'admin',
    password: bcrypt.hashSync('admin123', 10), role: 'admin'
  });

  [
    { key: 'hero_image', value: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2070&auto=format&fit=crop', type: 'image' },
    { key: 'hero_title', value: 'KLISE', type: 'text' },
    { key: 'hero_subtitle', value: 'Photography and Cinematography Community', type: 'text' },
    { key: 'intro_title', value: 'Capturing Life in Motion', type: 'text' },
    { key: 'intro_description', value: "KLISE is more than just a club.", type: 'text' },
    { key: 'intro_image', value: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop', type: 'image' },
  ].forEach(item => {
    inMemoryDB.site_content.push({ id: contentIdCounter++, ...item });
  });

  console.log('✅ In-memory database initialized');
}

// ============= ROUTES =============

const JWT_SECRET = process.env.JWT_SECRET || 'klise-super-secret-key';

const authRouter = express.Router();
authRouter.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user: any = mongoDB
      ? await mongoDB.collection('users').findOne({ username })
      : inMemoryDB.users.find(u => u.username === username);

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userId = (user._id?.toString() || user.id).toString();
    const token = jwt.sign(
      { id: userId, username: user.username, role: user.role },
      JWT_SECRET, { expiresIn: '24h' }
    );
    res.json({ token, user: { id: userId, username: user.username, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

const activityRouter = express.Router();
activityRouter.get('/', async (_req, res) => {
  try {
    const activities = mongoDB
      ? await mongoDB.collection('activities').find({}).sort({ createdAt: -1 }).toArray()
      : inMemoryDB.activities;
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

const galleryRouter = express.Router();
galleryRouter.get('/', async (_req, res) => {
  try {
    const gallery = mongoDB
      ? await mongoDB.collection('gallery').find({}).sort({ createdAt: -1 }).toArray()
      : inMemoryDB.gallery;
    res.json(gallery);
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

const contentRouter = express.Router();
contentRouter.get('/', async (_req, res) => {
  try {
    const content = mongoDB
      ? await mongoDB.collection('site_content').find({}).toArray()
      : inMemoryDB.site_content;
    const contentObj = content.reduce((acc: any, item: any) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
    res.json(contentObj);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= APP SETUP =============

async function createApp() {
  const app = express();

  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));
  app.use(express.json());

  // Initialize Database
  try {
    if (process.env.MONGODB_URI) {
      const connected = await connectMongoDB();
      if (!connected) initializeInMemoryDB();
    } else {
      initializeInMemoryDB();
    }
  } catch (error) {
    console.error('❌ DB init failed:', error);
    initializeInMemoryDB();
  }

  // API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/activities', activityRouter);
  app.use('/api/gallery', galleryRouter);
  app.use('/api/content', contentRouter);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', database: mongoDB ? 'MongoDB' : 'In-Memory', timestamp: new Date().toISOString() });
  });

  return app;
}

// ============= VERCEL SERVERLESS HANDLER =============

let appPromise: Promise<express.Express> | null = null;

export default async function handler(req: any, res: any) {
  if (!appPromise) {
    console.log('🚀 Initializing serverless app...');
    appPromise = createApp();
  }

  try {
    const app = await appPromise;
    return app(req, res);
  } catch (error) {
    console.error('❌ Handler error:', error);
    appPromise = null; // reset so next invocation retries
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// ============= LOCAL DEVELOPMENT =============

if (process.env.NODE_ENV !== 'production') {
  (async () => {
    const app = await createApp();

    // Only import vite in development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🔗 Database: ${mongoDB ? 'MongoDB' : 'In-Memory'}`);
    });
  })().catch(err => {
    console.error('❌ Failed to start:', err);
    process.exit(1);
  });
}
