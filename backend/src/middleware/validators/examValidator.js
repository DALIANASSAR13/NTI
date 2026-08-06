const { body, param } = require('express-validator');
const { handleValidationErrors } = require('./validationHelper');

const validateCreateExam = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Exam title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),

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

  body('availableFrom')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date')
    .toDate(),

  body('availableTo')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .toDate()
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.availableFrom)) {
        throw new Error('End date must be after the start date');
      }
      return true;
    }),

  body('durationInMinutes')
    .notEmpty()
    .withMessage('Duration is required')
    .isInt({ min: 1, max: 300 })
    .withMessage('Duration must be between 1 and 300 minutes')
    .toInt(),

  body('questionPool')
    .isArray({ min: 1 })
    .withMessage('Question pool must be a non-empty array'),

  body('questionPool.*')
    .isMongoId()
    .withMessage('Each question pool entry must be a valid ID'),

  body('questionsToAsk')
    .notEmpty()
    .withMessage('Number of questions to ask is required')
    .isInt({ min: 1 })
    .withMessage('Must ask at least 1 question')
    .toInt()
    .custom((value, { req }) => {
      if (req.body.questionPool && value > req.body.questionPool.length) {
        throw new Error(
          'Questions to ask cannot exceed the number of questions in the pool'
        );
      }
      return true;
    }),

  handleValidationErrors,
];

const validateExamId = [
  param('id').isMongoId().withMessage('Invalid exam ID'),
  handleValidationErrors,
];

const validateUpdateExam = [
  param('id').isMongoId().withMessage('Invalid exam ID'),

  body('availableFrom')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date')
    .toDate(),

  body('availableTo')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .toDate(),

  body('durationInMinutes')
    .optional()
    .isInt({ min: 1, max: 300 })
    .withMessage('Duration must be between 1 and 300 minutes')
    .toInt(),

  body('questionPool')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Question pool must be a non-empty array'),

  body('questionPool.*')
    .optional()
    .isMongoId()
    .withMessage('Each question pool entry must be a valid ID'),

  body('questionsToAsk')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Must ask at least 1 question')
    .toInt(),

  handleValidationErrors,
];

module.exports = { validateCreateExam, validateExamId, validateUpdateExam };
