import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import { protect } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';

const router = express.Router();

// Register
router.post('/register', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation Error', errors: errors.array() });
    }

    const { email, username, password, full_name } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ 
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken' 
      });
    }

    const user = await User.create({
      email,
      username,
      password,
      fullName: full_name
    });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      access_token: accessToken,
      refresh_token: refreshToken
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation Error', errors: errors.array() });
    }

    const { username, password } = req.body;

    const user = await User.findOne({ username }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      access_token: accessToken,
      refresh_token: refreshToken
    });
  } catch (error) {
    next(error);
  }
});

// Refresh token
router.post('/refresh', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const refreshToken = authHeader.split(' ')[1];
    const decoded = jwt.verify(refreshToken, config.jwtSecret);
    
    const accessToken = generateAccessToken(decoded.id);

    res.json({ access_token: accessToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
  res.json(req.user.toJSON());
});

export default router;
