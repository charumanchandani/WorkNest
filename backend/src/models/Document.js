import mongoose from 'mongoose';
import {
  DOCUMENT_CATEGORY_LIST,
  DOCUMENT_VISIBILITY_LIST,
  DOCUMENT_STATUS_LIST,
} from '../constants/document.js';

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide document title'],
      trim: true,
      minlength: [3, 'Document title must be at least 3 characters'],
      maxlength: [150, 'Document title cannot exceed 150 characters'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      enum: {
        values: DOCUMENT_CATEGORY_LIST,
        message: '{VALUE} is not a supported document category',
      },
      default: 'POLICY',
      index: true,
    },
    originalFileName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true,
    },
    fileName: {
      type: String, // internal storageKey
      required: [true, 'Storage key reference is required'],
      trim: true,
      select: false, // Hidden by default from queries to prevent leaking internal storage keys
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
      trim: true,
    },
    size: {
      type: Number,
      required: [true, 'File size is required'],
      min: [0, 'File size must be positive'],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader user reference is required'],
      index: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
      index: true,
    },
    visibility: {
      type: String,
      enum: {
        values: DOCUMENT_VISIBILITY_LIST,
        message: '{VALUE} is not a valid document visibility',
      },
      default: 'ORGANIZATION',
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: DOCUMENT_STATUS_LIST,
        message: '{VALUE} is not a valid document status',
      },
      default: 'ACTIVE',
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

// Compound indexes for optimal query execution
documentSchema.index({ visibility: 1, department: 1, status: 1 });
documentSchema.index({ status: 1, expiresAt: 1 });
documentSchema.index({ category: 1, status: 1 });

/**
 * Returns safe serialized document object for client responses
 */
documentSchema.methods.toSafeObject = function () {
  let uploaderData = null;
  if (this.uploadedBy) {
    if (this.uploadedBy._id) {
      uploaderData = {
        id: this.uploadedBy._id.toString(),
        name: this.uploadedBy.name,
        email: this.uploadedBy.email,
        role: this.uploadedBy.role,
        jobTitle: this.uploadedBy.jobTitle,
      };
    } else {
      uploaderData = { id: this.uploadedBy.toString() };
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
    description: this.description || '',
    category: this.category,
    originalFileName: this.originalFileName,
    mimeType: this.mimeType,
    size: this.size,
    uploadedBy: uploaderData,
    department: deptData,
    visibility: this.visibility,
    status: this.status,
    expiresAt: this.expiresAt,
    isExpired,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Document = mongoose.model('Document', documentSchema);
export default Document;
