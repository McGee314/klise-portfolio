import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// Import MongoDB connection
import { mongodb } from '../mongodb';
// Keep original db as fallback
import db from '../db';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'klise-super-secret-key';

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    let user: any = null;

    // Try MongoDB first
    if (process.env.MONGODB_URI) {
      console.log('🔍 Searching user in MongoDB...');
      user = await mongodb.findUser(username);
      
      if (user) {
        console.log('✅ User found in MongoDB');
      } else {
        console.log('❌ User not found in MongoDB');
      }
    } else {
      // Fallback to in-memory database 
      console.log('🔍 Searching user in in-memory database...');
      user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // For MongoDB, use _id, for in-memory use id
    const userId = user._id || user.id;
    
    const token = jwt.sign(
      { 
        id: userId.toString(), 
        username: user.username, 
        role: user.role 
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      user: { 
        id: userId.toString(), 
        username: user.username, 
        role: user.role 
      } 
    });
    
    console.log('✅ Login successful for:', username);
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register route (optional, if you need user registration)
router.post('/register', async (req, res) => {
  const { username, password, role = 'user' } = req.body;

  try {
    // Check if user already exists
    let existingUser: any = null;
    
    if (process.env.MONGODB_URI) {
      existingUser = await mongodb.findUser(username);
    } else {
      existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    }

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    if (process.env.MONGODB_URI) {
      const result = await mongodb.createUser({ username, password, role });
      res.status(201).json({ 
        message: 'User created successfully',
        userId: result.insertedId.toString()
      });
    } else {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const result = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(username, hashedPassword, role);
      res.status(201).json({ 
        message: 'User created successfully',
        userId: result.lastInsertRowid
      });
    }

    console.log('✅ User registered successfully:', username);
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;