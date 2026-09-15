import mongoose from 'mongoose';
import Document from '../models/Document.js';
import Department from '../models/Department.js';
import User from '../models/User.js';
import storageService from './storageService.js';
import notificationService from './notificationService.js';
import activityService from './activityService.js';
import {
  NOTIFICATION_TYPE,
  NOTIFICATION_ENTITY_TYPE,
} from '../constants/notification.js';
import {
  ACTIVITY_ACTION,
  ACTIVITY_ENTITY_TYPE,
} from '../constants/activity.js';
import { DOCUMENT_CATEGORY_LIST, DOCUMENT_VISIBILITY_LIST } from '../constants/document.js';

/**
 * Escapes regex special characters to prevent regex injection
 */
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Creates and stores a new document (Admin only)
 */
export const createDocument = async ({
  title,
  description,
  category,
  visibility,
  department,
  expiresAt,
  file,
  user,
}) => {
  if (!title || title.trim().length < 3) {
    const err = new Error('Document title must be at least 3 characters long.');
    err.statusCode = 400;
    throw err;
  }

  if (!file || !file.buffer) {
    const err = new Error('Please select a valid document file to upload.');
    err.statusCode = 400;
    throw err;
  }

  // Validate category
  const selectedCategory = category || 'POLICY';
  if (!DOCUMENT_CATEGORY_LIST.includes(selectedCategory)) {
    const err = new Error(`Invalid category. Allowed: ${DOCUMENT_CATEGORY_LIST.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  // Validate visibility
  const selectedVisibility = visibility || 'ORGANIZATION';
  if (!DOCUMENT_VISIBILITY_LIST.includes(selectedVisibility)) {
    const err = new Error(`Invalid visibility. Allowed: ${DOCUMENT_VISIBILITY_LIST.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  let departmentId = null;

  if (selectedVisibility === 'DEPARTMENT') {
    if (!department) {
      const err = new Error('Department is required when document visibility is set to DEPARTMENT.');
      err.statusCode = 400;
      throw err;
    }

    if (!mongoose.Types.ObjectId.isValid(department)) {
      const err = new Error('Invalid department identifier.');
      err.statusCode = 400;
      throw err;
    }

    const deptRecord = await Department.findOne({ _id: department, status: 'ACTIVE' });
    if (!deptRecord) {
      const err = new Error('Target department does not exist or is inactive.');
      err.statusCode = 400;
      throw err;
    }

    departmentId = deptRecord._id;
  }

  let parsedExpiresAt = null;
  if (expiresAt) {
    const expDate = new Date(expiresAt);
    if (isNaN(expDate.getTime())) {
      const err = new Error('Invalid expiration date format.');
      err.statusCode = 400;
      throw err;
    }
    parsedExpiresAt = expDate;
  }

  // Save file via storage abstraction
  const storageResult = await storageService.saveFileFromBuffer(
    file.buffer,
    file.originalname,
    file.mimetype
  );

  try {
    const newDoc = await Document.create({
      title: title.trim(),
      description: (description || '').trim(),
      category: selectedCategory,
      originalFileName: storageResult.originalFileName,
      fileName: storageResult.storageKey,
      mimeType: storageResult.mimeType,
      size: storageResult.size,
      uploadedBy: user._id,
      department: departmentId,
      visibility: selectedVisibility,
      status: 'ACTIVE',
      expiresAt: parsedExpiresAt,
    });

    await newDoc.populate([
      { path: 'uploadedBy', select: 'name email role jobTitle' },
      { path: 'department', select: 'name code status' },
    ]);

    // Notify eligible users
    let targetUsers = [];
    if (selectedVisibility === 'ORGANIZATION') {
      targetUsers = await User.find({ _id: { $ne: user._id }, status: 'ACTIVE' }).select('_id');
    } else if (selectedVisibility === 'DEPARTMENT' && departmentId) {
      targetUsers = await User.find({ _id: { $ne: user._id }, department: departmentId, status: 'ACTIVE' }).select('_id');
    }

    if (targetUsers.length > 0) {
      const notifList = targetUsers.map((u) => ({
        recipient: u._id,
        type: NOTIFICATION_TYPE.DOCUMENT_ADDED,
        title: 'New Document Uploaded',
        message: `A new document "${newDoc.title}" is available in the Document Vault.`,
        entityType: NOTIFICATION_ENTITY_TYPE.DOCUMENT,
        entityId: newDoc._id,
        metadata: { documentId: newDoc._id, category: newDoc.category, visibility: newDoc.visibility },
      }));
      await notificationService.createNotifications(notifList);
    }

    // Log Activity
    await activityService.createActivity({
      actor: user._id,
      action: ACTIVITY_ACTION.DOCUMENT_UPLOADED,
      entityType: ACTIVITY_ENTITY_TYPE.DOCUMENT,
      entityId: newDoc._id,
      description: `${user.name} uploaded document "${newDoc.title}"`,
      metadata: { documentId: newDoc._id, category: newDoc.category, visibility: newDoc.visibility },
    });

    return newDoc.toSafeObject();
  } catch (error) {
    // If DB insert failed, clean up the written file to avoid orphans
    await storageService.deleteStoredFile(storageResult.storageKey);
    throw error;
  }
};

/**
 * Retrieves paginated document listing with strict RBAC enforcement
 */
export const getDocuments = async ({ user, query = {} }) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const conditions = [];

  // --- 1. RBAC & Visibility Scoping ---
  if (user.role === 'ADMIN') {
    // Admin can view all documents, with optional status filter (e.g. ACTIVE vs ARCHIVED)
    if (query.status) {
      conditions.push({ status: query.status });
    }
  } else if (user.role === 'MANAGER') {
    // Manager: Active & non-expired documents only
    conditions.push({ status: 'ACTIVE' });
    conditions.push({
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    });

    // Find departments managed by this manager
    const managedDepts = await Department.find({ manager: user._id, status: 'ACTIVE' }).select('_id');
    const authorizedDeptIds = managedDepts.map((d) => d._id);
    if (user.department) {
      authorizedDeptIds.push(user.department);
    }

    if (authorizedDeptIds.length > 0) {
      conditions.push({
        $or: [
          { visibility: 'ORGANIZATION' },
          { visibility: 'DEPARTMENT', department: { $in: authorizedDeptIds } },
        ],
      });
    } else {
      conditions.push({ visibility: 'ORGANIZATION' });
    }
  } else {
    // EMPLOYEE: Active & non-expired documents only
    conditions.push({ status: 'ACTIVE' });
    conditions.push({
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    });

    if (user.department) {
      conditions.push({
        $or: [
          { visibility: 'ORGANIZATION' },
          { visibility: 'DEPARTMENT', department: user.department },
        ],
      });
    } else {
      conditions.push({ visibility: 'ORGANIZATION' });
    }
  }

  // --- 2. Query Filters ---
  if (query.category && DOCUMENT_CATEGORY_LIST.includes(query.category)) {
    conditions.push({ category: query.category });
  }

  if (query.visibility && DOCUMENT_VISIBILITY_LIST.includes(query.visibility)) {
    conditions.push({ visibility: query.visibility });
  }

  if (query.department && mongoose.Types.ObjectId.isValid(query.department)) {
    conditions.push({ department: query.department });
  }

  // --- 3. Search Filter ---
  if (query.search && typeof query.search === 'string' && query.search.trim()) {
    const searchRegex = new RegExp(escapeRegex(query.search.trim()), 'i');
    conditions.push({
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { originalFileName: searchRegex },
      ],
    });
  }

  const finalQuery = conditions.length > 0 ? { $and: conditions } : {};

  const [total, documents] = await Promise.all([
    Document.countDocuments(finalQuery),
    Document.find(finalQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate([
        { path: 'uploadedBy', select: 'name email role jobTitle' },
        { path: 'department', select: 'name code status' },
      ]),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    records: documents.map((doc) => doc.toSafeObject()),
    page,
    limit,
    total,
    totalPages,
  };
};

/**
 * Retrieves a single document by ID with RBAC authorization check
 */
export const getDocumentById = async (id, user) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Invalid document identifier.');
    err.statusCode = 400;
    throw err;
  }

  const document = await Document.findById(id).populate([
    { path: 'uploadedBy', select: 'name email role jobTitle' },
    { path: 'department', select: 'name code status' },
  ]);

  if (!document) {
    const err = new Error('Document not found.');
    err.statusCode = 404;
    throw err;
  }

  // Verify RBAC access for non-admin
  if (user.role !== 'ADMIN') {
    if (document.status !== 'ACTIVE') {
      const err = new Error('Document is archived and not accessible.');
      err.statusCode = 404;
      throw err;
    }

    if (document.expiresAt && new Date(document.expiresAt) < new Date()) {
      const err = new Error('Document has expired.');
      err.statusCode = 404;
      throw err;
    }

    if (document.visibility === 'DEPARTMENT') {
      let isAuthorized = false;

      const userDeptId = user.department ? user.department.toString() : null;
      const docDeptId = document.department ? (document.department._id || document.department).toString() : null;

      if (userDeptId && docDeptId && userDeptId === docDeptId) {
        isAuthorized = true;
      }

      if (!isAuthorized && user.role === 'MANAGER' && docDeptId) {
        const managesDept = await Department.exists({
          _id: docDeptId,
          manager: user._id,
          status: 'ACTIVE',
        });
        if (managesDept) isAuthorized = true;
      }

      if (!isAuthorized) {
        const err = new Error('You do not have authorization to view this department document.');
        err.statusCode = 403;
        throw err;
      }
    }
  }

  return document.toSafeObject();
};

/**
 * Prepares a document for secure download with complete authentication, authorization, and validation
 */
export const getDocumentForDownload = async (id, user) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Invalid document identifier.');
    err.statusCode = 400;
    throw err;
  }

  // Include fileName storage key for physical file retrieval
  const document = await Document.findById(id)
    .select('+fileName')
    .populate([
      { path: 'department', select: 'name code status' },
    ]);

  if (!document) {
    const err = new Error('Document not found.');
    err.statusCode = 404;
    throw err;
  }

  // Verify RBAC access for non-admin
  if (user.role !== 'ADMIN') {
    if (document.status !== 'ACTIVE') {
      const err = new Error('Archived documents cannot be downloaded.');
      err.statusCode = 404;
      throw err;
    }

    if (document.expiresAt && new Date(document.expiresAt) < new Date()) {
      const err = new Error('Expired documents cannot be downloaded.');
      err.statusCode = 404;
      throw err;
    }

    if (document.visibility === 'DEPARTMENT') {
      let isAuthorized = false;

      const userDeptId = user.department ? user.department.toString() : null;
      const docDeptId = document.department ? (document.department._id || document.department).toString() : null;

      if (userDeptId && docDeptId && userDeptId === docDeptId) {
        isAuthorized = true;
      }

      if (!isAuthorized && user.role === 'MANAGER' && docDeptId) {
        const managesDept = await Department.exists({
          _id: docDeptId,
          manager: user._id,
          status: 'ACTIVE',
        });
        if (managesDept) isAuthorized = true;
      }

      if (!isAuthorized) {
        const err = new Error('You do not have authorization to download this department document.');
        err.statusCode = 403;
        throw err;
      }
    }
  }

  // Resolve safe absolute file path
  const filePath = storageService.getFileDownloadPath(document.fileName);

  return {
    filePath,
    originalFileName: document.originalFileName,
    mimeType: document.mimeType,
    size: document.size,
  };
};

/**
 * Updates document metadata (Admin only)
 */
export const updateDocument = async (id, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Invalid document identifier.');
    err.statusCode = 400;
    throw err;
  }

  const document = await Document.findById(id);
  if (!document) {
    const err = new Error('Document not found.');
    err.statusCode = 404;
    throw err;
  }

  if (updateData.title !== undefined) {
    if (!updateData.title || updateData.title.trim().length < 3) {
      const err = new Error('Title must be at least 3 characters long.');
      err.statusCode = 400;
      throw err;
    }
    document.title = updateData.title.trim();
  }

  if (updateData.description !== undefined) {
    document.description = (updateData.description || '').trim();
  }

  if (updateData.category !== undefined) {
    if (!DOCUMENT_CATEGORY_LIST.includes(updateData.category)) {
      const err = new Error(`Invalid category. Allowed: ${DOCUMENT_CATEGORY_LIST.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }
    document.category = updateData.category;
  }

  if (updateData.visibility !== undefined) {
    if (!DOCUMENT_VISIBILITY_LIST.includes(updateData.visibility)) {
      const err = new Error(`Invalid visibility. Allowed: ${DOCUMENT_VISIBILITY_LIST.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }
    document.visibility = updateData.visibility;

    if (updateData.visibility === 'ORGANIZATION') {
      document.department = null;
    }
  }

  if (document.visibility === 'DEPARTMENT') {
    const targetDeptId = updateData.department || document.department;
    if (!targetDeptId) {
      const err = new Error('Department is required for DEPARTMENT visibility.');
      err.statusCode = 400;
      throw err;
    }

    if (!mongoose.Types.ObjectId.isValid(targetDeptId)) {
      const err = new Error('Invalid department identifier.');
      err.statusCode = 400;
      throw err;
    }

    const deptRecord = await Department.findOne({ _id: targetDeptId, status: 'ACTIVE' });
    if (!deptRecord) {
      const err = new Error('Target department does not exist or is inactive.');
      err.statusCode = 400;
      throw err;
    }

    document.department = deptRecord._id;
  }

  if (updateData.expiresAt !== undefined) {
    if (updateData.expiresAt === null || updateData.expiresAt === '') {
      document.expiresAt = null;
    } else {
      const expDate = new Date(updateData.expiresAt);
      if (isNaN(expDate.getTime())) {
        const err = new Error('Invalid expiration date format.');
        err.statusCode = 400;
        throw err;
      }
      document.expiresAt = expDate;
    }
  }

  await document.save();
  await document.populate([
    { path: 'uploadedBy', select: 'name email role jobTitle' },
    { path: 'department', select: 'name code status' },
  ]);

  return document.toSafeObject();
};

/**
 * Archives a document (Admin only)
 */
export const archiveDocument = async (id, user = null) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Invalid document identifier.');
    err.statusCode = 400;
    throw err;
  }

  const document = await Document.findById(id);
  if (!document) {
    const err = new Error('Document not found.');
    err.statusCode = 404;
    throw err;
  }

  document.status = 'ARCHIVED';
  await document.save();
  await document.populate([
    { path: 'uploadedBy', select: 'name email role jobTitle' },
    { path: 'department', select: 'name code status' },
  ]);

  if (user) {
    await activityService.createActivity({
      actor: user._id,
      action: ACTIVITY_ACTION.DOCUMENT_ARCHIVED,
      entityType: ACTIVITY_ENTITY_TYPE.DOCUMENT,
      entityId: document._id,
      description: `${user.name} archived document "${document.title}"`,
      metadata: { documentId: document._id },
    });
  }

  return document.toSafeObject();
};

export default {
  createDocument,
  getDocuments,
  getDocumentById,
  getDocumentForDownload,
  updateDocument,
  archiveDocument,
};
