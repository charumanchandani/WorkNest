/**
 * Recursively sanitizes objects to remove keys starting with '$' or containing '.'
 * to prevent MongoDB Operator Injection attacks.
 *
 * @param {any} target - Target data to sanitize
 * @returns {any} Sanitized data
 */
export const sanitizeData = (target) => {
  if (!target || typeof target !== 'object') {
    return target;
  }

  if (Array.isArray(target)) {
    return target.map((item) => sanitizeData(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(target)) {
    // Prohibit MongoDB injection keys starting with $ or containing a period
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }

    if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Express middleware to sanitize req.body, req.query, and req.params
 */
export const mongoSanitizer = (req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeData(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeData(req.query);
  }

  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeData(req.params);
  }

  return next();
};
