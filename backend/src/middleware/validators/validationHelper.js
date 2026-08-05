const { validationResult } = require('express-validator');


const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((err) => err.msg);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: messages,
    });
  }
  next();
};

module.exports = { handleValidationErrors };
