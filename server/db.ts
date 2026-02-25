import bcrypt from 'bcryptjs';

// Serverless-compatible storage
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

// Auto-increment counters
let userIdCounter = 1;
let activityIdCounter = 1;
let galleryIdCounter = 1;
let contentIdCounter = 1;

// Database interface that mimics SQLite
const db = {
  prepare: (sql: string) => {
    return {
      run: (...params: any[]) => {
        // Simulate SQL operations with in-memory arrays
        if (sql.includes('INSERT INTO users')) {
          const [username, password, role] = params;
          const newUser = { id: userIdCounter++, username, password, role: role || 'admin' };
          inMemoryDB.users.push(newUser);
          return { lastInsertRowid: newUser.id };
        }
        else if (sql.includes('INSERT INTO activities')) {
          const [title, description, date, image, category] = params;
          const newActivity = { id: activityIdCounter++, title, description, date, image, category };
          inMemoryDB.activities.push(newActivity);
          return { lastInsertRowid: newActivity.id };
        }
        else if (sql.includes('INSERT INTO gallery')) {
          const [title, image, category] = params;
          const newItem = { id: galleryIdCounter++, title, image, category };
          inMemoryDB.gallery.push(newItem);
          return { lastInsertRowid: newItem.id };
        }
        else if (sql.includes('INSERT INTO site_content')) {
          const [key, value, type] = params;
          const newContent = { id: contentIdCounter++, key, value, type };
          inMemoryDB.site_content.push(newContent);
          return { lastInsertRowid: newContent.id };
        }
        else if (sql.includes('DELETE FROM activities WHERE id')) {
          const id = params[0];
          inMemoryDB.activities = inMemoryDB.activities.filter(a => a.id != id);
          return { changes: 1 };
        }
        else if (sql.includes('DELETE FROM gallery WHERE id')) {
          const id = params[0];
          inMemoryDB.gallery = inMemoryDB.gallery.filter(g => g.id != id);
          return { changes: 1 };
        }
        else if (sql.includes('UPDATE activities')) {
          const [title, description, date, image, category, id] = params;
          const activity = inMemoryDB.activities.find(a => a.id == id);
          if (activity) {
            activity.title = title;
            activity.description = description;
            activity.date = date;
            activity.image = image;
            activity.category = category;
          }
          return { changes: 1 };
        }
        else if (sql.includes('UPDATE site_content SET value')) {
          const [value, key] = params;
          const content = inMemoryDB.site_content.find(c => c.key === key);
          if (content) {
            content.value = value;
          }
          return { changes: 1 };
        }
        return { lastInsertRowid: 0, changes: 0 };
      },
      get: (param?: any) => {
        if (sql.includes('SELECT * FROM users WHERE username')) {
          return inMemoryDB.users.find(u => u.username === param);
        }
        else if (sql.includes('SELECT image FROM activities WHERE id')) {
          const activity = inMemoryDB.activities.find(a => a.id == param);
          return activity ? { image: activity.image } : null;
        }
        else if (sql.includes('SELECT image FROM gallery WHERE id')) {
          const item = inMemoryDB.gallery.find(g => g.id == param);
          return item ? { image: item.image } : null;
        }
        else if (sql.includes('SELECT value FROM site_content WHERE key')) {
          const content = inMemoryDB.site_content.find(c => c.key === param);
          return content ? { value: content.value } : null;
        }
        else if (sql.includes('SELECT * FROM site_content WHERE key')) {
          return inMemoryDB.site_content.find(c => c.key === param);
        }
        return null;
      },
      all: () => {
        if (sql.includes('SELECT * FROM activities')) {
          return inMemoryDB.activities;
        }
        else if (sql.includes('SELECT * FROM gallery')) {
          return inMemoryDB.gallery;
        }
        else if (sql.includes('SELECT * FROM site_content')) {
          return inMemoryDB.site_content;
        }
        return [];
      }
    };
  },
  exec: (sql: string) => {
    // Handle CREATE TABLE statements - no-op since we use in-memory arrays
    return;
  }
};

export function initializeDatabase() {
  // Reset in-memory database for fresh state
  inMemoryDB = {
    users: [],
    activities: [],
    gallery: [],
    site_content: []
  };

  // Reset counters
  userIdCounter = 1;
  activityIdCounter = 1;
  galleryIdCounter = 1;
  contentIdCounter = 1;

  // Create default admin user
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  inMemoryDB.users.push({
    id: userIdCounter++,
    username: 'admin',
    password: hashedPassword,
    role: 'admin'
  });

  // Insert default site content
  const defaultContent = [
    { key: 'hero_image', value: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2070&auto=format&fit=crop', type: 'image' },
    { key: 'hero_title', value: 'KLISE', type: 'text' },
    { key: 'hero_subtitle', value: 'Photography and Cinematography Community', type: 'text' },
    { key: 'intro_title', value: 'Capturing Life in Motion', type: 'text' },
    { key: 'intro_description', value: "KLISE is more than just a club; it's a collective of visionaries, storytellers, and artists. We believe that every frame holds a story waiting to be told. Whether through the lens of a camera or the motion of film, we strive to capture the essence of the world around us.", type: 'text' },
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

  // Add sample activities
  inMemoryDB.activities.push(
    {
      id: activityIdCounter++,
      title: 'Photography Workshop',
      description: 'Learn advanced photography techniques with KLISE',
      date: '2026-03-15',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      category: 'workshop'
    },
    {
      id: activityIdCounter++,
      title: 'Portrait Session',
      description: 'Professional portrait photography session',
      date: '2026-03-20',
      image: 'https://images.unsplash.com/photo-1554048612-b6ebae92138d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      category: 'portrait'
    }
  );

  // Add sample gallery items
  inMemoryDB.gallery.push(
    {
      id: galleryIdCounter++,
      title: 'Urban Photography',
      image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      category: 'urban'
    },
    {
      id: galleryIdCounter++,
      title: 'Portrait Collection',
      image: 'https://images.unsplash.com/photo-1554048612-b6ebae92138d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      category: 'portrait'
    }
  );

  console.log('✅ In-memory database initialized with default data');
}

export default db;
