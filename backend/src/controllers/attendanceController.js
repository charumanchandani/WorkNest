import { attendanceService } from '../services/attendanceService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

/**
 * @desc    Check in authenticated employee for today
 * @route   POST /api/attendance/check-in
 * @access  Private (All authenticated active employees)
 */
export const checkIn = async (req, res, next) => {
  try {
    const attendance = await attendanceService.checkIn(req.user.id);
    return sendSuccess(res, 200, 'Checked in successfully for today', { attendance });
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Check out authenticated employee for today
 * @route   POST /api/attendance/check-out
 * @access  Private (All authenticated active employees)
 */
export const checkOut = async (req, res, next) => {
  try {
    const attendance = await attendanceService.checkOut(req.user.id);
    return sendSuccess(res, 200, 'Checked out successfully for today', { attendance });
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Get today's attendance state for the authenticated employee
 * @route   GET /api/attendance/today
 * @access  Private (All authenticated users)
 */
export const getTodayAttendance = async (req, res, next) => {
  try {
    const attendance = await attendanceService.getTodayAttendance(req.user.id);
    return sendSuccess(res, 200, "Today's attendance status retrieved", { attendance });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get paginated personal attendance history
 * @route   GET /api/attendance/my
 * @access  Private (All authenticated users)
 */
export const getMyAttendance = async (req, res, next) => {
  try {
    const result = await attendanceService.getMyAttendance({
      userId: req.user.id,
      ...req.query,
    });
    return sendSuccess(res, 200, 'Attendance history retrieved successfully', result);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Get monthly personal attendance summary and metrics
 * @route   GET /api/attendance/my/summary
 * @access  Private (All authenticated users)
 */
export const getMySummary = async (req, res, next) => {
  try {
    const summary = await attendanceService.getMySummary({
      userId: req.user.id,
      month: req.query.month,
    });
    return sendSuccess(res, 200, 'Monthly attendance summary retrieved', { summary });
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Get organization/department attendance list for monitoring
 * @route   GET /api/attendance
 * @access  Private (Admin, Manager)
 */
export const getAttendance = async (req, res, next) => {
  try {
    const result = await attendanceService.getAttendance({
      user: req.user,
      ...req.query,
    });
    return sendSuccess(res, 200, 'Organization attendance records retrieved', result);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Get single attendance record details
 * @route   GET /api/attendance/:id
 * @access  Private (Admin, Manager, or Employee owner)
 */
export const getAttendanceById = async (req, res, next) => {
  try {
    const attendance = await attendanceService.getAttendanceById({
      id: req.params.id,
      user: req.user,
    });
    return sendSuccess(res, 200, 'Attendance details retrieved successfully', { attendance });
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};
