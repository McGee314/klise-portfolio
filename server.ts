import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============= DATABASE SETUP =============

// MongoDB connection
let mongoClient: MongoClient | null = null;
let mongoDB: any = null;

// In-memory fallback database
let inMemoryDB: {
  users: Array<{id: number, username: string, password: string, role: string}>;
  activities: Array<{id: number, title: string, description: string, date: string, image: string, category: string}>;
  gallery: Array<{id: number, title: string, image: string, category?: string}>;
  site_content: Array<{id: number, key: string, value: string, type: string}>;
} = {
  users: [],
  activities: [],
  gallery: [],
  site_content: []
};

let userIdCounter = 1;
let activityIdCounter = 1;
let galleryIdCounter = 1;
let contentIdCounter = 1;

async function connectMongoDB() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI not found');
    }

    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    
    const dbName = process.env.DB_NAME || 'klise_porto';
    mongoDB = mongoClient.db(dbName);
    
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
    const usersCollection = mongoDB.collection('users');
    const existingAdmin = await usersCollection.findOne({ username: 'admin' });
    
    if (!existingAdmin) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      await usersCollection.insertOne({
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date()
      });
      console.log('👤 Default admin user created in MongoDB');
    }

    const contentCollection = mongoDB.collection('site_content');
    const existingContent = await contentCollection.findOne({});
    
    if (!existingContent) {
      const defaultContent = [
        { key: 'hero_image', value: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2070&auto=format&fit=crop', type: 'image' },
        { key: 'hero_title', value: 'KLISE', type: 'text' },
        { key: 'hero_subtitle', value: 'Photography and Cinematography Community', type: 'text' },
        { key: 'intro_title', value: 'Capturing Life in Motion', type: 'text' },
        { key: 'intro_description', value: "KLISE is more than just a club; it's a collective of visionaries, storytellers, and artists. We believe that every frame holds a story waiting to be told. Whether through the lens of a camera or the motion of film, we strive to capture the essence of the world around us.", type: 'text' },
        { key: 'intro_image', value: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop', type: 'image' },
      ];

      await contentCollection.insertMany(defaultContent);
      console.log('📝 Default content created in MongoDB');
    }
  } catch (error) {
    console.error('Error initializing MongoDB data:', error);
  }
}

function initializeInMemoryDB() {
  inMemoryDB = {
    users: [],
    activities: [],
    gallery: [],
    site_content: []
  };

  userIdCounter = 1;
  activityIdCounter = 1;
  galleryIdCounter = 1;
  contentIdCounter = 1;

  const hashedPassword = bcrypt.hashSync('admin123', 10);
  inMemoryDB.users.push({
    id: userIdCounter++,
    username: 'admin',
    password: hashedPassword,
    role: 'admin'
  });

  const defaultContent = [
    { key: 'hero_image', value: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2070&auto=format&fit=crop', type: 'image' },
    { key: 'hero_title', value: 'KLISE', type: 'text' },
    { key: 'hero_subtitle', value: 'Photography and Cinematography Community', type: 'text' },
    { key: 'intro_title', value: 'Capturing Life in Motion', type: 'text' },
    { key: 'intro_description', value: "KLISE is more than just a club; it's a collective of visionaries, storytellers, and artists.", type: 'text' },
    { key: 'intro_image', value: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop', type: 'image' },
  ];

  defaultContent.forEach(item => {
    inMemoryDB.site_content.push({
      id: contentIdCounter++,
      key: item.key,
      value: item.value,
      type: item.type
    });
  });

  console.log('✅ In-memory database initialized');
}

// ============= ROUTES =============

const JWT_SECRET = process.env.JWT_SECRET || 'klise-super-secret-key';

// Auth router
const authRouter = express.Router();

authRouter.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    let user: any = null;

    if (mongoDB) {
      user = await mongoDB.collection('users').findOne({ username });
    } else {
      user = inMemoryDB.users.find(u => u.username === username);
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userId = user._id?.toString() || user.id;
    
    const token = jwt.sign(
      { id: userId, username: user.username, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      user: { id: userId, username: user.username, role: user.role } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Activities router
const activityRouter = express.Router();

activityRouter.get('/', async (req, res) => {
  try {
    let activities;
    
    if (mongoDB) {
      activities = await mongoDB.collection('activities').find({}).sort({ createdAt: -1 }).toArray();
    } else {
      activities = inMemoryDB.activities;
    }

    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Gallery router
const galleryRouter = express.Router();

galleryRouter.get('/', async (req, res) => {
  try {
    let gallery;
    
    if (mongoDB) {
      gallery = await mongoDB.collection('gallery').find({}).sort({ createdAt: -1 }).toArray();
    } else {
      gallery = inMemoryDB.gallery;
    }

    res.json(gallery);
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Content router
const contentRouter = express.Router();

contentRouter.get('/', async (req, res) => {
  try {
    let content;
    
    if (mongoDB) {
      content = await mongoDB.collection('site_content').find({}).toArray();
    } else {
      content = inMemoryDB.site_content;
    }

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

// ============= MAIN APP =============

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

  // Initialize Database
  try {
    console.log('🔗 Attempting to connect to database...');
    
    if (process.env.MONGODB_URI) {
      const mongoConnected = await connectMongoDB();
      if (!mongoConnected) {
        console.log('⚠️ MongoDB failed, using in-memory database');
        initializeInMemoryDB();
      }
    } else {
      console.log('⚠️ No MongoDB URI found, using in-memory database');
      initializeInMemoryDB();
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    initializeInMemoryDB();
  }

  // API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/activities', activityRouter);
  app.use('/api/gallery', galleryRouter);
  app.use('/api/content', contentRouter);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      database: mongoDB ? 'MongoDB' : 'In-Memory',
      timestamp: new Date().toISOString()
    });
  });

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
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong'
    });
  }
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  createApp().then((app) => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`🔗 Database: ${mongoDB ? 'MongoDB' : 'In-Memory'}`);
    });
  }).catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });
}
