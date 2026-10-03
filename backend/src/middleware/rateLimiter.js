import { sendError } from '../utils/responseHandler.js';

/**
 * Creates an in-memory sliding window rate limiter middleware.
 *
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum allowed requests in the window
 * @param {string} options.message - Error message when rate limit is exceeded
 * @param {Function} [options.keyGenerator] - Custom key generator function
 */
export const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 20,
  message = 'Too many requests, please try again later.',
  keyGenerator,
} = {}) => {
  const requestLogs = new Map();

  const limiter = (req, res, next) => {
    // Determine client key
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const key = keyGenerator ? keyGenerator(req) : `${req.path}:${ip}`;

    const now = Date.now();
    const timestamps = requestLogs.get(key) || [];

    // Filter out timestamps outside the sliding window
    const windowStart = now - windowMs;
    const validTimestamps = timestamps.filter((t) => t > windowStart);

    if (validTimestamps.length >= max) {
      const oldestValid = validTimestamps[0];
      const retryAfterSeconds = Math.ceil((oldestValid + windowMs - now) / 1000);
      res.setHeader('Retry-After', Math.max(retryAfterSeconds, 1));

      return sendError(res, 429, message);
    }

    validTimestamps.push(now);
    requestLogs.set(key, validTimestamps);

    return next();
  };

  limiter.reset = () => {
    requestLogs.clear();
  };

  return limiter;
};

/**
 * Rate limiter for authentication attempts (Login & Registration)
 * Allows up to 20 attempts per 15 minutes per IP.
 */
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts. Please try again later.',
  keyGenerator: (req) => `auth:${req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'}`,
});

/**
 * Rate limiter for sensitive password-change requests
 * Allows up to 10 attempts per 15 minutes per user/IP.
 */
export const passwordChangeLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many password change attempts. Please try again later.',
  keyGenerator: (req) => `pwchange:${req.user?._id || req.user?.id || req.ip || 'client'}`,
});
