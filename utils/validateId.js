import mongoose from 'mongoose';

export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const validateObjectId = (req, res, next, id) => {
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  next();
};
