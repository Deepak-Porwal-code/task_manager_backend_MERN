import express from 'express';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});

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

    res.json({
      message: 'Database seeded successfully!',
      users: [
        { username: 'john', password: 'password123' },
        { username: 'jane', password: 'password123' }
      ]
    });
  } catch (error) {
    next(error);
  }
});

export default router;
