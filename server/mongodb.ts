import { MongoClient, Db, Collection } from 'mongodb';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

class MongoDB {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  // MongoDB connection
  async connect(): Promise<void> {
    try {
      const uri = process.env.MONGODB_URI;
      if (!uri) {
        throw new Error('MONGODB_URI tidak ditemukan di environment variables');
      }

      this.client = new MongoClient(uri);
      await this.client.connect();
      
      const dbName = process.env.DB_NAME || 'klise_porto';
      this.db = this.client.db(dbName);
      
      console.log('✅ Berhasil terkoneksi ke MongoDB');
      
      // Initialize database dengan data default
      await this.initializeDatabase();
      
    } catch (error) {
      console.error('❌ Error koneksi ke MongoDB:', error);
      throw error;
    }
  }

  // Disconnect dari MongoDB
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      console.log('🔌 MongoDB connection tertutup');
    }
  }

  // Get database instance
  getDb(): Db {
    if (!this.db) {
      throw new Error('Database belum terkoneksi');
    }
    return this.db;
  }

  // Get collection
  getCollection(name: string): Collection {
    return this.getDb().collection(name);
  }

  // Initialize database dengan data default
  async initializeDatabase(): Promise<void> {
    try {
      const usersCollection = this.getCollection('users');
      const activitiesCollection = this.getCollection('activities');
      const galleryCollection = this.getCollection('gallery');
      const contentCollection = this.getCollection('site_content');

      // Check apakah admin user sudah ada
      const existingAdmin = await usersCollection.findOne({ username: 'admin' });
      
      if (!existingAdmin) {
        // Create default admin user
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        await usersCollection.insertOne({
          username: 'admin',
          password: hashedPassword,
          role: 'admin',
          createdAt: new Date()
        });
        console.log('👤 Default admin user created');
      }

      // Check apakah site content sudah ada
      const existingContent = await contentCollection.findOne({});
      
      if (!existingContent) {
        // Insert default site content
        const defaultContent = [
          { key: 'hero_image', value: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2070&auto=format&fit=crop', type: 'image' },
          { key: 'hero_title', value: 'KLISE', type: 'text' },
          { key: 'hero_subtitle', value: 'Photography and Cinematography Community', type: 'text' },
          { key: 'intro_title', value: 'Capturing Life in Motion', type: 'text' },
          { key: 'intro_description', value: "KLISE is more than just a club; it's a collective of visionaries, storytellers, and artists. We believe that every frame holds a story waiting to be told. Whether through the lens of a camera or the motion of film, we strive to capture the essence of the world around us.", type: 'text' },
          { key: 'intro_image', value: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop', type: 'image' },
        ];

        await contentCollection.insertMany(defaultContent.map(item => ({
          ...item,
          createdAt: new Date()
        })));
        console.log('📝 Default site content created');
      }

      // Check apakah sample activities sudah ada
      const existingActivities = await activitiesCollection.findOne({});
      
      if (!existingActivities) {
        // Add sample activities
        const sampleActivities = [
          {
            title: 'Photography Workshop',
            description: 'Learn advanced photography techniques with KLISE',
            date: '2026-03-15',
            image: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            category: 'workshop',
            createdAt: new Date()
          },
          {
            title: 'Portrait Session',
            description: 'Professional portrait photography session',
            date: '2026-03-20',
            image: 'https://images.unsplash.com/photo-1554048612-b6ebae92138d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            category: 'portrait',
            createdAt: new Date()
          }
        ];

        await activitiesCollection.insertMany(sampleActivities);
        console.log('🎬 Sample activities created');
      }

      // Check apakah sample gallery sudah ada
      const existingGallery = await galleryCollection.findOne({});
      
      if (!existingGallery) {
        // Add sample gallery items
        const sampleGallery = [
          {
            title: 'Urban Photography',
            image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            category: 'urban',
            createdAt: new Date()
          },
          {
            title: 'Portrait Collection',
            image: 'https://images.unsplash.com/photo-1554048612-b6ebae92138d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            category: 'portrait',
            createdAt: new Date()
          }
        ];

        await galleryCollection.insertMany(sampleGallery);
        console.log('🖼️ Sample gallery created');
      }

    } catch (error) {
      console.error('❌ Error initializing database:', error);
    }
  }

  // Helper methods untuk operasi database umum

  // Users operations
  async findUser(username: string) {
    return await this.getCollection('users').findOne({ username });
  }

  async createUser(userData: { username: string, password: string, role?: string }) {
    const hashedPassword = bcrypt.hashSync(userData.password, 10);
    return await this.getCollection('users').insertOne({
      ...userData,
      password: hashedPassword,
      role: userData.role || 'user',
      createdAt: new Date()
    });
  }

  // Activities operations
  async getAllActivities() {
    return await this.getCollection('activities').find({}).sort({ createdAt: -1 }).toArray();
  }

  async createActivity(activityData: any) {
    return await this.getCollection('activities').insertOne({
      ...activityData,
      createdAt: new Date()
    });
  }

  async updateActivity(id: string, activityData: any) {
    const { ObjectId } = require('mongodb');
    return await this.getCollection('activities').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...activityData, updatedAt: new Date() } }
    );
  }

  async deleteActivity(id: string) {
    const { ObjectId } = require('mongodb');
    return await this.getCollection('activities').deleteOne({ _id: new ObjectId(id) });
  }

  // Gallery operations
  async getAllGallery() {
    return await this.getCollection('gallery').find({}).sort({ createdAt: -1 }).toArray();
  }

  async createGalleryItem(galleryData: any) {
    return await this.getCollection('gallery').insertOne({
      ...galleryData,
      createdAt: new Date()
    });
  }

  async deleteGalleryItem(id: string) {
    const { ObjectId } = require('mongodb');
    return await this.getCollection('gallery').deleteOne({ _id: new ObjectId(id) });
  }

  // Content operations
  async getContentByKey(key: string) {
    return await this.getCollection('site_content').findOne({ key });
  }

  async updateContent(key: string, value: string) {
    return await this.getCollection('site_content').updateOne(
      { key },
      { $set: { value, updatedAt: new Date() } },
      { upsert: true }
    );
  }

  async getAllContent() {
    return await this.getCollection('site_content').find({}).toArray();
  }
}

// Export singleton instance
export const mongodb = new MongoDB();
export default mongodb;