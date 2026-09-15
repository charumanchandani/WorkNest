import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { NOTIFICATION_TYPE_LIST } from '../constants/notification.js';

export const notificationService = {
  /**
   * Creates a single notification with deduplication safeguard
   */
  async createNotification({
    recipient,
    type,
    title,
    message,
    entityType = null,
    entityId = null,
    metadata = {},
  }) {
    if (!recipient) return null;

    const recipientId = recipient._id ? recipient._id : recipient;
    if (!mongoose.Types.ObjectId.isValid(recipientId)) return null;

    // Verify recipient is active
    const recipientUser = await User.findById(recipientId).select('isActive');
    if (!recipientUser || !recipientUser.isActive) return null;

    // Deduplication check: prevent identical notifications within last 10 seconds
    if (entityId && type) {
      const tenSecondsAgo = new Date(Date.now() - 10 * 1000);
      const existing = await Notification.findOne({
        recipient: recipientId,
        type,
        entityId,
        createdAt: { $gte: tenSecondsAgo },
      });
      if (existing) {
        return existing.toSafeObject();
      }
    }

    const notification = await Notification.create({
      recipient: recipientId,
      type,
      title: title.trim(),
      message: message.trim(),
      entityType,
      entityId: entityId || null,
      metadata: metadata || {},
      isRead: false,
      readAt: null,
    });

    return notification.toSafeObject();
  },

  /**
   * Batch creates notifications for multiple recipients
   */
  async createNotifications(notificationList = []) {
    if (!Array.isArray(notificationList) || notificationList.length === 0) {
      return [];
    }

    const validDocs = [];

    for (const item of notificationList) {
      if (!item.recipient || !item.type || !item.title || !item.message) continue;

      const recipientId = item.recipient._id ? item.recipient._id : item.recipient;
      if (!mongoose.Types.ObjectId.isValid(recipientId)) continue;

      validDocs.push({
        recipient: recipientId,
        type: item.type,
        title: item.title.trim(),
        message: item.message.trim(),
        entityType: item.entityType || null,
        entityId: item.entityId || null,
        metadata: item.metadata || {},
        isRead: false,
        readAt: null,
      });
    }

    if (validDocs.length === 0) return [];

    const created = await Notification.insertMany(validDocs);
    return created.map((n) => n.toSafeObject());
  },

  /**
   * Retrieves paginated notifications strictly scoped to the authenticated user
   */
  async getNotifications({ user, query = {} }) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = { recipient: user._id };

    if (query.unreadOnly === 'true' || query.unreadOnly === true) {
      filter.isRead = false;
    }

    if (query.type && NOTIFICATION_TYPE_LIST.includes(query.type)) {
      filter.type = query.type;
    }

    const [total, unreadCount, notifications] = await Promise.all([
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipient: user._id, isRead: false }),
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      records: notifications.map((n) => n.toSafeObject()),
      page,
      limit,
      total,
      totalPages,
      unreadCount,
    };
  },

  /**
   * Returns unread notification count for a user
   */
  async getUnreadCount(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { unreadCount: 0 };
    }
    const count = await Notification.countDocuments({ recipient: userId, isRead: false });
    return { unreadCount: count };
  },

  /**
   * Marks a specific notification as read by recipient
   */
  async markAsRead(notificationId, user) {
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      const err = new Error('Invalid notification identifier.');
      err.statusCode = 400;
      throw err;
    }

    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: user._id,
    });

    if (!notification) {
      const err = new Error('Notification not found or does not belong to you.');
      err.statusCode = 404;
      throw err;
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
    }

    return notification.toSafeObject();
  },

  /**
   * Marks all unread notifications for the user as read
   */
  async markAllAsRead(user) {
    const result = await Notification.updateMany(
      { recipient: user._id, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    return {
      updatedCount: result.modifiedCount || 0,
    };
  },
};

export default notificationService;
