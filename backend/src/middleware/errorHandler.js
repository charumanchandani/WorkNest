import { ENV } from '../config/env.js';
import { sendError } from '../utils/responseHandler.js';

export const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const errors = ENV.NODE_ENV === 'development' ? { stack: err.stack } : null;

  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  return sendError(res, statusCode, message, errors);
};
