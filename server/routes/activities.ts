import express from 'express';
import db from '../db';
import { authenticateToken } from '../middleware/auth';

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

// Create activity (Protected)
router.post('/', authenticateToken, (req, res) => {
  const { title, description, date, image, category } = req.body;
  try {
    const result = db.prepare(
      'INSERT INTO activities (title, description, date, image, category) VALUES (?, ?, ?, ?, ?)'
    ).run(title, description, date, image, category);
    res.status(201).json({ id: result.lastInsertRowid, title, description, date, image, category });
  } catch (error) {
    res.status(500).json({ message: 'Error creating activity' });
  }
});

// Update activity (Protected)
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, description, date, image, category } = req.body;
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
    db.prepare('DELETE FROM activities WHERE id = ?').run(id);
    res.json({ message: 'Activity deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting activity' });
  }
});

export default router;
