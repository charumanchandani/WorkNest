import mongoose from 'mongoose';
import {
  NOTIFICATION_TYPE_LIST,
  NOTIFICATION_ENTITY_TYPE_LIST,
} from '../constants/notification.js';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification recipient is required'],
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: NOTIFICATION_TYPE_LIST,
        message: '{VALUE} is not a valid notification type',
      },
      required: [true, 'Notification type is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    entityType: {
      type: String,
      enum: {
        values: NOTIFICATION_ENTITY_TYPE_LIST,
        message: '{VALUE} is not a supported entity type',
      },
      default: null,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal user notification querying
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, type: 1 });

/**
 * Returns safe serialized notification object
 */
notificationSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    recipient: this.recipient?._id ? this.recipient._id.toString() : this.recipient?.toString(),
    type: this.type,
    title: this.title,
    message: this.message,
    entityType: this.entityType,
    entityId: this.entityId ? this.entityId.toString() : null,
    metadata: this.metadata || {},
    isRead: this.isRead,
    readAt: this.readAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
