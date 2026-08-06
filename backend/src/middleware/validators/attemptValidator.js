const { body, param } = require('express-validator');
const { handleValidationErrors } = require('./validationHelper');

const validateStartAttempt = [
  body('examId')
    .notEmpty()
    .withMessage('Exam ID is required')
    .isMongoId()
    .withMessage('Invalid exam ID'),

  handleValidationErrors,
];

const validateSubmitAttempt = [
  (req, res, next) => {
    console.log("Incoming submitAttempt body:", JSON.stringify(req.body, null, 2));
    next();
  },
  body('attemptId')
    .notEmpty()
    .withMessage('Attempt ID is required')
    .isMongoId()
    .withMessage('Invalid attempt ID'),

  body('answers')
    .isArray({ min: 0 })
    .withMessage('Answers must be an array'),

  body('answers.*.questionId')
    .notEmpty()
    .withMessage('Each answer must have a questionId')
    .isMongoId()
    .withMessage('Invalid question ID in answers'),

  body('answers.*.selectedOption')
    .notEmpty()
    .withMessage('Each answer must have a selectedOption')
    .isString()
    .withMessage('Selected option must be a string')
    .trim(),

  handleValidationErrors,
];

const validateAttemptId = [
  param('id').isMongoId().withMessage('Invalid attempt ID'),
  handleValidationErrors,
];

module.exports = { validateStartAttempt, validateSubmitAttempt, validateAttemptId };
