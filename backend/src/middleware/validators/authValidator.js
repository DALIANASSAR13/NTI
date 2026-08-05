const { body } = require('express-validator');
const { handleValidationErrors } = require('./validationHelper');

const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['teacher', 'student'])
    .withMessage('Role must be either teacher or student'),

  body('specialization')
    .trim()
    .notEmpty()
    .withMessage('Specialization is required'),

  body('level')
    .notEmpty()
    .withMessage('Level is required')
    .isInt({ min: 1, max: 4 })
    .withMessage('Level must be an integer between 1 and 4')
    .toInt(),

  handleValidationErrors,
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password').notEmpty().withMessage('Password is required'),

  handleValidationErrors,
];

module.exports = { validateRegister, validateLogin };
