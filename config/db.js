import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

const connectDB = async () => {
  try {
    // Try to connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log('MongoDB connection failed, using in-memory database...');
    
    // Fallback to in-memory MongoDB
    try {
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      
      const conn = await mongoose.connect(mongoUri);
      console.log(`In-memory MongoDB Connected: ${conn.connection.host}`);
      console.log('⚠️  Using temporary in-memory database. Data will be lost on restart.');
    } catch (memError) {
      console.error(`Failed to start in-memory MongoDB: ${memError.message}`);
      process.exit(1);
    }
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

export default connectDB;
