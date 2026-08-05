const { body, param } = require('express-validator');
const { handleValidationErrors } = require('./validationHelper');

const validateCreateQuestion = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Question text is required')
    .isLength({ min: 3 })
    .withMessage('Question text must be at least 3 characters'),

  body('options')
    .isArray({ min: 2, max: 6 })
    .withMessage('Options must be an array with 2 to 6 items'),

  body('options.*')
    .isString()
    .withMessage('Each option must be a string')
    .trim()
    .notEmpty()
    .withMessage('Options cannot be empty strings'),

  body('correctAnswer')
    .trim()
    .notEmpty()
    .withMessage('Correct answer is required')
    .custom((value, { req }) => {
      if (!req.body.options || !req.body.options.includes(value)) {
        throw new Error('Correct answer must be one of the provided options');
      }
      return true;
    }),

  handleValidationErrors,
];

const validateUpdateQuestion = [
  param('id').isMongoId().withMessage('Invalid question ID'),

  body('text')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Question text cannot be empty')
    .isLength({ min: 3 })
    .withMessage('Question text must be at least 3 characters'),

  body('options')
    .optional()
    .isArray({ min: 2, max: 6 })
    .withMessage('Options must be an array with 2 to 6 items'),

  body('options.*')
    .optional()
    .isString()
    .withMessage('Each option must be a string')
    .trim()
    .notEmpty()
    .withMessage('Options cannot be empty strings'),

  body('correctAnswer')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Correct answer cannot be empty'),

  handleValidationErrors,
];

const validateQuestionId = [
  param('id').isMongoId().withMessage('Invalid question ID'),
  handleValidationErrors,
];

module.exports = {
  validateCreateQuestion,
  validateUpdateQuestion,
  validateQuestionId,
};
