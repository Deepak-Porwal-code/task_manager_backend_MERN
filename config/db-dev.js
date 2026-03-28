import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

const connectDB = async () => {
  try {
    // Check if we should use in-memory MongoDB
    const useMemoryDB = process.env.USE_MEMORY_DB === 'true';
    
    let uri = process.env.MONGODB_URI;
    
    if (useMemoryDB) {
      console.log('🔄 Starting in-memory MongoDB...');
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      console.log('✅ In-memory MongoDB started');
    }
    
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    return mongoServer;
  } catch (error) {
    // If connection fails, try in-memory as fallback
    if (!mongoServer && process.env.NODE_ENV === 'development') {
      console.log('⚠️  MongoDB connection failed, using in-memory database...');
      try {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        const conn = await mongoose.connect(uri);
        console.log(`✅ In-memory MongoDB Connected: ${conn.connection.host}`);
        console.log('💡 Data will be lost on server restart');
        return mongoServer;
      } catch (fallbackError) {
        console.error(`❌ Fallback failed: ${fallbackError.message}`);
        throw fallbackError;
      }
    }
    
    throw error;
  }
};

export default connectDB;
