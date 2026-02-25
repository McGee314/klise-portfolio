import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('klise.db');

export function initializeDatabase() {
  // Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin'
    )
  `);

  // Activities Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      image TEXT NOT NULL,
      category TEXT NOT NULL
    )
  `);

  // Gallery Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      image TEXT NOT NULL,
      category TEXT NOT NULL
    )
  `);

  // Site Content Table (for editable homepage content)
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      type TEXT DEFAULT 'text'
    )
  `);

  // Seed default site content if not exists
  const contentExists = db.prepare('SELECT COUNT(*) as count FROM site_content').get() as any;
  if (contentExists.count === 0) {
    const defaultContent = [
      { key: 'hero_image', value: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2070&auto=format&fit=crop', type: 'image' },
      { key: 'hero_title', value: 'KLISE', type: 'text' },
      { key: 'hero_subtitle', value: 'Photography and Cinematography Community', type: 'text' },
      { key: 'intro_title', value: 'Capturing Life in Motion', type: 'text' },
      { key: 'intro_description', value: "KLISE is more than just a club; it's a collective of visionaries, storytellers, and artists. We believe that every frame holds a story waiting to be told. Whether through the lens of a camera or the motion of film, we strive to capture the essence of the world around us.", type: 'text' },
      { key: 'intro_image', value: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop', type: 'image' },
    ];
    const insertStmt = db.prepare('INSERT INTO site_content (key, value, type) VALUES (?, ?, ?)');
    for (const item of defaultContent) {
      insertStmt.run(item.key, item.value, item.type);
    }
    console.log('Default site content created');
  }

  // Seed Admin User if not exists
  const admin = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
  if (!admin) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('admin', hashedPassword);
    console.log('Admin user created: admin / admin123');
  }
}

export default db;
