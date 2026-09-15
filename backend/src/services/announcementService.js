import mongoose from 'mongoose';
import Announcement from '../models/Announcement.js';
import Department from '../models/Department.js';
import User from '../models/User.js';
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
import {
  ANNOUNCEMENT_TARGET_LIST,
  ANNOUNCEMENT_STATUS_LIST,
  isValidAnnouncementTransition,
} from '../constants/announcement.js';

const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Creates a new company announcement (Admin or Manager)
 */
export const createAnnouncement = async ({
  title,
  content,
  targetType,
  department,
  expiresAt,
  status = 'DRAFT',
  user,
}) => {
  if (!title || title.trim().length < 3) {
    const err = new Error('Announcement title must be at least 3 characters long.');
    err.statusCode = 400;
    throw err;
  }

  if (!content || content.trim().length < 5) {
    const err = new Error('Announcement content must be at least 5 characters long.');
    err.statusCode = 400;
    throw err;
  }

  let selectedTarget = targetType || 'ORGANIZATION';
  if (!ANNOUNCEMENT_TARGET_LIST.includes(selectedTarget)) {
    const err = new Error(`Invalid target type. Allowed: ${ANNOUNCEMENT_TARGET_LIST.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  let departmentId = null;

  // Manager constraints
  if (user.role === 'MANAGER') {
    // Managers can only create department-targeted announcements for departments they manage
    selectedTarget = 'DEPARTMENT';

    if (!department) {
      const err = new Error('Department is required for manager-created announcements.');
      err.statusCode = 400;
      throw err;
    }

    if (!mongoose.Types.ObjectId.isValid(department)) {
      const err = new Error('Invalid department identifier.');
      err.statusCode = 400;
      throw err;
    }

    const isDeptManager = await Department.exists({
      _id: department,
      manager: user._id,
      status: 'ACTIVE',
    });

    if (!isDeptManager) {
      const err = new Error('You can only create announcements for active departments you manage.');
      err.statusCode = 403;
      throw err;
    }

    departmentId = department;
  } else if (user.role === 'ADMIN') {
    if (selectedTarget === 'DEPARTMENT') {
      if (!department) {
        const err = new Error('Department is required when target type is set to DEPARTMENT.');
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
  } else {
    const err = new Error('You do not have permission to create announcements.');
    err.statusCode = 403;
    throw err;
  }

  let initialStatus = 'DRAFT';
  let publishedAt = null;

  if (status === 'PUBLISHED') {
    initialStatus = 'PUBLISHED';
    publishedAt = new Date();
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

  const announcement = await Announcement.create({
    title: title.trim(),
    content: content.trim(),
    createdBy: user._id,
    targetType: selectedTarget,
    department: departmentId,
    status: initialStatus,
    publishedAt,
    expiresAt: parsedExpiresAt,
  });

  await announcement.populate([
    { path: 'createdBy', select: 'name email role jobTitle' },
    { path: 'department', select: 'name code status' },
  ]);

  if (initialStatus === 'PUBLISHED') {
    let targetUsers = [];
    if (selectedTarget === 'ORGANIZATION') {
      targetUsers = await User.find({ _id: { $ne: user._id }, status: 'ACTIVE' }).select('_id');
    } else if (selectedTarget === 'DEPARTMENT' && departmentId) {
      targetUsers = await User.find({ _id: { $ne: user._id }, department: departmentId, status: 'ACTIVE' }).select('_id');
    }
    if (targetUsers.length > 0) {
      const notifs = targetUsers.map((u) => ({
        recipient: u._id,
        type: NOTIFICATION_TYPE.ANNOUNCEMENT_PUBLISHED,
        title: 'New Announcement Published',
        message: `Company Announcement: "${announcement.title}".`,
        entityType: NOTIFICATION_ENTITY_TYPE.ANNOUNCEMENT,
        entityId: announcement._id,
        metadata: { announcementId: announcement._id, targetType: announcement.targetType },
      }));
      await notificationService.createNotifications(notifs);
    }
    await activityService.createActivity({
      actor: user._id,
      action: ACTIVITY_ACTION.ANNOUNCEMENT_PUBLISHED,
      entityType: ACTIVITY_ENTITY_TYPE.ANNOUNCEMENT,
      entityId: announcement._id,
      description: `${user.name} published announcement "${announcement.title}"`,
      metadata: { announcementId: announcement._id, targetType: announcement.targetType },
    });
  } else {
    await activityService.createActivity({
      actor: user._id,
      action: ACTIVITY_ACTION.ANNOUNCEMENT_CREATED,
      entityType: ACTIVITY_ENTITY_TYPE.ANNOUNCEMENT,
      entityId: announcement._id,
      description: `${user.name} created draft announcement "${announcement.title}"`,
      metadata: { announcementId: announcement._id, targetType: announcement.targetType },
    });
  }

  return announcement.toSafeObject();
};

/**
 * Lists announcements with RBAC scoping, filters, and pagination
 */
export const getAnnouncements = async ({ user, query = {} }) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const conditions = [];

  const isManageMode = query.mode === 'manage' && (user.role === 'ADMIN' || user.role === 'MANAGER');

  // --- 1. RBAC & Visibility Scoping ---
  if (user.role === 'ADMIN') {
    if (query.status && ANNOUNCEMENT_STATUS_LIST.includes(query.status)) {
      conditions.push({ status: query.status });
    }
  } else if (user.role === 'MANAGER') {
    if (isManageMode) {
      // Management view: all announcements for managed departments OR created by manager
      const managedDepts = await Department.find({ manager: user._id, status: 'ACTIVE' }).select('_id');
      const managedIds = managedDepts.map((d) => d._id);

      conditions.push({
        $or: [
          { createdBy: user._id },
          { department: { $in: managedIds } },
        ],
      });

      if (query.status && ANNOUNCEMENT_STATUS_LIST.includes(query.status)) {
        conditions.push({ status: query.status });
      }
    } else {
      // Feed view: published non-expired only
      conditions.push({ status: 'PUBLISHED' });
      conditions.push({
        $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
      });

      const managedDepts = await Department.find({ manager: user._id, status: 'ACTIVE' }).select('_id');
      const authorizedDeptIds = managedDepts.map((d) => d._id);
      if (user.department) {
        authorizedDeptIds.push(user.department);
      }

      if (authorizedDeptIds.length > 0) {
        conditions.push({
          $or: [
            { targetType: 'ORGANIZATION' },
            { targetType: 'DEPARTMENT', department: { $in: authorizedDeptIds } },
          ],
        });
      } else {
        conditions.push({ targetType: 'ORGANIZATION' });
      }
    }
  } else {
    // EMPLOYEE: strictly published & non-expired
    conditions.push({ status: 'PUBLISHED' });
    conditions.push({
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    });

    if (user.department) {
      conditions.push({
        $or: [
          { targetType: 'ORGANIZATION' },
          { targetType: 'DEPARTMENT', department: user.department },
        ],
      });
    } else {
      conditions.push({ targetType: 'ORGANIZATION' });
    }
  }

  // --- 2. Query Filters ---
  if (query.targetType && ANNOUNCEMENT_TARGET_LIST.includes(query.targetType)) {
    conditions.push({ targetType: query.targetType });
  }

  if (query.department && mongoose.Types.ObjectId.isValid(query.department)) {
    conditions.push({ department: query.department });
  }

  // --- 3. Search Filter ---
  if (query.search && typeof query.search === 'string' && query.search.trim()) {
    const searchRegex = new RegExp(escapeRegex(query.search.trim()), 'i');
    conditions.push({
      $or: [{ title: searchRegex }, { content: searchRegex }],
    });
  }

  const finalQuery = conditions.length > 0 ? { $and: conditions } : {};

  const [total, announcements] = await Promise.all([
    Announcement.countDocuments(finalQuery),
    Announcement.find(finalQuery)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate([
        { path: 'createdBy', select: 'name email role jobTitle' },
        { path: 'department', select: 'name code status' },
      ]),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    records: announcements.map((a) => a.toSafeObject()),
    page,
    limit,
    total,
    totalPages,
  };
};

/**
 * Retrieves single announcement details with RBAC checks
 */
export const getAnnouncementById = async (id, user) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Invalid announcement identifier.');
    err.statusCode = 400;
    throw err;
  }

  const announcement = await Announcement.findById(id).populate([
    { path: 'createdBy', select: 'name email role jobTitle' },
    { path: 'department', select: 'name code status' },
  ]);

  if (!announcement) {
    const err = new Error('Announcement not found.');
    err.statusCode = 404;
    throw err;
  }

  // RBAC checks for non-admin
  if (user.role === 'ADMIN') {
    return announcement.toSafeObject();
  }

  const isCreator = announcement.createdBy && announcement.createdBy._id.toString() === user._id.toString();

  if (user.role === 'MANAGER') {
    // Check if manager manages this department
    const targetDeptId = announcement.department ? (announcement.department._id || announcement.department).toString() : null;
    let managesDept = false;
    if (targetDeptId) {
      managesDept = await Department.exists({
        _id: targetDeptId,
        manager: user._id,
        status: 'ACTIVE',
      });
    }

    if (announcement.status === 'DRAFT' || announcement.status === 'ARCHIVED') {
      if (!isCreator && !managesDept) {
        const err = new Error('You are not authorized to view this unpublished announcement.');
        err.statusCode = 403;
        throw err;
      }
      return announcement.toSafeObject();
    }
  }

  // Employee or non-managing view
  if (announcement.status !== 'PUBLISHED') {
    const err = new Error('Announcement is not published.');
    err.statusCode = 404;
    throw err;
  }

  if (announcement.expiresAt && new Date(announcement.expiresAt) < new Date()) {
    const err = new Error('Announcement has expired.');
    err.statusCode = 404;
    throw err;
  }

  if (announcement.targetType === 'DEPARTMENT') {
    const userDeptId = user.department ? user.department.toString() : null;
    const annDeptId = announcement.department ? (announcement.department._id || announcement.department).toString() : null;

    if (!userDeptId || userDeptId !== annDeptId) {
      const err = new Error('You do not have authorization to view this department announcement.');
      err.statusCode = 403;
      throw err;
    }
  }

  return announcement.toSafeObject();
};

/**
 * Checks if user is authorized to manage/modify this specific announcement
 */
const verifyManagePermission = async (announcement, user) => {
  if (user.role === 'ADMIN') return true;

  if (user.role === 'MANAGER') {
    const isAuthor = announcement.createdBy.toString() === user._id.toString();
    const targetDeptId = announcement.department ? (announcement.department._id || announcement.department).toString() : null;

    if (targetDeptId) {
      const isDeptManager = await Department.exists({
        _id: targetDeptId,
        manager: user._id,
        status: 'ACTIVE',
      });
      if (isDeptManager || isAuthor) return true;
    } else if (isAuthor) {
      return true;
    }
  }

  return false;
};

/**
 * Updates announcement content (Admin or Manager)
 */
export const updateAnnouncement = async (id, updateData, user) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Invalid announcement identifier.');
    err.statusCode = 400;
    throw err;
  }

  const announcement = await Announcement.findById(id);
  if (!announcement) {
    const err = new Error('Announcement not found.');
    err.statusCode = 404;
    throw err;
  }

  const canManage = await verifyManagePermission(announcement, user);
  if (!canManage) {
    const err = new Error('You are not authorized to edit this announcement.');
    err.statusCode = 403;
    throw err;
  }

  // Managers can only edit DRAFT announcements
  if (user.role === 'MANAGER' && announcement.status !== 'DRAFT') {
    const err = new Error('Only draft announcements can be edited by managers.');
    err.statusCode = 400;
    throw err;
  }

  // Do not allow status changes via general update
  if (updateData.status && updateData.status !== announcement.status) {
    const err = new Error('Please use dedicated publish or archive endpoints to change announcement status.');
    err.statusCode = 400;
    throw err;
  }

  if (updateData.title !== undefined) {
    if (!updateData.title || updateData.title.trim().length < 3) {
      const err = new Error('Title must be at least 3 characters.');
      err.statusCode = 400;
      throw err;
    }
    announcement.title = updateData.title.trim();
  }

  if (updateData.content !== undefined) {
    if (!updateData.content || updateData.content.trim().length < 5) {
      const err = new Error('Content must be at least 5 characters.');
      err.statusCode = 400;
      throw err;
    }
    announcement.content = updateData.content.trim();
  }

  if (updateData.targetType !== undefined) {
    if (!ANNOUNCEMENT_TARGET_LIST.includes(updateData.targetType)) {
      const err = new Error(`Invalid target type: ${updateData.targetType}`);
      err.statusCode = 400;
      throw err;
    }

    if (user.role === 'MANAGER' && updateData.targetType === 'ORGANIZATION') {
      const err = new Error('Managers cannot create or target organization-wide announcements.');
      err.statusCode = 403;
      throw err;
    }

    announcement.targetType = updateData.targetType;
    if (updateData.targetType === 'ORGANIZATION') {
      announcement.department = null;
    }
  }

  if (announcement.targetType === 'DEPARTMENT') {
    const targetDeptId = updateData.department || announcement.department;
    if (!targetDeptId) {
      const err = new Error('Department is required for DEPARTMENT target.');
      err.statusCode = 400;
      throw err;
    }

    if (!mongoose.Types.ObjectId.isValid(targetDeptId)) {
      const err = new Error('Invalid department identifier.');
      err.statusCode = 400;
      throw err;
    }

    if (user.role === 'MANAGER') {
      const isDeptManager = await Department.exists({
        _id: targetDeptId,
        manager: user._id,
        status: 'ACTIVE',
      });
      if (!isDeptManager) {
        const err = new Error('You can only target departments you manage.');
        err.statusCode = 403;
        throw err;
      }
    } else {
      const deptRecord = await Department.findOne({ _id: targetDeptId, status: 'ACTIVE' });
      if (!deptRecord) {
        const err = new Error('Target department does not exist or is inactive.');
        err.statusCode = 400;
        throw err;
      }
    }

    announcement.department = targetDeptId;
  }

  if (updateData.expiresAt !== undefined) {
    if (updateData.expiresAt === null || updateData.expiresAt === '') {
      announcement.expiresAt = null;
    } else {
      const expDate = new Date(updateData.expiresAt);
      if (isNaN(expDate.getTime())) {
        const err = new Error('Invalid expiration date format.');
        err.statusCode = 400;
        throw err;
      }
      announcement.expiresAt = expDate;
    }
  }

  await announcement.save();
  await announcement.populate([
    { path: 'createdBy', select: 'name email role jobTitle' },
    { path: 'department', select: 'name code status' },
  ]);

  return announcement.toSafeObject();
};

/**
 * Publishes a draft announcement (DRAFT -> PUBLISHED)
 */
export const publishAnnouncement = async (id, user) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Invalid announcement identifier.');
    err.statusCode = 400;
    throw err;
  }

  const announcement = await Announcement.findById(id);
  if (!announcement) {
    const err = new Error('Announcement not found.');
    err.statusCode = 404;
    throw err;
  }

  const canManage = await verifyManagePermission(announcement, user);
  if (!canManage) {
    const err = new Error('You are not authorized to publish this announcement.');
    err.statusCode = 403;
    throw err;
  }

  if (!isValidAnnouncementTransition(announcement.status, 'PUBLISHED')) {
    const err = new Error(`Cannot transition announcement from '${announcement.status}' to 'PUBLISHED'.`);
    err.statusCode = 400;
    throw err;
  }

  announcement.status = 'PUBLISHED';
  announcement.publishedAt = new Date();

  await announcement.save();
  await announcement.populate([
    { path: 'createdBy', select: 'name email role jobTitle' },
    { path: 'department', select: 'name code status' },
  ]);

  // Notify target users
  let targetUsers = [];
  if (announcement.targetType === 'ORGANIZATION') {
    targetUsers = await User.find({ _id: { $ne: user._id }, status: 'ACTIVE' }).select('_id');
  } else if (announcement.targetType === 'DEPARTMENT' && announcement.department) {
    const deptId = announcement.department._id || announcement.department;
    targetUsers = await User.find({ _id: { $ne: user._id }, department: deptId, status: 'ACTIVE' }).select('_id');
  }
  if (targetUsers.length > 0) {
    const notifs = targetUsers.map((u) => ({
      recipient: u._id,
      type: NOTIFICATION_TYPE.ANNOUNCEMENT_PUBLISHED,
      title: 'New Announcement Published',
      message: `Company Announcement: "${announcement.title}".`,
      entityType: NOTIFICATION_ENTITY_TYPE.ANNOUNCEMENT,
      entityId: announcement._id,
      metadata: { announcementId: announcement._id, targetType: announcement.targetType },
    }));
    await notificationService.createNotifications(notifs);
  }

  await activityService.createActivity({
    actor: user._id,
    action: ACTIVITY_ACTION.ANNOUNCEMENT_PUBLISHED,
    entityType: ACTIVITY_ENTITY_TYPE.ANNOUNCEMENT,
    entityId: announcement._id,
    description: `${user.name} published announcement "${announcement.title}"`,
    metadata: { announcementId: announcement._id, targetType: announcement.targetType },
  });

  return announcement.toSafeObject();
};

/**
 * Archives an announcement (DRAFT/PUBLISHED -> ARCHIVED)
 */
export const archiveAnnouncement = async (id, user) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Invalid announcement identifier.');
    err.statusCode = 400;
    throw err;
  }

  const announcement = await Announcement.findById(id);
  if (!announcement) {
    const err = new Error('Announcement not found.');
    err.statusCode = 404;
    throw err;
  }

  const canManage = await verifyManagePermission(announcement, user);
  if (!canManage) {
    const err = new Error('You are not authorized to archive this announcement.');
    err.statusCode = 403;
    throw err;
  }

  if (!isValidAnnouncementTransition(announcement.status, 'ARCHIVED')) {
    const err = new Error(`Cannot transition announcement from '${announcement.status}' to 'ARCHIVED'.`);
    err.statusCode = 400;
    throw err;
  }

  announcement.status = 'ARCHIVED';

  await announcement.save();
  await announcement.populate([
    { path: 'createdBy', select: 'name email role jobTitle' },
    { path: 'department', select: 'name code status' },
  ]);

  await activityService.createActivity({
    actor: user._id,
    action: ACTIVITY_ACTION.ANNOUNCEMENT_ARCHIVED,
    entityType: ACTIVITY_ENTITY_TYPE.ANNOUNCEMENT,
    entityId: announcement._id,
    description: `${user.name} archived announcement "${announcement.title}"`,
    metadata: { announcementId: announcement._id },
  });

  return announcement.toSafeObject();
};

export default {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  publishAnnouncement,
  archiveAnnouncement,
};
