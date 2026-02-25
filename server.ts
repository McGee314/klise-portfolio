import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============= DATABASE SETUP =============

let mongoClient: MongoClient | null = null;
let mongoDB: any = null;

async function connectMongoDB() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not found');
    mongoClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    });
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

// ============= AUTH MIDDLEWARE =============

const JWT_SECRET = process.env.JWT_SECRET || 'klise-super-secret-key';

function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    (req as any).user = user;
    next();
  });
}

// ============= MULTER (memory storage for serverless) =============

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Helper: convert uploaded file buffer to base64 data URI
function fileToDataUri(file: Express.Multer.File): string {
  return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
}

// Helper: store image - saves to MongoDB GridFS-like collection or returns data URI
async function storeImage(file: Express.Multer.File): Promise<string> {
  if (mongoDB) {
    // Store in MongoDB images collection
    const result = await mongoDB.collection('images').insertOne({
      filename: file.originalname,
      mimetype: file.mimetype,
      data: file.buffer.toString('base64'),
      createdAt: new Date()
    });
    return `/api/images/${result.insertedId.toString()}`;
  }
  return fileToDataUri(file);
}

// ============= AUTH ROUTES =============

const authRouter = express.Router();

// Fallback admin credentials (used when MongoDB is unavailable)
const FALLBACK_ADMIN = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'admin123',
  role: 'admin',
  id: 'admin'
};

authRouter.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Try MongoDB first
    if (mongoDB) {
      const user: any = await mongoDB.collection('users').findOne({ username });
      if (user && bcrypt.compareSync(password, user.password)) {
        const userId = user._id.toString();
        const token = jwt.sign(
          { id: userId, username: user.username, role: user.role },
          JWT_SECRET, { expiresIn: '24h' }
        );
        return res.json({ token, user: { id: userId, username: user.username, role: user.role } });
      }
      // User found but wrong password, or user not found
      if (user) return res.status(401).json({ message: 'Invalid credentials' });
      // User not found in MongoDB, fall through to fallback check
    }

    // Fallback: check against env/hardcoded admin
    if (username === FALLBACK_ADMIN.username && password === FALLBACK_ADMIN.password) {
      const token = jwt.sign(
        { id: FALLBACK_ADMIN.id, username: FALLBACK_ADMIN.username, role: FALLBACK_ADMIN.role },
        JWT_SECRET, { expiresIn: '24h' }
      );
      // If MongoDB is available, also create the user there
      if (mongoDB) {
        try {
          await mongoDB.collection('users').updateOne(
            { username: FALLBACK_ADMIN.username },
            { $setOnInsert: { username: FALLBACK_ADMIN.username, password: bcrypt.hashSync(FALLBACK_ADMIN.password, 10), role: 'admin', createdAt: new Date() } },
            { upsert: true }
          );
        } catch (_) {}
      }
      return res.json({ token, user: { id: FALLBACK_ADMIN.id, username: FALLBACK_ADMIN.username, role: FALLBACK_ADMIN.role } });
    }

    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ============= ACTIVITIES ROUTES (full CRUD) =============

const activityRouter = express.Router();

// GET all
activityRouter.get('/', async (_req, res) => {
  try {
    if (!mongoDB) return res.json([]);
    const activities = await mongoDB.collection('activities').find({}).sort({ date: -1 }).toArray();
    // Map _id to id for frontend compatibility
    const mapped = activities.map((a: any) => ({ ...a, id: a._id.toString() }));
    res.json(mapped);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create
activityRouter.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, description, date, category } = req.body;
    let image = req.body.image || '';

    if (req.file) {
      image = await storeImage(req.file);
    }

    if (!mongoDB) return res.status(500).json({ message: 'Database not connected' });

    const result = await mongoDB.collection('activities').insertOne({
      title, description, date, image, category,
      createdAt: new Date()
    });

    res.status(201).json({
      id: result.insertedId.toString(),
      title, description, date, image, category
    });
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ message: 'Error creating activity' });
  }
});

// PUT update
activityRouter.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, category } = req.body;
    let image = req.body.image;

    if (req.file) {
      image = await storeImage(req.file);
    }

    if (!mongoDB) return res.status(500).json({ message: 'Database not connected' });

    const updateData: any = { title, description, date, category, updatedAt: new Date() };
    if (image) updateData.image = image;

    await mongoDB.collection('activities').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    res.json({ id, title, description, date, image, category });
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ message: 'Error updating activity' });
  }
});

// DELETE
activityRouter.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoDB) return res.status(500).json({ message: 'Database not connected' });
    await mongoDB.collection('activities').deleteOne({ _id: new ObjectId(id) });
    res.json({ message: 'Activity deleted' });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ message: 'Error deleting activity' });
  }
});

// ============= GALLERY ROUTES (full CRUD) =============

const galleryRouter = express.Router();

// GET all
galleryRouter.get('/', async (_req, res) => {
  try {
    if (!mongoDB) return res.json([]);
    const gallery = await mongoDB.collection('gallery').find({}).sort({ createdAt: -1 }).toArray();
    const mapped = gallery.map((g: any) => ({ ...g, id: g._id.toString() }));
    res.json(mapped);
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create
galleryRouter.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, category } = req.body;
    let image = req.body.image || '';

    if (req.file) {
      image = await storeImage(req.file);
    }

    if (!image) {
      return res.status(400).json({ message: 'Image is required' });
    }

    if (!mongoDB) return res.status(500).json({ message: 'Database not connected' });

    const result = await mongoDB.collection('gallery').insertOne({
      title, image, category,
      createdAt: new Date()
    });

    res.status(201).json({
      id: result.insertedId.toString(),
      title, image, category
    });
  } catch (error) {
    console.error('Error creating gallery item:', error);
    res.status(500).json({ message: 'Error creating gallery item' });
  }
});

// DELETE
galleryRouter.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoDB) return res.status(500).json({ message: 'Database not connected' });
    await mongoDB.collection('gallery').deleteOne({ _id: new ObjectId(id) });
    res.json({ message: 'Gallery item deleted' });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    res.status(500).json({ message: 'Error deleting gallery item' });
  }
});

// ============= CONTENT ROUTES (full CRUD) =============

const contentRouter = express.Router();

// GET all content
contentRouter.get('/', async (_req, res) => {
  try {
    if (!mongoDB) return res.json({});
    const content = await mongoDB.collection('site_content').find({}).toArray();
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

// PUT update text content
contentRouter.put('/text', authenticateToken, async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!mongoDB) return res.status(500).json({ message: 'Database not connected' });
    await mongoDB.collection('site_content').updateOne(
      { key },
      { $set: { value, updatedAt: new Date() } },
      { upsert: true }
    );
    res.json({ key, value });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ message: 'Error updating content' });
  }
});

// PUT update image content
contentRouter.put('/image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { key } = req.body;
    let newImage = req.body.image;

    if (req.file) {
      newImage = await storeImage(req.file);
    }

    if (!newImage) {
      return res.status(400).json({ message: 'No image provided' });
    }

    if (!mongoDB) return res.status(500).json({ message: 'Database not connected' });

    await mongoDB.collection('site_content').updateOne(
      { key },
      { $set: { value: newImage, type: 'image', updatedAt: new Date() } },
      { upsert: true }
    );
    res.json({ key, value: newImage });
  } catch (error) {
    console.error('Error updating image content:', error);
    res.status(500).json({ message: 'Error updating image content' });
  }
});

// ============= IMAGE SERVING ROUTE =============

const imageRouter = express.Router();

imageRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoDB) return res.status(404).json({ message: 'Not found' });

    const image = await mongoDB.collection('images').findOne({ _id: new ObjectId(id) });
    if (!image) return res.status(404).json({ message: 'Image not found' });

    const buffer = Buffer.from(image.data, 'base64');
    res.set('Content-Type', image.mimetype);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(buffer);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ message: 'Error serving image' });
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
    await connectMongoDB();
  } catch (error) {
    console.error('❌ DB init failed:', error);
  }

  // API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/activities', activityRouter);
  app.use('/api/gallery', galleryRouter);
  app.use('/api/content', contentRouter);
  app.use('/api/images', imageRouter);

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
