import mongoose from 'mongoose';
import { ENV } from './env.js';
import { seedDatabase } from '../scripts/seedUsers.js';

let mongoServerInstance = null;

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB] Could not connect to MongoDB at ${ENV.MONGODB_URI} (${error.message})`);
    
    if (ENV.NODE_ENV === 'production') {
      console.error('[MongoDB] Fatal error in production mode.');
      process.exit(1);
    }

    console.log('[MongoDB] Starting embedded in-memory MongoDB database for development...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoServerInstance = await MongoMemoryServer.create();
      const memoryUri = mongoServerInstance.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB] Connected to in-memory MongoDB at: ${memoryUri}`);

      // Automatically seed standard accounts and departments
      await seedDatabase();
      return conn;
    } catch (memError) {
      console.error(`[MongoDB] Failed to initialize in-memory database: ${memError.message}`);
    }
  }
};

