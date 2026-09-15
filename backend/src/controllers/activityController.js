import activityService from '../services/activityService.js';
import { sendSuccess } from '../utils/responseHandler.js';

/**
 * List paginated, RBAC-scoped activity and audit events
 * GET /api/activities
 */
export const getActivities = async (req, res, next) => {
  try {
    const result = await activityService.getActivities({
      user: req.user,
      query: req.query,
    });

    return sendSuccess(res, 200, 'Activities retrieved successfully.', {
      data: result.records,
      activities: result.records,
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    });
  } catch (error) {
    next(error);
  }
};
