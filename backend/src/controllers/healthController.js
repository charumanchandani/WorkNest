import { sendSuccess } from '../utils/responseHandler.js';
import { ENV } from '../config/env.js';

export const getHealthStatus = (req, res) => {
  return sendSuccess(res, 200, 'WorkNest API is running smoothly', {
    service: 'WorkNest Backend API',
    status: 'healthy',
    environment: ENV.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};
