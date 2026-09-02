import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { sendTokenResponse, clearTokenCookie } from '../utils/token.js';

/**
 * @desc    Register a new employee
 * @route   POST /api/auth/register
 * @access  Public (Enforces EMPLOYEE role)
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return sendError(res, 400, 'Please provide name, email, and password.');
    }

    if (password.length < 6) {
      return sendError(res, 400, 'Password must be at least 6 characters long.');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check for existing account
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return sendError(res, 400, 'An account with this email already exists.');
    }

    // Public registration strictly assigns EMPLOYEE role
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'EMPLOYEE',
    });

    return sendTokenResponse(user, 201, res, 'Account created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token cookie
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'Please provide both email and password.');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user with password selected
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    if (!user.isActive) {
      return sendError(
        res,
        403,
        'Your account has been deactivated. Please contact an administrator.'
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    return sendTokenResponse(user, 200, res, 'Login successful');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  return sendSuccess(res, 200, 'Current user profile retrieved', {
    user: req.user.toSafeObject(),
  });
};

/**
 * @desc    Log user out & clear cookie
 * @route   POST /api/auth/logout
 * @access  Public / Private
 */
export const logout = async (req, res) => {
  clearTokenCookie(res);
  return sendSuccess(res, 200, 'Logged out successfully');
};
