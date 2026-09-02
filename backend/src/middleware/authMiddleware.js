import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import User from '../models/User.js';
import { sendError } from '../utils/responseHandler.js';
import { COOKIE_NAME } from '../utils/token.js';

export const protect = async (req, res, next) => {
  let token;

  // 1. Check HttpOnly cookie first
  if (req.cookies && req.cookies[COOKIE_NAME]) {
    token = req.cookies[COOKIE_NAME];
  }
  // 2. Check Authorization Bearer header as secondary fallback
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 401, 'Authentication required. Please sign in.');
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return sendError(res, 401, 'User associated with this token no longer exists.');
    }

    if (!currentUser.isActive) {
      return sendError(res, 403, 'Your account has been deactivated. Please contact administrator.');
    }

    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 401, 'Invalid authentication token.');
    }
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Session expired. Please sign in again.');
    }
    return sendError(res, 401, 'Authentication failed.');
  }
};

export default protect;
