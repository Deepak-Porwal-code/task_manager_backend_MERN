import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';

dotenv.config();

const seedDatabase = async () => {
  let mongoServer;
  
  try {
    // Try to connect to MongoDB, fallback to in-memory
    let uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanager';
    
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      console.log('MongoDB Connected');
    } catch (error) {
      console.log('Using in-memory MongoDB for seeding...');
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      await mongoose.connect(uri);
      console.log('In-memory MongoDB Connected');
    }

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const user1 = await User.create({
      email: 'john@example.com',
      username: 'john',
      password: 'password123',
      fullName: 'John Doe'
    });

    const user2 = await User.create({
      email: 'jane@example.com',
      username: 'jane',
      password: 'password123',
      fullName: 'Jane Smith'
    });

    console.log('Created users');

    // Create projects
    const project1 = await Project.create({
      name: 'Website Redesign',
      description: 'Complete overhaul of company website',
      owner: user1._id
    });

    const project2 = await Project.create({
      name: 'Mobile App',
      description: 'New mobile application development',
      owner: user1._id
    });

    console.log('Created projects');

    // Create tasks
    await Task.create([
      {
        title: 'Design homepage mockup',
        description: 'Create initial design concepts',
        project: project1._id,
        status: 'done',
        priority: 'high',
        assignee: user1._id,
        estimatedTime: 120,
        actualTime: 150,
        tags: ['design', 'ui']
      },
      {
        title: 'Implement responsive navigation',
        description: 'Build mobile-friendly navigation',
        project: project1._id,
        status: 'in_progress',
        priority: 'high',
        assignee: user2._id,
        estimatedTime: 180,
        actualTime: 90,
        tags: ['frontend', 'css']
      },
      {
        title: 'Setup API endpoints',
        description: 'Create RESTful API structure',
        project: project2._id,
        status: 'todo',
        priority: 'urgent',
        estimatedTime: 240,
        tags: ['backend', 'api']
      },
      {
        title: 'Database schema design',
        description: 'Design MongoDB collections',
        project: project2._id,
        status: 'in_review',
        priority: 'medium',
        assignee: user1._id,
        estimatedTime: 90,
        actualTime: 85,
        tags: ['database', 'design']
      }
    ]);

    console.log('Created tasks');
    console.log('\nSeed data created successfully!');
    console.log('\nTest credentials:');
    console.log('Username: john | Password: password123');
    console.log('Username: jane | Password: password123');
    
    console.log('\n⚠️  Note: Data is in-memory and will be lost when server restarts');
    console.log('To persist data, install MongoDB locally or use MongoDB Atlas');

    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    if (mongoServer) {
      await mongoServer.stop();
    }
    process.exit(1);
  }
};

seedDatabase();
