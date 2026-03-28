import express from 'express';
import cors from 'cors';
import config from './config/config.js';
import connectDB from './config/db-dev.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import userRoutes from './routes/users.js';
import healthRoutes from './routes/health.js';
import seedRoutes from './routes/seed.js';

const app = express();

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = config.port;

// Start server after DB connection
const startServer = async () => {
  try {
    // Wait for DB connection
    await connectDB();
    
    // Then start the server
    app.listen(PORT, () => {
      console.log(`✅ Server running in ${config.nodeEnv} mode on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
