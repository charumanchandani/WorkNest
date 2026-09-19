import { analyticsService } from '../services/analyticsService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

/**
 * @desc    Get role-aware overview metrics
 * @route   GET /api/analytics/overview
 * @access  Private (All authenticated users)
 */
export const getOverviewAnalytics = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const data = await analyticsService.getOverviewAnalytics({
      user: req.user,
      from,
      to,
    });
    return sendSuccess(res, 200, 'Overview analytics retrieved successfully', data);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Get attendance analytics and daily trends
 * @route   GET /api/analytics/attendance
 * @access  Private (All authenticated users)
 */
export const getAttendanceAnalytics = async (req, res, next) => {
  try {
    const { from, to, department, employeeId } = req.query;
    const data = await analyticsService.getAttendanceAnalytics({
      user: req.user,
      from,
      to,
      department,
      employeeId,
    });
    return sendSuccess(res, 200, 'Attendance analytics retrieved successfully', data);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Get leave analytics, status counts, and category breakdown
 * @route   GET /api/analytics/leave
 * @access  Private (All authenticated users)
 */
export const getLeaveAnalytics = async (req, res, next) => {
  try {
    const { from, to, department } = req.query;
    const data = await analyticsService.getLeaveAnalytics({
      user: req.user,
      from,
      to,
      department,
    });
    return sendSuccess(res, 200, 'Leave analytics retrieved successfully', data);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Get task analytics, priority distribution, and completion rates
 * @route   GET /api/analytics/tasks
 * @access  Private (All authenticated users)
 */
export const getTaskAnalytics = async (req, res, next) => {
  try {
    const { from, to, department, priority } = req.query;
    const data = await analyticsService.getTaskAnalytics({
      user: req.user,
      from,
      to,
      department,
      priority,
    });
    return sendSuccess(res, 200, 'Task analytics retrieved successfully', data);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Get employee workforce distribution and hiring trends
 * @route   GET /api/analytics/employees
 * @access  Private (Manager, Admin only)
 */
export const getEmployeeAnalytics = async (req, res, next) => {
  try {
    const data = await analyticsService.getEmployeeAnalytics({
      user: req.user,
    });
    return sendSuccess(res, 200, 'Employee analytics retrieved successfully', data);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Get department workloads, attendance rates, and leave usage
 * @route   GET /api/analytics/departments
 * @access  Private (Manager, Admin only)
 */
export const getDepartmentAnalytics = async (req, res, next) => {
  try {
    const data = await analyticsService.getDepartmentAnalytics({
      user: req.user,
    });
    return sendSuccess(res, 200, 'Department analytics retrieved successfully', data);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};
