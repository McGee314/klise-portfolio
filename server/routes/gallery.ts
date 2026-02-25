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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router = express.Router();

// Get all gallery items
router.get('/', (req, res) => {
  try {
    const items = db.prepare('SELECT * FROM gallery ORDER BY id DESC').all();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gallery' });
  }
});

// Create gallery item (Protected) - with file upload
router.post('/', authenticateToken, upload.single('image'), (req, res) => {
  const { title, category } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;
  try {
    const result = db.prepare(
      'INSERT INTO gallery (title, image, category) VALUES (?, ?, ?)'
    ).run(title, image, category);
    res.status(201).json({ id: result.lastInsertRowid, title, image, category });
  } catch (error) {
    res.status(500).json({ message: 'Error creating gallery item' });
  }
});

// Delete gallery item (Protected)
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  try {
    // Delete associated image file
    const existing = db.prepare('SELECT image FROM gallery WHERE id = ?').get(id) as any;
    if (existing && existing.image && existing.image.startsWith('/uploads/')) {
      const filePath = path.join(uploadsDir, path.basename(existing.image));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    db.prepare('DELETE FROM gallery WHERE id = ?').run(id);
    res.json({ message: 'Gallery item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting gallery item' });
  }
});

export default router;
