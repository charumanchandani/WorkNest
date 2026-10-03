import { ENV } from '../config/env.js';
import { sendError } from '../utils/responseHandler.js';

export const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose CastError (e.g. malformed ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for resource identifier '${err.path}': '${err.value}'`;
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const validationErrors = Object.values(err.errors || {}).map((e) => e.message);
    message = validationErrors.length > 0 ? validationErrors.join(', ') : 'Validation error';
  }

  // Handle MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const fields = Object.keys(err.keyValue || {});
    message = fields.length > 0
      ? `A resource with the specified ${fields.join(', ')} already exists.`
      : 'Resource already exists with duplicate values.';
  }

  // Safe message in production for 500 Internal Server Errors
  if (statusCode === 500 && ENV.NODE_ENV === 'production') {
    message = 'An unexpected internal server error occurred.';
  }

  const errors = ENV.NODE_ENV === 'development' ? { stack: err.stack } : null;

  if (ENV.NODE_ENV !== 'test') {
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);
  }

  return sendError(res, statusCode, message, errors);
};

