import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || process.env.MONGODB_URI_MONGODB_URI || 'mongodb://localhost:27017/taskmanager',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
};
