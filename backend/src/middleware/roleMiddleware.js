import { sendError } from '../utils/responseHandler.js';

/**
 * Reusable Role-Based Authorization Middleware
 * Usage: authorizeRoles('ADMIN'), authorizeRoles('MANAGER', 'ADMIN')
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required.');
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Forbidden: Role '${req.user.role}' is not authorized to access this resource.`
      );
    }

    next();
  };
};

export default authorizeRoles;
