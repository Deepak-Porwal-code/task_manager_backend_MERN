import mongoose from 'mongoose';

let mongoServer;
let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoServer;
  }

  try {
    const useMemoryDB = process.env.USE_MEMORY_DB === 'true';
    let uri = process.env.MONGODB_URI;

    if (useMemoryDB) {
      console.log('🔄 Starting in-memory MongoDB...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      console.log('✅ In-memory MongoDB started');
    }

    if (!uri) {
      console.warn('⚠️  MONGODB_URI not configured');
      return null;
    }

    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    };

    const conn = await mongoose.connect(uri, options);
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
    });

    return mongoServer;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    isConnected = false;
    return null;
  }
};

export const getConnectionStatus = () => isConnected;

export default connectDB;
