import mongoose from 'mongoose';
import User from '../models/User.js';
import activityService from './activityService.js';
import { ACTIVITY_ACTION, ACTIVITY_ENTITY_TYPE } from '../constants/activity.js';
import { generateToken, getCookieOptions, COOKIE_NAME } from '../utils/token.js';

// Phone format regex: optional leading +, parentheses, dashes, spaces, digits (4-25 chars)
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{4,25}$/;

// Disallow HTML tag patterns in input fields
const HTML_TAG_REGEX = /<[^>]*>/;

export const profileService = {
  /**
   * Retrieves safe profile for authenticated user
   */
  async getProfile(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const error = new Error('Invalid user identifier.');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(userId).populate('department');
    if (!user) {
      const error = new Error('User account not found.');
      error.statusCode = 404;
      throw error;
    }

    return user.toSafeObject();
  },

  /**
   * Updates whitelisted personal profile fields
   */
  async updateProfile(userId, updateData = {}) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const error = new Error('Invalid user identifier.');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(userId).populate('department');
    if (!user) {
      const error = new Error('User account not found.');
      error.statusCode = 404;
      throw error;
    }

    if (!user.isActive) {
      const error = new Error('Your account is inactive.');
      error.statusCode = 403;
      throw error;
    }

    const allowedFields = ['firstName', 'lastName', 'phone', 'location'];
    const updatedFields = [];

    // Validate and whitelist fields
    for (const key of Object.keys(updateData)) {
      if (!allowedFields.includes(key)) {
        continue; // silently ignore unallowed fields or reject mass-assignment
      }

      const val = updateData[key];
      if (typeof val !== 'string') continue;

      const trimmed = val.trim();

      // Check for HTML/Script injection
      if (HTML_TAG_REGEX.test(trimmed)) {
        const error = new Error(`Field '${key}' contains invalid characters.`);
        error.statusCode = 400;
        throw error;
      }

      if (key === 'firstName') {
        if (trimmed.length > 50) {
          const error = new Error('First name cannot exceed 50 characters.');
          error.statusCode = 400;
          throw error;
        }
        user.firstName = trimmed;
        updatedFields.push(key);
      } else if (key === 'lastName') {
        if (trimmed.length > 50) {
          const error = new Error('Last name cannot exceed 50 characters.');
          error.statusCode = 400;
          throw error;
        }
        user.lastName = trimmed;
        updatedFields.push(key);
      } else if (key === 'location') {
        if (trimmed.length > 100) {
          const error = new Error('Location cannot exceed 100 characters.');
          error.statusCode = 400;
          throw error;
        }
        user.location = trimmed || 'Remote';
        updatedFields.push(key);
      } else if (key === 'phone') {
        if (trimmed.length > 30) {
          const error = new Error('Phone number cannot exceed 30 characters.');
          error.statusCode = 400;
          throw error;
        }
        if (trimmed && !PHONE_REGEX.test(trimmed)) {
          const error = new Error('Please enter a valid phone number (e.g. +1 555-123-4567, +91 9876543210).');
          error.statusCode = 400;
          throw error;
        }
        user.phone = trimmed;
        updatedFields.push(key);
      }
    }

    if (updatedFields.length > 0) {
      await user.save();
      await user.populate('department');

      // Audit activity
      await activityService.createActivity({
        actor: user._id,
        action: ACTIVITY_ACTION.PROFILE_UPDATED,
        entityType: ACTIVITY_ENTITY_TYPE.PROFILE,
        entityId: user._id,
        description: `${user.name} updated profile details (${updatedFields.join(', ')})`,
        metadata: {
          updatedFields,
        },
      });
    }

    return user.toSafeObject();
  },

  /**
   * Securely changes user password and refreshes auth token cookie
   */
  async changePassword(userId, { currentPassword, newPassword, confirmPassword } = {}, res = null) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const error = new Error('Invalid user identifier.');
      error.statusCode = 400;
      throw error;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      const error = new Error('Please provide current password, new password, and confirm password.');
      error.statusCode = 400;
      throw error;
    }

    if (newPassword !== confirmPassword) {
      const error = new Error('New password and confirm password do not match.');
      error.statusCode = 400;
      throw error;
    }

    // Password Policy: min 8 chars, 1 uppercase, 1 lowercase, 1 number
    if (newPassword.length < 8) {
      const error = new Error('New password must be at least 8 characters long.');
      error.statusCode = 400;
      throw error;
    }
    if (!/[A-Z]/.test(newPassword)) {
      const error = new Error('New password must contain at least one uppercase letter (A-Z).');
      error.statusCode = 400;
      throw error;
    }
    if (!/[a-z]/.test(newPassword)) {
      const error = new Error('New password must contain at least one lowercase letter (a-z).');
      error.statusCode = 400;
      throw error;
    }
    if (!/[0-9]/.test(newPassword)) {
      const error = new Error('New password must contain at least one number (0-9).');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      const error = new Error('User account not found.');
      error.statusCode = 404;
      throw error;
    }

    if (!user.isActive) {
      const error = new Error('Your account is deactivated.');
      error.statusCode = 403;
      throw error;
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      const error = new Error('The current password you entered is incorrect.');
      error.statusCode = 400;
      throw error;
    }

    // Reject same password
    if (currentPassword === newPassword) {
      const error = new Error('New password must be different from your current password.');
      error.statusCode = 400;
      throw error;
    }

    // Assign and save (triggers pre-save bcrypt hash)
    user.password = newPassword;
    await user.save();

    // Reissue fresh JWT cookie if res provided
    if (res && typeof res.cookie === 'function') {
      const token = generateToken(user);
      const cookieOptions = getCookieOptions();
      res.cookie(COOKIE_NAME, token, cookieOptions);
    }

    // Audit activity
    await activityService.createActivity({
      actor: user._id,
      action: ACTIVITY_ACTION.PASSWORD_CHANGED,
      entityType: ACTIVITY_ENTITY_TYPE.PROFILE,
      entityId: user._id,
      description: `${user.name} changed account password`,
      metadata: {
        method: 'SELF_SERVICE',
      },
    });

    return {
      message: 'Password changed successfully.',
    };
  },

  /**
   * Retrieves notification preferences for user
   */
  async getPreferences(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const error = new Error('Invalid user identifier.');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User account not found.');
      error.statusCode = 404;
      throw error;
    }

    const prefs = user.notificationPreferences || {};

    return {
      taskAssignments: prefs.taskAssignments !== false,
      taskUpdates: prefs.taskUpdates !== false,
      leaveUpdates: prefs.leaveUpdates !== false,
      announcements: prefs.announcements !== false,
      documents: prefs.documents !== false,
      system: prefs.system !== false,
    };
  },

  /**
   * Updates notification preferences
   */
  async updatePreferences(userId, newPrefs = {}) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const error = new Error('Invalid user identifier.');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User account not found.');
      error.statusCode = 404;
      throw error;
    }

    const allowedKeys = [
      'taskAssignments',
      'taskUpdates',
      'leaveUpdates',
      'announcements',
      'documents',
      'system',
    ];

    if (!user.notificationPreferences) {
      user.notificationPreferences = {};
    }

    const updatedKeys = [];

    for (const key of allowedKeys) {
      if (typeof newPrefs[key] === 'boolean') {
        user.notificationPreferences[key] = newPrefs[key];
        updatedKeys.push(key);
      }
    }

    await user.save();

    if (updatedKeys.length > 0) {
      await activityService.createActivity({
        actor: user._id,
        action: ACTIVITY_ACTION.PREFERENCES_UPDATED,
        entityType: ACTIVITY_ENTITY_TYPE.PROFILE,
        entityId: user._id,
        description: `${user.name} updated notification preferences`,
        metadata: {
          updatedPreferences: updatedKeys,
        },
      });
    }

    const prefs = user.notificationPreferences;
    return {
      taskAssignments: prefs.taskAssignments !== false,
      taskUpdates: prefs.taskUpdates !== false,
      leaveUpdates: prefs.leaveUpdates !== false,
      announcements: prefs.announcements !== false,
      documents: prefs.documents !== false,
      system: prefs.system !== false,
    };
  },
};

export default profileService;
