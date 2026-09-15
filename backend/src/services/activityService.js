import mongoose from 'mongoose';
import Activity from '../models/Activity.js';
import Department from '../models/Department.js';
import User from '../models/User.js';
import {
  ACTIVITY_ACTION_LIST,
  ACTIVITY_ENTITY_TYPE_LIST,
} from '../constants/activity.js';

// Keys to strip from activity metadata for privacy and security
const SENSITIVE_METADATA_KEYS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'secret',
  'fileBuffer',
  'dataUrl',
];

const sanitizeMetadata = (meta) => {
  if (!meta || typeof meta !== 'object') return {};
  const cleaned = { ...meta };
  for (const key of SENSITIVE_METADATA_KEYS) {
    delete cleaned[key];
  }
  return cleaned;
};

export const activityService = {
  /**
   * Centralized activity logging helper
   */
  async createActivity({
    actor,
    action,
    entityType,
    entityId = null,
    description,
    metadata = {},
  }) {
    try {
      if (!actor || !action || !entityType || !description) {
        return null;
      }

      const actorId = actor._id ? actor._id : actor;
      if (!mongoose.Types.ObjectId.isValid(actorId)) {
        return null;
      }

      if (!ACTIVITY_ACTION_LIST.includes(action)) {
        return null;
      }

      if (!ACTIVITY_ENTITY_TYPE_LIST.includes(entityType)) {
        return null;
      }

      const safeMeta = sanitizeMetadata(metadata);

      const activity = await Activity.create({
        actor: actorId,
        action,
        entityType,
        entityId: entityId || null,
        description: description.trim(),
        metadata: safeMeta,
      });

      return activity.toSafeObject();
    } catch (err) {
      // Activity logging failure should not break critical business operations
      console.error('[activityService.createActivity Error]:', err.message);
      return null;
    }
  },

  /**
   * Retrieves paginated, RBAC-scoped activity log feed
   */
  async getActivities({ user, query = {} }) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = {};

    // 1. Role-based scoping
    if (user.role === 'ADMIN') {
      // Admin sees organization-wide activities
      if (query.actor && mongoose.Types.ObjectId.isValid(query.actor)) {
        filter.actor = query.actor;
      }
    } else if (user.role === 'MANAGER') {
      // Manager sees activities related to their managed departments + themselves
      const managedDepts = await Department.find({ manager: user._id }).select('_id');
      const managedDeptIds = managedDepts.map((d) => d._id);

      const departmentUsers = await User.find({
        department: { $in: managedDeptIds },
      }).select('_id');

      const scopedUserIds = [
        ...departmentUsers.map((u) => u._id),
        user._id,
      ];

      if (query.actor && mongoose.Types.ObjectId.isValid(query.actor)) {
        const isPermittedActor = scopedUserIds.some(
          (id) => id.toString() === query.actor.toString()
        );
        if (isPermittedActor) {
          filter.actor = query.actor;
        } else {
          // Actor outside manager scope -> return empty
          return { records: [], page, limit, total: 0, totalPages: 1 };
        }
      } else {
        filter.$or = [
          { actor: { $in: scopedUserIds } },
          { entityType: 'Department', entityId: { $in: managedDeptIds } },
          { 'metadata.targetUserId': { $in: scopedUserIds } },
          { 'metadata.employeeId': { $in: scopedUserIds } },
        ];
      }
    } else {
      // EMPLOYEE: strictly own relevant activities
      if (query.actor && query.actor.toString() !== user._id.toString()) {
        return { records: [], page, limit, total: 0, totalPages: 1 };
      }

      filter.$or = [
        { actor: user._id },
        { 'metadata.targetUserId': user._id.toString() },
        { 'metadata.employeeId': user._id.toString() },
        { 'metadata.targetUserId': user._id },
        { 'metadata.employeeId': user._id },
      ];
    }

    // 2. Entity type filter
    if (query.entityType && ACTIVITY_ENTITY_TYPE_LIST.includes(query.entityType)) {
      filter.entityType = query.entityType;
    }

    // 3. Action filter
    if (query.action && ACTIVITY_ACTION_LIST.includes(query.action)) {
      filter.action = query.action;
    }

    // 4. Date range filter
    if (query.from || query.to) {
      filter.createdAt = {};
      if (query.from) {
        const fromDate = new Date(query.from);
        if (!isNaN(fromDate.getTime())) {
          filter.createdAt.$gte = fromDate;
        }
      }
      if (query.to) {
        const toDate = new Date(query.to);
        if (!isNaN(toDate.getTime())) {
          // Include full end of day if date-only string was passed
          if (query.to.length === 10) {
            toDate.setHours(23, 59, 59, 999);
          }
          filter.createdAt.$lte = toDate;
        }
      }
      if (Object.keys(filter.createdAt).length === 0) {
        delete filter.createdAt;
      }
    }

    const [total, activities] = await Promise.all([
      Activity.countDocuments(filter),
      Activity.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'actor',
          select: 'name email role jobTitle department',
        }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      records: activities.map((a) => a.toSafeObject()),
      page,
      limit,
      total,
      totalPages,
    };
  },
};

export default activityService;
