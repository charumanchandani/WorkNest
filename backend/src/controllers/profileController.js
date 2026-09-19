import profileService from '../services/profileService.js';
import { sendSuccess } from '../utils/responseHandler.js';

/**
 * @desc    Get current user profile
 * @route   GET /api/profile
 * @access  Private (All)
 */
export const getProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getProfile(req.user._id);
    return sendSuccess(res, 200, 'Profile retrieved successfully.', {
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current user profile (whitelisted fields only)
 * @route   PATCH /api/profile
 * @access  Private (All)
 */
export const updateProfile = async (req, res, next) => {
  try {
    const profile = await profileService.updateProfile(req.user._id, req.body);
    return sendSuccess(res, 200, 'Profile updated successfully.', {
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change account password
 * @route   POST /api/profile/change-password
 * @access  Private (All)
 */
export const changePassword = async (req, res, next) => {
  try {
    const result = await profileService.changePassword(req.user._id, req.body, res);
    return sendSuccess(res, 200, result.message || 'Password changed successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get notification preferences
 * @route   GET /api/profile/preferences
 * @access  Private (All)
 */
export const getPreferences = async (req, res, next) => {
  try {
    const preferences = await profileService.getPreferences(req.user._id);
    return sendSuccess(res, 200, 'Notification preferences retrieved.', {
      preferences,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update notification preferences
 * @route   PATCH /api/profile/preferences
 * @access  Private (All)
 */
export const updatePreferences = async (req, res, next) => {
  try {
    const preferences = await profileService.updatePreferences(req.user._id, req.body);
    return sendSuccess(res, 200, 'Notification preferences updated.', {
      preferences,
    });
  } catch (error) {
    next(error);
  }
};
