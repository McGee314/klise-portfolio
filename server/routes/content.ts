import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from '../db';
import { authenticateToken } from '../middleware/auth';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, '../../uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = express.Router();

// Get all site content (public)
router.get('/', (_req, res) => {
  try {
    const items = db.prepare('SELECT * FROM site_content').all() as any[];
    // Convert to key-value map
    const content: Record<string, string> = {};
    items.forEach((item) => {
      content[item.key] = item.value;
    });
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching content' });
  }
});

// Update text content (Protected)
router.put('/text', authenticateToken, (req, res) => {
  const { key, value } = req.body;
  try {
    const existing = db.prepare('SELECT * FROM site_content WHERE key = ?').get(key);
    if (existing) {
      db.prepare('UPDATE site_content SET value = ? WHERE key = ?').run(value, key);
    } else {
      db.prepare('INSERT INTO site_content (key, value, type) VALUES (?, ?, ?)').run(key, value, 'text');
    }
    res.json({ key, value });
  } catch (error) {
    res.status(500).json({ message: 'Error updating content' });
  }
});

// Update image content (Protected) - with file upload
router.put('/image', authenticateToken, upload.single('image'), (req, res) => {
  const { key } = req.body;
  if (!req.file) {
    return res.status(400).json({ message: 'No image file provided' });
  }

  const newImage = `/uploads/${req.file.filename}`;

  try {
    // Delete old uploaded image if exists
    const existing = db.prepare('SELECT value FROM site_content WHERE key = ?').get(key) as any;
    if (existing && existing.value && existing.value.startsWith('/uploads/')) {
      const oldPath = path.join(uploadsDir, path.basename(existing.value));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const existingRow = db.prepare('SELECT * FROM site_content WHERE key = ?').get(key);
    if (existingRow) {
      db.prepare('UPDATE site_content SET value = ? WHERE key = ?').run(newImage, key);
    } else {
      db.prepare('INSERT INTO site_content (key, value, type) VALUES (?, ?, ?)').run(key, newImage, 'image');
    }
    res.json({ key, value: newImage });
  } catch (error) {
    res.status(500).json({ message: 'Error updating image' });
  }
});

export default router;
