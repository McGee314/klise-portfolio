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

// Get all activities
router.get('/', (req, res) => {
  try {
    const activities = db.prepare('SELECT * FROM activities ORDER BY date DESC').all();
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activities' });
  }
});

// Create activity (Protected) - with file upload
router.post('/', authenticateToken, upload.single('image'), (req, res) => {
  const { title, description, date, category } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;
  try {
    const result = db.prepare(
      'INSERT INTO activities (title, description, date, image, category) VALUES (?, ?, ?, ?, ?)'
    ).run(title, description, date, image, category);
    res.status(201).json({ id: result.lastInsertRowid, title, description, date, image, category });
  } catch (error) {
    res.status(500).json({ message: 'Error creating activity' });
  }
});

// Update activity (Protected) - with file upload
router.put('/:id', authenticateToken, upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { title, description, date, category } = req.body;

  // If a new file was uploaded, use it; otherwise keep existing image
  let image = req.body.image;
  if (req.file) {
    image = `/uploads/${req.file.filename}`;
    // Delete old image file if it was an upload
    const existing = db.prepare('SELECT image FROM activities WHERE id = ?').get(id) as any;
    if (existing && existing.image && existing.image.startsWith('/uploads/')) {
      const oldPath = path.join(uploadsDir, path.basename(existing.image));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
  }

  try {
    db.prepare(
      'UPDATE activities SET title = ?, description = ?, date = ?, image = ?, category = ? WHERE id = ?'
    ).run(title, description, date, image, category, id);
    res.json({ id, title, description, date, image, category });
  } catch (error) {
    res.status(500).json({ message: 'Error updating activity' });
  }
});

// Delete activity (Protected)
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  try {
    // Delete associated image file
    const existing = db.prepare('SELECT image FROM activities WHERE id = ?').get(id) as any;
    if (existing && existing.image && existing.image.startsWith('/uploads/')) {
      const filePath = path.join(uploadsDir, path.basename(existing.image));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    db.prepare('DELETE FROM activities WHERE id = ?').run(id);
    res.json({ message: 'Activity deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting activity' });
  }
});

export default router;
