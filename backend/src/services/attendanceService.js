import mongoose from 'mongoose';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import {
  getTodayDateString,
  isLateCheckIn,
  ATTENDANCE_STATUS,
  ATTENDANCE_STATUS_LIST,
} from '../constants/attendance.js';

// Helper to escape regex special characters
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const attendanceService = {
  /**
   * Check in authenticated employee for today
   */
  async checkIn(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    if (user.status !== 'ACTIVE') {
      const error = new Error('Inactive employees cannot perform attendance check-in.');
      error.statusCode = 403;
      throw error;
    }

    const today = getTodayDateString();
    let record = await Attendance.findOne({ employee: user._id, date: today });

    if (record && record.checkIn) {
      const error = new Error('Attendance already checked in for today.');
      error.statusCode = 409;
      throw error;
    }

    const now = new Date();
    const initialStatus = isLateCheckIn(now) ? ATTENDANCE_STATUS.LATE : ATTENDANCE_STATUS.PRESENT;

    if (!record) {
      record = new Attendance({
        employee: user._id,
        date: today,
        checkIn: now,
        status: initialStatus,
        totalMinutes: 0,
      });
    } else {
      record.checkIn = now;
      record.status = initialStatus;
    }

    await record.save();
    await record.populate({
      path: 'employee',
      select: 'name email employeeId role jobTitle department status',
      populate: { path: 'department', select: 'name code' },
    });

    return record.toSafeObject();
  },

  /**
   * Check out authenticated employee for today
   */
  async checkOut(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    if (user.status !== 'ACTIVE') {
      const error = new Error('Inactive employees cannot perform attendance check-out.');
      error.statusCode = 403;
      throw error;
    }

    const today = getTodayDateString();
    const record = await Attendance.findOne({ employee: user._id, date: today });

    if (!record || !record.checkIn) {
      const error = new Error('Check in before checking out.');
      error.statusCode = 400;
      throw error;
    }

    if (record.checkOut) {
      const error = new Error('Attendance already checked out for today.');
      error.statusCode = 409;
      throw error;
    }

    const now = new Date();
    if (now.getTime() < record.checkIn.getTime()) {
      const error = new Error('Check-out timestamp cannot be earlier than check-in.');
      error.statusCode = 400;
      throw error;
    }

    const diffMs = now.getTime() - record.checkIn.getTime();
    const totalMinutes = Math.max(0, Math.round(diffMs / (1000 * 60)));

    record.checkOut = now;
    record.totalMinutes = totalMinutes;

    await record.save();
    await record.populate({
      path: 'employee',
      select: 'name email employeeId role jobTitle department status',
      populate: { path: 'department', select: 'name code' },
    });

    return record.toSafeObject();
  },

  /**
   * Get today's attendance state for the authenticated employee
   */
  async getTodayAttendance(userId) {
    const today = getTodayDateString();
    const record = await Attendance.findOne({ employee: userId, date: today }).populate({
      path: 'employee',
      select: 'name email employeeId role jobTitle department status',
      populate: { path: 'department', select: 'name code' },
    });

    if (record) {
      return record.toSafeObject();
    }

    return {
      id: null,
      employee: { id: userId.toString() },
      date: today,
      checkIn: null,
      checkOut: null,
      status: 'NOT_CHECKED_IN',
      totalMinutes: 0,
      isCheckedIn: false,
      isCheckedOut: false,
      notes: '',
    };
  },

  /**
   * Get paginated attendance history for the authenticated employee
   */
  async getMyAttendance({ userId, page = 1, limit = 20, from, to, status } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = { employee: userId };

    if (status && ATTENDANCE_STATUS_LIST.includes(status.toUpperCase())) {
      query.status = status.toUpperCase();
    }

    if (from && to) {
      query.date = { $gte: from, $lte: to };
    } else if (from) {
      query.date = { $gte: from };
    } else if (to) {
      query.date = { $lte: to };
    }

    const [records, total] = await Promise.all([
      Attendance.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate({
          path: 'employee',
          select: 'name email employeeId role jobTitle department status',
          populate: { path: 'department', select: 'name code' },
        }),
      Attendance.countDocuments(query),
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
   * Get monthly attendance summary for the authenticated employee
   */
  async getMySummary({ userId, month } = {}) {
    const currentMonthStr = getTodayDateString().slice(0, 7);
    const selectedMonth = month || currentMonthStr;

    if (!/^\d{4}-\d{2}$/.test(selectedMonth)) {
      const error = new Error("Invalid month format. Expected 'YYYY-MM'.");
      error.statusCode = 400;
      throw error;
    }

    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr, 10);
    const monthNum = parseInt(monthStr, 10);

    // Calculate total working days in the month (Monday-Friday)
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    let totalWorkingDays = 0;
    let pastWorkingDays = 0;
    const todayStr = getTodayDateString();

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, monthNum - 1, day);
      const dayOfWeek = d.getDay(); // 0 = Sunday, 6 = Saturday
      const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
      if (isWeekday) {
        totalWorkingDays++;
        const dateStr = `${yearStr}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (dateStr <= todayStr) {
          pastWorkingDays++;
        }
      }
    }

    // Fetch all attendance records for this month
    const records = await Attendance.find({
      employee: userId,
      date: {
        $gte: `${selectedMonth}-01`,
        $lte: `${selectedMonth}-${String(daysInMonth).padStart(2, '0')}`,
      },
    });

    let presentDays = 0;
    let lateDays = 0;
    let halfDays = 0;
    let onLeaveDays = 0;
    let totalWorkedMinutes = 0;
    let checkedOutDaysCount = 0;

    records.forEach((r) => {
      if (r.status === ATTENDANCE_STATUS.PRESENT) presentDays++;
      else if (r.status === ATTENDANCE_STATUS.LATE) lateDays++;
      else if (r.status === ATTENDANCE_STATUS.HALF_DAY) halfDays++;
      else if (r.status === ATTENDANCE_STATUS.ON_LEAVE) onLeaveDays++;

      if (r.totalMinutes && r.totalMinutes > 0) {
        totalWorkedMinutes += r.totalMinutes;
        checkedOutDaysCount++;
      }
    });

    const totalAttended = presentDays + lateDays + halfDays;
    const absentDays = Math.max(0, pastWorkingDays - totalAttended - onLeaveDays);
    const averageWorkedMinutes = checkedOutDaysCount > 0 ? Math.round(totalWorkedMinutes / checkedOutDaysCount) : 0;

    return {
      month: selectedMonth,
      workingDays: totalWorkingDays,
      pastWorkingDays,
      attendedDays: totalAttended,
      presentDays,
      lateDays,
      halfDays,
      absentDays,
      onLeaveDays,
      totalWorkedMinutes,
      totalWorkedHours: Number((totalWorkedMinutes / 60).toFixed(1)),
      averageWorkedMinutes,
      averageWorkedHours: Number((averageWorkedMinutes / 60).toFixed(1)),
      attendanceRate: pastWorkingDays > 0 ? Math.min(100, Math.round((totalAttended / pastWorkingDays) * 100)) : 100,
    };
  },

  /**
   * Get organization/department attendance list for Admin and Manager
   */
  async getAttendance({
    user,
    page = 1,
    limit = 20,
    employee = '',
    department = '',
    status = '',
    from = '',
    to = '',
    search = '',
  } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    let allowedEmployeeIds = null;

    // Manager Scope: Only employees belonging to departments managed by this user
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
    if (status && ATTENDANCE_STATUS_LIST.includes(status.toUpperCase())) {
      query.status = status.toUpperCase();
    }

    // 5. Date filter (defaults to today if no date specified to keep monitoring focused)
    if (from && to) {
      query.date = { $gte: from, $lte: to };
    } else if (from) {
      query.date = { $gte: from };
    } else if (to) {
      query.date = { $lte: to };
    }

    const [records, total] = await Promise.all([
      Attendance.find(query)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate({
          path: 'employee',
          select: 'name email employeeId role jobTitle department status',
          populate: { path: 'department', select: 'name code' },
        }),
      Attendance.countDocuments(query),
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
   * Get single attendance record by ID with authorization verification
   */
  async getAttendanceById({ id, user }) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid attendance record ID format.');
      error.statusCode = 400;
      throw error;
    }

    const record = await Attendance.findById(id).populate({
      path: 'employee',
      select: 'name email employeeId role jobTitle department status',
      populate: { path: 'department', select: 'name code manager' },
    });

    if (!record) {
      const error = new Error('Attendance record not found.');
      error.statusCode = 404;
      throw error;
    }

    // Authorization check
    if (user.role === 'ADMIN') {
      return record.toSafeObject();
    }

    if (user.role === 'MANAGER') {
      const recordEmpId = record.employee?._id?.toString();
      if (recordEmpId === user._id.toString()) {
        return record.toSafeObject();
      }

      const managedDepts = await Department.find({ manager: user._id }).select('_id');
      const managedDeptIds = managedDepts.map((d) => d._id.toString());
      const empDeptId = record.employee?.department?._id?.toString() || record.employee?.department?.toString();

      if (empDeptId && managedDeptIds.includes(empDeptId)) {
        return record.toSafeObject();
      }

      const error = new Error('Unauthorized to view attendance for employees outside your department.');
      error.statusCode = 403;
      throw error;
    }

    // EMPLOYEE: Own records only
    if (record.employee?._id?.toString() !== user._id.toString()) {
      const error = new Error('Unauthorized to view other employees’ attendance records.');
      error.statusCode = 403;
      throw error;
    }

    return record.toSafeObject();
  },
};

export default attendanceService;
