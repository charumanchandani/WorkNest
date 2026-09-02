import mongoose from 'mongoose';
import Leave from '../models/Leave.js';
import LeaveBalance from '../models/LeaveBalance.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import {
  LEAVE_TYPES,
  LEAVE_TYPES_LIST,
  LEAVE_STATUS,
  LEAVE_STATUS_LIST,
  DEFAULT_LEAVE_BALANCES,
  calculateWorkingDays,
} from '../constants/leave.js';
import { getTodayDateString } from '../constants/attendance.js';

// Helper to escape regex special characters
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const leaveService = {
  /**
   * Lazy initialization or retrieval of employee leave balance for a given calendar year
   */
  async getOrCreateBalance(userId, year = new Date().getFullYear()) {
    let balance = await LeaveBalance.findOne({ employee: userId, year });
    if (!balance) {
      balance = new LeaveBalance({
        employee: userId,
        year,
        annual: DEFAULT_LEAVE_BALANCES.ANNUAL,
        casual: DEFAULT_LEAVE_BALANCES.CASUAL,
        sick: DEFAULT_LEAVE_BALANCES.SICK,
        usedAnnual: 0,
        usedCasual: 0,
        usedSick: 0,
      });
      await balance.save();
    }
    return balance;
  },

  /**
   * Computes pending days and unpaid usage for an employee in a calendar year
   */
  async getPendingLeaveCounts(userId, year = new Date().getFullYear()) {
    const yearStr = String(year);
    const leaves = await Leave.find({
      employee: userId,
      startDate: { $gte: `${yearStr}-01-01`, $lte: `${yearStr}-12-31` },
      status: { $in: [LEAVE_STATUS.PENDING, LEAVE_STATUS.APPROVED] },
    });

    const counts = {
      ANNUAL: 0,
      CASUAL: 0,
      SICK: 0,
      UNPAID: 0,
      USED_UNPAID: 0,
    };

    leaves.forEach((l) => {
      if (l.status === LEAVE_STATUS.PENDING) {
        if (counts[l.leaveType] !== undefined) {
          counts[l.leaveType] += l.totalDays;
        }
      } else if (l.status === LEAVE_STATUS.APPROVED && l.leaveType === LEAVE_TYPES.UNPAID) {
        counts.USED_UNPAID += l.totalDays;
      }
    });

    return counts;
  },

  /**
   * Get authenticated user's current leave balance summary
   */
  async getMyBalance(userId, year = new Date().getFullYear()) {
    const balance = await this.getOrCreateBalance(userId, year);
    const pendingCounts = await this.getPendingLeaveCounts(userId, year);
    return balance.toSafeObject(pendingCounts);
  },

  /**
   * Submit a new leave request
   */
  async createLeave({ userId, leaveType, startDate, endDate, reason }) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User account not found.');
      error.statusCode = 404;
      throw error;
    }

    if (user.status !== 'ACTIVE') {
      const error = new Error('Inactive employees cannot apply for leave.');
      error.statusCode = 403;
      throw error;
    }

    // 1. Validate leaveType
    if (!leaveType || !LEAVE_TYPES_LIST.includes(leaveType.toUpperCase())) {
      const error = new Error(`Invalid leave type. Allowed types: ${LEAVE_TYPES_LIST.join(', ')}.`);
      error.statusCode = 400;
      throw error;
    }
    const type = leaveType.toUpperCase();

    // 2. Validate date formats
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!startDate || !endDate || !dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      const error = new Error('Start date and end date must be valid dates in YYYY-MM-DD format.');
      error.statusCode = 400;
      throw error;
    }

    if (startDate > endDate) {
      const error = new Error('Start date cannot be after end date.');
      error.statusCode = 400;
      throw error;
    }

    const today = getTodayDateString();
    if (startDate < today) {
      const error = new Error('Leave cannot be requested for past dates.');
      error.statusCode = 400;
      throw error;
    }

    // 3. Calculate working days (excluding Saturdays & Sundays)
    const totalDays = calculateWorkingDays(startDate, endDate);
    if (totalDays <= 0) {
      const error = new Error('Requested leave date range contains 0 working days (Monday–Friday).');
      error.statusCode = 400;
      throw error;
    }

    // 4. Overlap Prevention: Check for existing PENDING or APPROVED leave
    const overlapping = await Leave.findOne({
      employee: user._id,
      status: { $in: [LEAVE_STATUS.PENDING, LEAVE_STATUS.APPROVED] },
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    });

    if (overlapping) {
      const error = new Error(
        `You already have an active (${overlapping.status.toLowerCase()}) leave request from ${overlapping.startDate} to ${overlapping.endDate} overlapping with this period.`
      );
      error.statusCode = 409;
      throw error;
    }

    // 5. Balance Validation for paid leaves
    if (type !== LEAVE_TYPES.UNPAID) {
      const startYear = parseInt(startDate.slice(0, 4), 10);
      const balance = await this.getMyBalance(user._id, startYear);

      let available = 0;
      if (type === LEAVE_TYPES.ANNUAL) available = balance.annual.available;
      else if (type === LEAVE_TYPES.CASUAL) available = balance.casual.available;
      else if (type === LEAVE_TYPES.SICK) available = balance.sick.available;

      if (totalDays > available) {
        const error = new Error(
          `Insufficient leave balance. You have ${available} day(s) available for ${type} leave, but requested ${totalDays} working day(s).`
        );
        error.statusCode = 400;
        throw error;
      }
    }

    // 6. Reason validation
    if (!reason || reason.trim().length < 3) {
      const error = new Error('Please provide a descriptive reason for the leave request (at least 3 characters).');
      error.statusCode = 400;
      throw error;
    }

    // 7. Create Leave document
    const newLeave = new Leave({
      employee: user._id,
      leaveType: type,
      startDate,
      endDate,
      totalDays,
      reason: reason.trim(),
      status: LEAVE_STATUS.PENDING,
    });

    await newLeave.save();
    await newLeave.populate({
      path: 'employee',
      select: 'name email employeeId role jobTitle department status',
      populate: { path: 'department', select: 'name code' },
    });

    return newLeave.toSafeObject();
  },

  /**
   * Get personal leave history for authenticated employee
   */
  async getMyLeaves({ userId, page = 1, limit = 20, status = '', leaveType = '', from = '', to = '' } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = { employee: userId };

    if (status && LEAVE_STATUS_LIST.includes(status.toUpperCase())) {
      query.status = status.toUpperCase();
    }

    if (leaveType && LEAVE_TYPES_LIST.includes(leaveType.toUpperCase())) {
      query.leaveType = leaveType.toUpperCase();
    }

    if (from && to) {
      query.startDate = { $gte: from };
      query.endDate = { $lte: to };
    } else if (from) {
      query.startDate = { $gte: from };
    } else if (to) {
      query.endDate = { $lte: to };
    }

    const [records, total] = await Promise.all([
      Leave.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate({
          path: 'employee',
          select: 'name email employeeId role jobTitle department status',
          populate: { path: 'department', select: 'name code' },
        })
        .populate({
          path: 'reviewedBy',
          select: 'name email role',
        }),
      Leave.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return {
      records: records.map((r) => r.toSafeObject()),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    };
  },

  /**
   * Get single leave request details by ID
   */
  async getLeaveById({ id, user }) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid leave request ID format.');
      error.statusCode = 400;
      throw error;
    }

    const record = await Leave.findById(id)
      .populate({
        path: 'employee',
        select: 'name email employeeId role jobTitle department status',
        populate: { path: 'department', select: 'name code manager' },
      })
      .populate({
        path: 'reviewedBy',
        select: 'name email role',
      });

    if (!record) {
      const error = new Error('Leave request not found.');
      error.statusCode = 404;
      throw error;
    }

    // RBAC Authorization
    if (user.role === 'ADMIN') {
      return record.toSafeObject();
    }

    if (user.role === 'MANAGER') {
      const empId = record.employee?._id?.toString();
      if (empId === user._id.toString()) {
        return record.toSafeObject();
      }

      const managedDepts = await Department.find({ manager: user._id }).select('_id');
      const managedDeptIds = managedDepts.map((d) => d._id.toString());
      const empDeptId = record.employee?.department?._id?.toString() || record.employee?.department?.toString();

      if (empDeptId && managedDeptIds.includes(empDeptId)) {
        return record.toSafeObject();
      }

      const error = new Error('Unauthorized to view leave requests outside your department.');
      error.statusCode = 403;
      throw error;
    }

    // EMPLOYEE: Own request only
    if (record.employee?._id?.toString() !== user._id.toString()) {
      const error = new Error('Unauthorized to view other employees’ leave requests.');
      error.statusCode = 403;
      throw error;
    }

    return record.toSafeObject();
  },

  /**
   * Cancel personal pending leave request
   */
  async cancelLeave({ id, userId }) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid leave request ID format.');
      error.statusCode = 400;
      throw error;
    }

    const leave = await Leave.findById(id);
    if (!leave) {
      const error = new Error('Leave request not found.');
      error.statusCode = 404;
      throw error;
    }

    if (leave.employee.toString() !== userId.toString()) {
      const error = new Error('You can only cancel your own leave requests.');
      error.statusCode = 403;
      throw error;
    }

    if (leave.status !== LEAVE_STATUS.PENDING) {
      const error = new Error(`Only pending leave requests can be cancelled. Current status is ${leave.status}.`);
      error.statusCode = 400;
      throw error;
    }

    leave.status = LEAVE_STATUS.CANCELLED;
    leave.cancelledAt = new Date();
    await leave.save();

    await leave.populate({
      path: 'employee',
      select: 'name email employeeId role jobTitle department status',
      populate: { path: 'department', select: 'name code' },
    });

    return leave.toSafeObject();
  },

  /**
   * Organization / Department-wide leave requests queue for Admin & Manager
   */
  async getManageLeaves({
    user,
    page = 1,
    limit = 20,
    search = '',
    department = '',
    employee = '',
    status = '',
    leaveType = '',
    from = '',
    to = '',
  } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    let allowedEmployeeIds = null;

    // Manager Scope: Only employees in departments managed by this user
    if (user.role === 'MANAGER') {
      const managedDepts = await Department.find({ manager: user._id }).select('_id');
      const managedDeptIds = managedDepts.map((d) => d._id);

      const scopedUsers = await User.find({
        $or: [
          { department: { $in: managedDeptIds } },
          { _id: user._id },
        ],
      }).select('_id');

      allowedEmployeeIds = scopedUsers.map((u) => u._id);
    }

    const query = {};

    // 1. Employee query / manager scope
    if (employee && mongoose.Types.ObjectId.isValid(employee)) {
      if (allowedEmployeeIds) {
        if (!allowedEmployeeIds.some((id) => id.toString() === employee)) {
          return {
            records: [],
            pagination: { page: pageNum, limit: limitNum, total: 0, totalPages: 1 },
          };
        }
      }
      query.employee = employee;
    } else if (allowedEmployeeIds) {
      query.employee = { $in: allowedEmployeeIds };
    }

    // 2. Department filter
    if (department && department !== 'ALL' && mongoose.Types.ObjectId.isValid(department)) {
      const deptUsers = await User.find({ department }).select('_id');
      const deptUserIds = deptUsers.map((u) => u._id);

      if (query.employee && query.employee.$in) {
        query.employee = {
          $in: query.employee.$in.filter((id) =>
            deptUserIds.some((duId) => duId.toString() === id.toString())
          ),
        };
      } else {
        query.employee = { $in: deptUserIds };
      }
    }

    // 3. Search query across employee name, email, employeeId
    if (search && search.trim()) {
      const sanitized = escapeRegex(search.trim());
      const searchRegex = new RegExp(sanitized, 'i');
      const matchedUsers = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { employeeId: searchRegex },
        ],
      }).select('_id');

      const matchedUserIds = matchedUsers.map((u) => u._id);
      if (query.employee && query.employee.$in) {
        query.employee = {
          $in: query.employee.$in.filter((id) =>
            matchedUserIds.some((muId) => muId.toString() === id.toString())
          ),
        };
      } else {
        query.employee = { $in: matchedUserIds };
      }
    }

    // 4. Status filter
    if (status && LEAVE_STATUS_LIST.includes(status.toUpperCase())) {
      query.status = status.toUpperCase();
    }

    // 5. Leave Type filter
    if (leaveType && LEAVE_TYPES_LIST.includes(leaveType.toUpperCase())) {
      query.leaveType = leaveType.toUpperCase();
    }

    // 6. Date range
    if (from && to) {
      query.startDate = { $gte: from };
      query.endDate = { $lte: to };
    } else if (from) {
      query.startDate = { $gte: from };
    } else if (to) {
      query.endDate = { $lte: to };
    }

    const [records, total] = await Promise.all([
      Leave.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate({
          path: 'employee',
          select: 'name email employeeId role jobTitle department status',
          populate: { path: 'department', select: 'name code' },
        })
        .populate({
          path: 'reviewedBy',
          select: 'name email role',
        }),
      Leave.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return {
      records: records.map((r) => r.toSafeObject()),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    };
  },

  /**
   * Approve a pending leave request (Admin or Department Manager)
   */
  async approveLeave({ id, reviewerUser, reviewComment = '' }) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid leave request ID format.');
      error.statusCode = 400;
      throw error;
    }

    const leave = await Leave.findById(id).populate({
      path: 'employee',
      select: 'name email employeeId role department status',
    });

    if (!leave) {
      const error = new Error('Leave request not found.');
      error.statusCode = 404;
      throw error;
    }

    // 1. Self-approval prevention
    if (leave.employee._id.toString() === reviewerUser._id.toString()) {
      const error = new Error('You cannot approve your own leave request.');
      error.statusCode = 403;
      throw error;
    }

    // 2. Manager scope authorization
    if (reviewerUser.role === 'MANAGER') {
      const managedDepts = await Department.find({ manager: reviewerUser._id }).select('_id');
      const managedDeptIds = managedDepts.map((d) => d._id.toString());
      const empDeptId = leave.employee.department?.toString();

      if (!empDeptId || !managedDeptIds.includes(empDeptId)) {
        const error = new Error('Unauthorized to approve leave requests for employees outside your department.');
        error.statusCode = 403;
        throw error;
      }
    }

    // 3. State transition check (concurrency safe)
    if (leave.status !== LEAVE_STATUS.PENDING) {
      const error = new Error(`Cannot approve leave request: Current status is already ${leave.status}.`);
      error.statusCode = 409;
      throw error;
    }

    // 4. Deduct balance for paid leave types
    if (leave.leaveType !== LEAVE_TYPES.UNPAID) {
      const startYear = parseInt(leave.startDate.slice(0, 4), 10);
      const balance = await this.getOrCreateBalance(leave.employee._id, startYear);

      let usedField = 'usedAnnual';
      let allocatedField = 'annual';
      if (leave.leaveType === LEAVE_TYPES.CASUAL) {
        usedField = 'usedCasual';
        allocatedField = 'casual';
      } else if (leave.leaveType === LEAVE_TYPES.SICK) {
        usedField = 'usedSick';
        allocatedField = 'sick';
      }

      if (balance[usedField] + leave.totalDays > balance[allocatedField]) {
        const error = new Error(
          `Cannot approve leave: Employee has insufficient remaining balance (${balance[allocatedField] - balance[usedField]} days remaining, requires ${leave.totalDays} days).`
        );
        error.statusCode = 400;
        throw error;
      }

      balance[usedField] += leave.totalDays;
      await balance.save();
    }

    // 5. Finalize approval
    leave.status = LEAVE_STATUS.APPROVED;
    leave.reviewedBy = reviewerUser._id;
    leave.reviewedAt = new Date();
    if (reviewComment && reviewComment.trim()) {
      leave.reviewComment = reviewComment.trim();
    }

    await leave.save();
    await leave.populate([
      {
        path: 'employee',
        select: 'name email employeeId role jobTitle department status',
        populate: { path: 'department', select: 'name code' },
      },
      {
        path: 'reviewedBy',
        select: 'name email role',
      },
    ]);

    return leave.toSafeObject();
  },

  /**
   * Reject a pending leave request (Admin or Department Manager)
   */
  async rejectLeave({ id, reviewerUser, reviewComment = '' }) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid leave request ID format.');
      error.statusCode = 400;
      throw error;
    }

    const leave = await Leave.findById(id).populate({
      path: 'employee',
      select: 'name email employeeId role department status',
    });

    if (!leave) {
      const error = new Error('Leave request not found.');
      error.statusCode = 404;
      throw error;
    }

    // 1. Self-approval / self-rejection prevention
    if (leave.employee._id.toString() === reviewerUser._id.toString()) {
      const error = new Error('You cannot review your own leave request.');
      error.statusCode = 403;
      throw error;
    }

    // 2. Manager scope authorization
    if (reviewerUser.role === 'MANAGER') {
      const managedDepts = await Department.find({ manager: reviewerUser._id }).select('_id');
      const managedDeptIds = managedDepts.map((d) => d._id.toString());
      const empDeptId = leave.employee.department?.toString();

      if (!empDeptId || !managedDeptIds.includes(empDeptId)) {
        const error = new Error('Unauthorized to reject leave requests for employees outside your department.');
        error.statusCode = 403;
        throw error;
      }
    }

    // 3. State transition check
    if (leave.status !== LEAVE_STATUS.PENDING) {
      const error = new Error(`Cannot reject leave request: Current status is already ${leave.status}.`);
      error.statusCode = 409;
      throw error;
    }

    leave.status = LEAVE_STATUS.REJECTED;
    leave.reviewedBy = reviewerUser._id;
    leave.reviewedAt = new Date();
    if (reviewComment && reviewComment.trim()) {
      leave.reviewComment = reviewComment.trim();
    }

    await leave.save();
    await leave.populate([
      {
        path: 'employee',
        select: 'name email employeeId role jobTitle department status',
        populate: { path: 'department', select: 'name code' },
      },
      {
        path: 'reviewedBy',
        select: 'name email role',
      },
    ]);

    return leave.toSafeObject();
  },
};

export default leaveService;
