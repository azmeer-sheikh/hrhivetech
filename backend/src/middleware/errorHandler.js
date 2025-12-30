const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log errors in development mode
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error Details:');
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    console.error('Request:', {
      method: req.method,
      path: req.path,
      body: req.body,
      query: req.query
    });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Invalid ID format';
    error = { message, statusCode: 400 };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `A record with that ${field} already exists`;
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map(val => val.message)
      .join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // Send error response
  const statusCode = error.statusCode || 500;
  const responseMessage = typeof error.message === 'string' 
    ? error.message 
    : Array.isArray(error.message) 
      ? error.message.join(', ')
      : 'Server Error';

  res.status(statusCode).json({
    success: false,
    message: responseMessage,
    ...(process.env.NODE_ENV === 'development' && { error: err })
  });
};

module.exports = errorHandler;
