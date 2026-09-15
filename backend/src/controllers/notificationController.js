import notificationService from '../services/notificationService.js';
import { sendSuccess } from '../utils/responseHandler.js';

/**
 * List paginated notifications for current authenticated user
 * GET /api/notifications
 */
export const getNotifications = async (req, res, next) => {
  try {
    const result = await notificationService.getNotifications({
      user: req.user,
      query: req.query,
    });

    return sendSuccess(res, 200, 'Notifications retrieved successfully.', {
      data: result.records,
      notifications: result.records,
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      unreadCount: result.unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user unread notification count
 * GET /api/notifications/unread-count
 */
export const getUnreadCount = async (req, res, next) => {
  try {
    const result = await notificationService.getUnreadCount(req.user._id);
    return sendSuccess(res, 200, 'Unread count retrieved successfully.', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a specific notification as read
 * PATCH /api/notifications/:id/read
 */
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user);
    return sendSuccess(res, 200, 'Notification marked as read.', { notification });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all user notifications as read
 * PATCH /api/notifications/read-all
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user);
    return sendSuccess(res, 200, 'All notifications marked as read.', result);
  } catch (error) {
    next(error);
  }
};
