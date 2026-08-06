const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

/*
 *  Generate a signed JWT for a user.
 *  returns  string Signed JWT token.
*/
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      specialization: user.specialization,
      level: user.level,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

/*
 *  Register a new user.
 *   returns {Object} { user, token }
*/
const register = async (userData) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new AppError('A user with this email already exists.', 409);
  }

  // Create user (password hashing happens in pre-save hook)
  const user = await User.create(userData);

  // Generate token
  const token = generateToken(user);

  return { user, token };
};

/*
 *  Authenticat  by email and password.
 *  returns {Object} { user, token }
*/
const login = async (email, password) => {
  // Find user and explicitly select password (it's excluded by default)
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  // Compare passwords
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  // Generate token
  const token = generateToken(user);

  return { user, token };
};

module.exports = { register, login };
