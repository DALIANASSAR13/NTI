const errorHandler = (err, req, res, next) => {
  
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let isOperational = err.isOperational || false;

  // Mongoose Validation Error 
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join('. ');
    isOperational = true;
  }

  // Mongoose Cast Error 
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    isOperational = true;
  }

  // Mongoose Duplicate Key Error 
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for '${field}'. This ${field} is already in use.`;
    isOperational = true;
  }

  // JWT Errors 
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
    isOperational = true;
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your token has expired. Please log in again.';
    isOperational = true;
  }

  // Log non-operational (unexpected) errors for debugging 
  if (!isOperational) {
    console.error('UNEXPECTED ERROR:', err);
  }

  // Build response 
  const response = {
    success: false,
    message,
  };

  // Include stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
