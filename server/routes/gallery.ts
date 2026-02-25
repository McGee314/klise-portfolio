import express from 'express';
import db from '../db';
import { authenticateToken } from '../middleware/auth';

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

// Create gallery item (Protected)
router.post('/', authenticateToken, (req, res) => {
  const { title, image, category } = req.body;
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
    db.prepare('DELETE FROM gallery WHERE id = ?').run(id);
    res.json({ message: 'Gallery item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting gallery item' });
  }
});

export default router;
