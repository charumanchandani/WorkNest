import mongoose from 'mongoose';
import {
  ANNOUNCEMENT_TARGET_LIST,
  ANNOUNCEMENT_STATUS_LIST,
} from '../constants/announcement.js';

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide announcement title'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Please provide announcement content'],
      trim: true,
      minlength: [5, 'Content must be at least 5 characters'],
      maxlength: [5000, 'Content cannot exceed 5000 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator reference is required'],
      index: true,
    },
    targetType: {
      type: String,
      enum: {
        values: ANNOUNCEMENT_TARGET_LIST,
        message: '{VALUE} is not a valid announcement target type',
      },
      default: 'ORGANIZATION',
      index: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ANNOUNCEMENT_STATUS_LIST,
        message: '{VALUE} is not a valid announcement status',
      },
      default: 'DRAFT',
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
announcementSchema.index({ status: 1, targetType: 1, department: 1 });
announcementSchema.index({ status: 1, publishedAt: -1 });
announcementSchema.index({ status: 1, expiresAt: 1 });

/**
 * Returns safe serialized announcement object
 */
announcementSchema.methods.toSafeObject = function () {
  let authorData = null;
  if (this.createdBy) {
    if (this.createdBy._id) {
      authorData = {
        id: this.createdBy._id.toString(),
        name: this.createdBy.name,
        email: this.createdBy.email,
        role: this.createdBy.role,
        jobTitle: this.createdBy.jobTitle,
      };
    } else {
      authorData = { id: this.createdBy.toString() };
    }
  }

  let deptData = null;
  if (this.department) {
    if (this.department._id) {
      deptData = {
        id: this.department._id.toString(),
        name: this.department.name,
        code: this.department.code,
      };
    } else {
      deptData = { id: this.department.toString() };
    }
  }

  const isExpired = this.expiresAt ? new Date(this.expiresAt) < new Date() : false;

  return {
    id: this._id.toString(),
    title: this.title,
    content: this.content,
    createdBy: authorData,
    targetType: this.targetType,
    department: deptData,
    status: this.status,
    publishedAt: this.publishedAt,
    expiresAt: this.expiresAt,
    isExpired,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
