import { leaveService } from '../services/leaveService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

/**
 * @desc    Submit a new leave request
 * @route   POST /api/leaves
 * @access  Private (All authenticated active employees)
 */
export const createLeave = async (req, res, next) => {
  try {
    const leave = await leaveService.createLeave({
      userId: req.user.id,
      leaveType: req.body.leaveType,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      reason: req.body.reason,
    });
    return sendSuccess(res, 201, 'Leave request submitted successfully', { leave });
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Get paginated personal leave requests
 * @route   GET /api/leaves/my
 * @access  Private (All authenticated users)
 */
export const getMyLeaves = async (req, res, next) => {
  try {
    const result = await leaveService.getMyLeaves({
      userId: req.user.id,
      ...req.query,
    });
    return sendSuccess(res, 200, 'Personal leave requests retrieved successfully', result);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Get authenticated employee's leave balance for current/specified year
 * @route   GET /api/leaves/my/balance
 * @access  Private (All authenticated users)
 */
export const getMyBalance = async (req, res, next) => {
  try {
    const balance = await leaveService.getMyBalance(req.user.id, req.query.year);
    return sendSuccess(res, 200, 'Leave balance retrieved successfully', { balance });
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Get single leave request details
 * @route   GET /api/leaves/:id
 * @access  Private (Admin, Manager, or Employee owner)
 */
export const getLeaveById = async (req, res, next) => {
  try {
    const leave = await leaveService.getLeaveById({
      id: req.params.id,
      user: req.user,
    });
    return sendSuccess(res, 200, 'Leave details retrieved successfully', { leave });
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Cancel personal pending leave request
 * @route   PATCH /api/leaves/:id/cancel
 * @access  Private (Employee owner only)
 */
export const cancelLeave = async (req, res, next) => {
  try {
    const leave = await leaveService.cancelLeave({
      id: req.params.id,
      userId: req.user.id,
    });
    return sendSuccess(res, 200, 'Leave request cancelled successfully', { leave });
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Get organization/department leave requests for review
 * @route   GET /api/leaves/manage
 * @access  Private (Admin, Manager)
 */
export const getManageLeaves = async (req, res, next) => {
  try {
    const result = await leaveService.getManageLeaves({
      user: req.user,
      ...req.query,
    });
    return sendSuccess(res, 200, 'Leave management requests retrieved successfully', result);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Approve a pending leave request
 * @route   PATCH /api/leaves/:id/approve
 * @access  Private (Admin, Manager)
 */
export const approveLeave = async (req, res, next) => {
  try {
    const leave = await leaveService.approveLeave({
      id: req.params.id,
      reviewerUser: req.user,
      reviewComment: req.body.reviewComment,
    });
    return sendSuccess(res, 200, 'Leave request approved successfully', { leave });
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Reject a pending leave request
 * @route   PATCH /api/leaves/:id/reject
 * @access  Private (Admin, Manager)
 */
export const rejectLeave = async (req, res, next) => {
  try {
    const leave = await leaveService.rejectLeave({
      id: req.params.id,
      reviewerUser: req.user,
      reviewComment: req.body.reviewComment,
    });
    return sendSuccess(res, 200, 'Leave request rejected successfully', { leave });
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};
