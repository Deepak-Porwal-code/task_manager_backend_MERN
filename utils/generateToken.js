import jwt from 'jsonwebtoken';
import config from '../config/config.js';

export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtRefreshExpiresIn
  });
};
