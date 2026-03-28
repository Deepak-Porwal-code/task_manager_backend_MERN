import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// List all users (for assignee selection)
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find({ isActive: true })
      .select('-password')
      .sort({ username: 1 })
      .lean();

    res.json({
      users: users.map(user => ({
        id: user._id,
        email: user.email,
        username: user.username,
        full_name: user.fullName,
        is_active: user.isActive,
        created_at: user.createdAt
      })),
      total: users.length
    });
  } catch (error) {
    next(error);
  }
});

export default router;
