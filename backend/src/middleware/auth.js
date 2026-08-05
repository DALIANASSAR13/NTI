const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const User = require('../models/User');

/**
 * Authentication middleware.
 * Extracts and verifies the JWT from the Authorization header,
 * then attaches the user object to req.user.
 */
const auth = async (req, res, next) => {
  // 1. Extract token from header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Access denied. No token provided.', 401);
  }

  const token = authHeader.split(' ')[1];

  // 2. Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Token has expired. Please log in again.', 401);
    }
    throw new AppError('Invalid token. Access denied.', 401);
  }

  // 3. Check if user still exists (they might have been deleted after token was issued)
  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError('User belonging to this token no longer exists.', 401);
  }

  // 4. Attach user info to request
  req.user = {
    id: user._id,
    role: user.role,
    specialization: user.specialization,
    level: user.level,
    name: user.name,
    email: user.email,
  };

  next();
};

module.exports = auth;
