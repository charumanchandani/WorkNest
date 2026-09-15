import api from './api';

/**
 * In-App Notification Frontend Service
 */
export const notificationService = {
  /**
   * List paginated notifications for current user
   */
  async getNotifications(params = {}) {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  /**
   * Mark single notification as read
   */
  async markNotificationRead(id) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Mark all notifications for current user as read
   */
  async markAllNotificationsRead() {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },
};

export default notificationService;
