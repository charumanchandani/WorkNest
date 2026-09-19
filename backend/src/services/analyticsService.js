import mongoose from 'mongoose';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';
import {
  ATTENDANCE_STATUS,
  getTodayDateString,
} from '../constants/attendance.js';
import {
  LEAVE_TYPES,
  LEAVE_STATUS,
} from '../constants/leave.js';
import {
  TASK_STATUS,
  TASK_PRIORITY,
} from '../constants/task.js';

/**
 * Validates and normalizes date range parameters (YYYY-MM-DD).
 * Defaults to the current calendar month if omitted.
 */
export const parseDateRange = (fromStr, toStr) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  const isValidDate = (str) => {
    if (!dateRegex.test(str)) return false;
    const [year, month, day] = str.split('-').map(Number);
    if (year < 2000 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return false;
    const d = new Date(Date.UTC(year, month - 1, day));
    return (
      d.getUTCFullYear() === year &&
      d.getUTCMonth() === month - 1 &&
      d.getUTCDate() === day
    );
  };

  const todayStr = getTodayDateString();
  const [currentYear, currentMonth] = todayStr.split('-').map(Number);

  let from = fromStr;
  let to = toStr;

  if (from && !isValidDate(from)) {
    const error = new Error("Invalid 'from' date format. Expected YYYY-MM-DD.");
    error.statusCode = 400;
    throw error;
  }

  if (to && !isValidDate(to)) {
    const error = new Error("Invalid 'to' date format. Expected YYYY-MM-DD.");
    error.statusCode = 400;
    throw error;
  }

  if (!from && !to) {
    // Default: current calendar month
    const startMonthStr = String(currentMonth).padStart(2, '0');
    from = `${currentYear}-${startMonthStr}-01`;

    const lastDay = new Date(currentYear, currentMonth, 0).getDate();
    to = `${currentYear}-${startMonthStr}-${String(lastDay).padStart(2, '0')}`;
  } else if (from && !to) {
    to = todayStr > from ? todayStr : from;
  } else if (!from && to) {
    const [toYear, toMonth] = to.split('-').map(Number);
    from = `${toYear}-${String(toMonth).padStart(2, '0')}-01`;
  }

  if (from > to) {
    const error = new Error("'from' date cannot be greater than 'to' date.");
    error.statusCode = 400;
    throw error;
  }

  return { from, to };
};

/**
 * Derives RBAC scope for a given user
 */
export const getScopedContext = async (user) => {
  if (user.role === 'ADMIN') {
    return {
      role: 'ADMIN',
      isAdmin: true,
      isManager: false,
      isEmployee: false,
      managedDeptIds: null,
      managedUserIds: null,
    };
  }

  if (user.role === 'MANAGER') {
    const managedDepts = await Department.find({ manager: user._id }).select('_id');
    const managedDeptIds = managedDepts.map((d) => d._id);

    const teamUsers = await User.find({
      $or: [{ department: { $in: managedDeptIds } }, { _id: user._id }],
    }).select('_id');
    const managedUserIds = teamUsers.map((u) => u._id);

    return {
      role: 'MANAGER',
      isAdmin: false,
      isManager: true,
      isEmployee: false,
      managedDeptIds,
      managedUserIds,
    };
  }

  return {
    role: 'EMPLOYEE',
    isAdmin: false,
    isManager: false,
    isEmployee: true,
    managedDeptIds: [],
    managedUserIds: [user._id],
  };
};

/**
 * Analytics Service Implementation
 */
export const analyticsService = {
  /**
   * 1. Overview Metrics (Role-Aware)
   */
  async getOverviewAnalytics({ user, from, to }) {
    const { from: fromDate, to: toDate } = parseDateRange(from, to);
    const scope = await getScopedContext(user);
    const today = getTodayDateString();

    if (scope.isAdmin) {
      // Organization-wide Admin Overview
      const [
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        totalDepartments,
        activeDepartments,
        todayAttendanceRecords,
        pendingLeaves,
        allTasks,
        recentActivitiesCount,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ status: 'ACTIVE' }),
        User.countDocuments({ status: 'INACTIVE' }),
        Department.countDocuments(),
        Department.countDocuments({ status: 'ACTIVE' }),
        Attendance.find({ date: today }).select('status'),
        Leave.countDocuments({ status: LEAVE_STATUS.PENDING }),
        Task.find().select('status dueDate'),
        Activity.countDocuments({
          createdAt: {
            $gte: new Date(`${fromDate}T00:00:00.000Z`),
            $lte: new Date(`${toDate}T23:59:59.999Z`),
          },
        }),
      ]);

      const presentTodayCount = todayAttendanceRecords.filter(
        (a) => a.status === ATTENDANCE_STATUS.PRESENT || a.status === ATTENDANCE_STATUS.LATE
      ).length;

      const attendanceRate =
        activeEmployees > 0
          ? Math.round((presentTodayCount / activeEmployees) * 100)
          : 0;

      let openTasks = 0;
      let overdueTasks = 0;
      let completedTasks = 0;

      allTasks.forEach((t) => {
        if (t.status === TASK_STATUS.COMPLETED) {
          completedTasks++;
        } else if (t.status !== TASK_STATUS.CANCELLED) {
          openTasks++;
          if (t.dueDate < today) {
            overdueTasks++;
          }
        }
      });

      return {
        scope: 'ORGANIZATION',
        dateRange: { from: fromDate, to: toDate },
        employees: {
          total: totalEmployees,
          active: activeEmployees,
          inactive: inactiveEmployees,
        },
        departments: {
          total: totalDepartments,
          active: activeDepartments,
        },
        attendance: {
          todayPresent: presentTodayCount,
          todayTotal: todayAttendanceRecords.length,
          attendanceRate,
        },
        leaves: {
          pending: pendingLeaves,
        },
        tasks: {
          open: openTasks,
          overdue: overdueTasks,
          completed: completedTasks,
          total: allTasks.length,
        },
        activities: {
          recentCount: recentActivitiesCount,
        },
      };
    }

    if (scope.isManager) {
      // Managed Team / Department Scope for Manager
      const [
        teamEmployees,
        activeTeamEmployees,
        inactiveTeamEmployees,
        managedDeptsCount,
        activeManagedDeptsCount,
        todayTeamAttendance,
        pendingTeamLeaves,
        teamTasks,
        teamActivitiesCount,
      ] = await Promise.all([
        User.countDocuments({ _id: { $in: scope.managedUserIds } }),
        User.countDocuments({ _id: { $in: scope.managedUserIds }, status: 'ACTIVE' }),
        User.countDocuments({ _id: { $in: scope.managedUserIds }, status: 'INACTIVE' }),
        Department.countDocuments({ _id: { $in: scope.managedDeptIds } }),
        Department.countDocuments({ _id: { $in: scope.managedDeptIds }, status: 'ACTIVE' }),
        Attendance.find({
          date: today,
          employee: { $in: scope.managedUserIds },
        }).select('status'),
        Leave.countDocuments({
          employee: { $in: scope.managedUserIds },
          status: LEAVE_STATUS.PENDING,
        }),
        Task.find({
          $or: [
            { department: { $in: scope.managedDeptIds } },
            { assignedTo: { $in: scope.managedUserIds } },
            { assignedBy: user._id },
          ],
        }).select('status dueDate'),
        Activity.countDocuments({
          actor: { $in: scope.managedUserIds },
          createdAt: {
            $gte: new Date(`${fromDate}T00:00:00.000Z`),
            $lte: new Date(`${toDate}T23:59:59.999Z`),
          },
        }),
      ]);

      const presentTodayCount = todayTeamAttendance.filter(
        (a) => a.status === ATTENDANCE_STATUS.PRESENT || a.status === ATTENDANCE_STATUS.LATE
      ).length;

      const attendanceRate =
        activeTeamEmployees > 0
          ? Math.round((presentTodayCount / activeTeamEmployees) * 100)
          : 0;

      let openTasks = 0;
      let overdueTasks = 0;
      let completedTasks = 0;

      teamTasks.forEach((t) => {
        if (t.status === TASK_STATUS.COMPLETED) {
          completedTasks++;
        } else if (t.status !== TASK_STATUS.CANCELLED) {
          openTasks++;
          if (t.dueDate < today) {
            overdueTasks++;
          }
        }
      });

      return {
        scope: 'TEAM',
        dateRange: { from: fromDate, to: toDate },
        employees: {
          total: teamEmployees,
          active: activeTeamEmployees,
          inactive: inactiveTeamEmployees,
        },
        departments: {
          total: managedDeptsCount,
          active: activeManagedDeptsCount,
        },
        attendance: {
          todayPresent: presentTodayCount,
          todayTotal: todayTeamAttendance.length,
          attendanceRate,
        },
        leaves: {
          pending: pendingTeamLeaves,
        },
        tasks: {
          open: openTasks,
          overdue: overdueTasks,
          completed: completedTasks,
          total: teamTasks.length,
        },
        activities: {
          recentCount: teamActivitiesCount,
        },
      };
    }

    // Individual Employee Overview (Personal Scope)
    const [
      todayAttendance,
      periodAttendance,
      myPendingLeaves,
      myApprovedLeaves,
      myTasks,
      myActivitiesCount,
    ] = await Promise.all([
      Attendance.findOne({ employee: user._id, date: today }),
      Attendance.find({ employee: user._id, date: { $gte: fromDate, $lte: toDate } }),
      Leave.countDocuments({ employee: user._id, status: LEAVE_STATUS.PENDING }),
      Leave.find({
        employee: user._id,
        status: LEAVE_STATUS.APPROVED,
        startDate: { $lte: toDate },
        endDate: { $gte: fromDate },
      }).select('totalDays'),
      Task.find({ assignedTo: user._id }).select('status dueDate'),
      Activity.countDocuments({
        actor: user._id,
        createdAt: {
          $gte: new Date(`${fromDate}T00:00:00.000Z`),
          $lte: new Date(`${toDate}T23:59:59.999Z`),
        },
      }),
    ]);

    let openTasks = 0;
    let overdueTasks = 0;
    let completedTasks = 0;

    myTasks.forEach((t) => {
      if (t.status === TASK_STATUS.COMPLETED) {
        completedTasks++;
      } else if (t.status !== TASK_STATUS.CANCELLED) {
        openTasks++;
        if (t.dueDate < today) {
          overdueTasks++;
        }
      }
    });

    const presentDays = periodAttendance.filter(
      (a) => a.status === ATTENDANCE_STATUS.PRESENT || a.status === ATTENDANCE_STATUS.LATE
    ).length;

    const totalApprovedLeaveDays = myApprovedLeaves.reduce(
      (acc, l) => acc + (l.totalDays || 0),
      0
    );

    return {
      scope: 'PERSONAL',
      dateRange: { from: fromDate, to: toDate },
      attendance: {
        todayRecord: todayAttendance ? todayAttendance.toSafeObject() : null,
        periodPresentDays: presentDays,
        periodTotalRecords: periodAttendance.length,
      },
      leaves: {
        pending: myPendingLeaves,
        approvedDaysInPeriod: totalApprovedLeaveDays,
      },
      tasks: {
        open: openTasks,
        overdue: overdueTasks,
        completed: completedTasks,
        total: myTasks.length,
      },
      activities: {
        recentCount: myActivitiesCount,
      },
    };
  },

  /**
   * 2. Attendance Analytics
   */
  async getAttendanceAnalytics({ user, from, to, department, employeeId }) {
    const { from: fromDate, to: toDate } = parseDateRange(from, to);
    const scope = await getScopedContext(user);

    const query = {
      date: { $gte: fromDate, $lte: toDate },
    };

    // Apply RBAC and filters
    if (scope.isEmployee) {
      query.employee = user._id;
    } else if (scope.isManager) {
      let allowedUserIds = scope.managedUserIds;

      if (department && department !== 'ALL' && mongoose.Types.ObjectId.isValid(department)) {
        if (!scope.managedDeptIds.some((id) => id.toString() === department)) {
          const error = new Error('Access denied to department outside your management scope.');
          error.statusCode = 403;
          throw error;
        }
        const deptUsers = await User.find({ department }).select('_id');
        allowedUserIds = deptUsers.map((u) => u._id);
      }

      if (employeeId && mongoose.Types.ObjectId.isValid(employeeId)) {
        if (!allowedUserIds.some((id) => id.toString() === employeeId)) {
          const error = new Error('Access denied to employee outside your team.');
          error.statusCode = 403;
          throw error;
        }
        query.employee = employeeId;
      } else {
        query.employee = { $in: allowedUserIds };
      }
    } else if (scope.isAdmin) {
      if (department && department !== 'ALL' && mongoose.Types.ObjectId.isValid(department)) {
        const deptUsers = await User.find({ department }).select('_id');
        const deptUserIds = deptUsers.map((u) => u._id);
        if (employeeId && mongoose.Types.ObjectId.isValid(employeeId)) {
          query.employee = employeeId;
        } else {
          query.employee = { $in: deptUserIds };
        }
      } else if (employeeId && mongoose.Types.ObjectId.isValid(employeeId)) {
        query.employee = employeeId;
      }
    }

    const records = await Attendance.find(query).populate({
      path: 'employee',
      select: 'name email employeeId department status',
      populate: { path: 'department', select: 'name code' },
    });

    let present = 0;
    let late = 0;
    let halfDay = 0;
    let absent = 0;
    let onLeave = 0;
    let totalMinutes = 0;

    const trendMap = {};

    records.forEach((r) => {
      totalMinutes += r.totalMinutes || 0;
      switch (r.status) {
        case ATTENDANCE_STATUS.PRESENT:
          present++;
          break;
        case ATTENDANCE_STATUS.LATE:
          late++;
          break;
        case ATTENDANCE_STATUS.HALF_DAY:
          halfDay++;
          break;
        case ATTENDANCE_STATUS.ABSENT:
          absent++;
          break;
        case ATTENDANCE_STATUS.ON_LEAVE:
          onLeave++;
          break;
        default:
          break;
      }

      if (!trendMap[r.date]) {
        trendMap[r.date] = {
          date: r.date,
          present: 0,
          late: 0,
          halfDay: 0,
          absent: 0,
          onLeave: 0,
          totalMinutes: 0,
          count: 0,
        };
      }
      if (r.status === ATTENDANCE_STATUS.PRESENT) trendMap[r.date].present++;
      else if (r.status === ATTENDANCE_STATUS.LATE) trendMap[r.date].late++;
      else if (r.status === ATTENDANCE_STATUS.HALF_DAY) trendMap[r.date].halfDay++;
      else if (r.status === ATTENDANCE_STATUS.ABSENT) trendMap[r.date].absent++;
      else if (r.status === ATTENDANCE_STATUS.ON_LEAVE) trendMap[r.date].onLeave++;
      trendMap[r.date].totalMinutes += r.totalMinutes || 0;
      trendMap[r.date].count++;
    });

    const trend = Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date));
    const totalRecords = records.length;
    const productiveRecords = present + late + halfDay;
    const totalHours = Number((totalMinutes / 60).toFixed(1));
    const averageHoursPerDay =
      productiveRecords > 0 ? Number((totalHours / productiveRecords).toFixed(1)) : 0;
    const attendanceRate =
      totalRecords > 0 ? Math.round((productiveRecords / totalRecords) * 100) : 0;

    return {
      dateRange: { from: fromDate, to: toDate },
      summary: {
        totalRecords,
        presentCount: present,
        lateCount: late,
        halfDayCount: halfDay,
        absentCount: absent,
        onLeaveCount: onLeave,
        totalMinutes,
        totalHours,
        averageHoursPerDay,
        attendanceRate,
      },
      trend,
    };
  },

  /**
   * 3. Leave Analytics
   */
  async getLeaveAnalytics({ user, from, to, department }) {
    const { from: fromDate, to: toDate } = parseDateRange(from, to);
    const scope = await getScopedContext(user);

    const query = {
      $or: [
        { startDate: { $gte: fromDate, $lte: toDate } },
        { endDate: { $gte: fromDate, $lte: toDate } },
        { startDate: { $lte: fromDate }, endDate: { $gte: toDate } },
      ],
    };

    if (scope.isEmployee) {
      query.employee = user._id;
    } else if (scope.isManager) {
      let allowedUserIds = scope.managedUserIds;
      if (department && department !== 'ALL' && mongoose.Types.ObjectId.isValid(department)) {
        if (!scope.managedDeptIds.some((id) => id.toString() === department)) {
          const error = new Error('Access denied to department outside your management scope.');
          error.statusCode = 403;
          throw error;
        }
        const deptUsers = await User.find({ department }).select('_id');
        allowedUserIds = deptUsers.map((u) => u._id);
      }
      query.employee = { $in: allowedUserIds };
    } else if (scope.isAdmin) {
      if (department && department !== 'ALL' && mongoose.Types.ObjectId.isValid(department)) {
        const deptUsers = await User.find({ department }).select('_id');
        const deptUserIds = deptUsers.map((u) => u._id);
        query.employee = { $in: deptUserIds };
      }
    }

    const leaves = await Leave.find(query).populate({
      path: 'employee',
      select: 'name email department',
      populate: { path: 'department', select: 'name code' },
    });

    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let cancelled = 0;
    let totalApprovedDays = 0;

    const byType = {
      [LEAVE_TYPES.ANNUAL]: { count: 0, days: 0 },
      [LEAVE_TYPES.CASUAL]: { count: 0, days: 0 },
      [LEAVE_TYPES.SICK]: { count: 0, days: 0 },
      [LEAVE_TYPES.UNPAID]: { count: 0, days: 0 },
    };

    const departmentUsage = {};

    leaves.forEach((l) => {
      switch (l.status) {
        case LEAVE_STATUS.PENDING:
          pending++;
          break;
        case LEAVE_STATUS.APPROVED:
          approved++;
          totalApprovedDays += l.totalDays || 0;
          if (byType[l.leaveType]) {
            byType[l.leaveType].count++;
            byType[l.leaveType].days += l.totalDays || 0;
          }
          if (l.employee?.department) {
            const deptName = l.employee.department.name || 'Unknown';
            if (!departmentUsage[deptName]) {
              departmentUsage[deptName] = { name: deptName, approvedDays: 0, requestsCount: 0 };
            }
            departmentUsage[deptName].approvedDays += l.totalDays || 0;
            departmentUsage[deptName].requestsCount++;
          }
          break;
        case LEAVE_STATUS.REJECTED:
          rejected++;
          break;
        case LEAVE_STATUS.CANCELLED:
          cancelled++;
          break;
        default:
          break;
      }
    });

    // Determine most used leave type
    let mostUsedType = null;
    let maxDays = -1;
    Object.entries(byType).forEach(([type, data]) => {
      if (data.days > maxDays) {
        maxDays = data.days;
        mostUsedType = type;
      }
    });

    return {
      dateRange: { from: fromDate, to: toDate },
      summary: {
        totalRequests: leaves.length,
        pending,
        approved,
        rejected,
        cancelled,
        totalApprovedDays,
        mostUsedType: maxDays > 0 ? mostUsedType : 'None',
      },
      byType,
      departmentUsage: Object.values(departmentUsage),
    };
  },

  /**
   * 4. Task Analytics
   */
  async getTaskAnalytics({ user, from, to, department, priority }) {
    const { from: fromDate, to: toDate } = parseDateRange(from, to);
    const scope = await getScopedContext(user);
    const today = getTodayDateString();

    const query = {
      $or: [
        { dueDate: { $gte: fromDate, $lte: toDate } },
        { createdAt: { $gte: new Date(`${fromDate}T00:00:00.000Z`), $lte: new Date(`${toDate}T23:59:59.999Z`) } },
      ],
    };

    if (scope.isEmployee) {
      query.assignedTo = user._id;
    } else if (scope.isManager) {
      if (department && department !== 'ALL' && mongoose.Types.ObjectId.isValid(department)) {
        if (!scope.managedDeptIds.some((id) => id.toString() === department)) {
          const error = new Error('Access denied to department outside your management scope.');
          error.statusCode = 403;
          throw error;
        }
        query.department = department;
      } else {
        query.$or = [
          { department: { $in: scope.managedDeptIds } },
          { assignedTo: { $in: scope.managedUserIds } },
          { assignedBy: user._id },
        ];
      }
    } else if (scope.isAdmin) {
      if (department && department !== 'ALL' && mongoose.Types.ObjectId.isValid(department)) {
        query.department = department;
      }
    }

    if (priority && priority !== 'ALL' && Object.values(TASK_PRIORITY).includes(priority.toUpperCase())) {
      query.priority = priority.toUpperCase();
    }

    const tasks = await Task.find(query).populate('department', 'name code');

    let todo = 0;
    let inProgress = 0;
    let completed = 0;
    let cancelled = 0;
    let overdue = 0;

    const byPriority = {
      [TASK_PRIORITY.LOW]: { total: 0, completed: 0 },
      [TASK_PRIORITY.MEDIUM]: { total: 0, completed: 0 },
      [TASK_PRIORITY.HIGH]: { total: 0, completed: 0 },
      [TASK_PRIORITY.URGENT]: { total: 0, completed: 0 },
    };

    const departmentWorkload = {};
    let totalCompletionDurationDays = 0;
    let completedWithDurationCount = 0;

    tasks.forEach((t) => {
      // Overdue definition matching Task model: status != COMPLETED and != CANCELLED and dueDate < today
      const isOverdue =
        t.status !== TASK_STATUS.COMPLETED &&
        t.status !== TASK_STATUS.CANCELLED &&
        t.dueDate < today;

      if (isOverdue) overdue++;

      switch (t.status) {
        case TASK_STATUS.TODO:
          todo++;
          break;
        case TASK_STATUS.IN_PROGRESS:
          inProgress++;
          break;
        case TASK_STATUS.COMPLETED:
          completed++;
          if (t.completedAt && t.createdAt) {
            const diffMs = new Date(t.completedAt).getTime() - new Date(t.createdAt).getTime();
            const days = Math.max(0, diffMs / (1000 * 60 * 60 * 24));
            totalCompletionDurationDays += days;
            completedWithDurationCount++;
          }
          break;
        case TASK_STATUS.CANCELLED:
          cancelled++;
          break;
        default:
          break;
      }

      if (byPriority[t.priority]) {
        byPriority[t.priority].total++;
        if (t.status === TASK_STATUS.COMPLETED) {
          byPriority[t.priority].completed++;
        }
      }

      const deptName = t.department?.name || 'Unassigned';
      if (!departmentWorkload[deptName]) {
        departmentWorkload[deptName] = {
          name: deptName,
          total: 0,
          completed: 0,
          open: 0,
          overdue: 0,
        };
      }
      departmentWorkload[deptName].total++;
      if (t.status === TASK_STATUS.COMPLETED) {
        departmentWorkload[deptName].completed++;
      } else if (t.status !== TASK_STATUS.CANCELLED) {
        departmentWorkload[deptName].open++;
        if (isOverdue) departmentWorkload[deptName].overdue++;
      }
    });

    const activeTasks = tasks.length - cancelled;
    const completionRate =
      activeTasks > 0 ? Math.round((completed / activeTasks) * 100) : 0;
    const avgCompletionDays =
      completedWithDurationCount > 0
        ? Number((totalCompletionDurationDays / completedWithDurationCount).toFixed(1))
        : 0;

    return {
      dateRange: { from: fromDate, to: toDate },
      summary: {
        totalTasks: tasks.length,
        todo,
        inProgress,
        completed,
        cancelled,
        overdue,
        completionRate,
        avgCompletionDays,
      },
      byPriority,
      departmentWorkload: Object.values(departmentWorkload),
    };
  },

  /**
   * 5. Employee Analytics (Admin & Manager only)
   */
  async getEmployeeAnalytics({ user }) {
    const scope = await getScopedContext(user);
    if (scope.isEmployee) {
      const error = new Error('Access denied: Employees cannot view organization employee analytics.');
      error.statusCode = 403;
      throw error;
    }

    const query = {};
    if (scope.isManager) {
      query._id = { $in: scope.managedUserIds };
    }

    const employees = await User.find(query)
      .populate('department', 'name code')
      .select('name email employeeId role jobTitle department status joiningDate');

    let active = 0;
    let inactive = 0;
    const byRole = { ADMIN: 0, MANAGER: 0, EMPLOYEE: 0 };
    const byDept = {};

    employees.forEach((emp) => {
      if (emp.status === 'ACTIVE') active++;
      else inactive++;

      if (byRole[emp.role] !== undefined) byRole[emp.role]++;

      const deptName = emp.department?.name || 'Unassigned';
      if (!byDept[deptName]) {
        byDept[deptName] = { name: deptName, count: 0, activeCount: 0 };
      }
      byDept[deptName].count++;
      if (emp.status === 'ACTIVE') byDept[deptName].activeCount++;
    });

    // Recent joins (sorted by joiningDate descending)
    const recentJoins = [...employees]
      .filter((e) => e.joiningDate)
      .sort((a, b) => new Date(b.joiningDate) - new Date(a.joiningDate))
      .slice(0, 5)
      .map((e) => ({
        id: e._id.toString(),
        name: e.name,
        email: e.email,
        employeeId: e.employeeId,
        role: e.role,
        jobTitle: e.jobTitle,
        department: e.department?.name || 'Unassigned',
        joiningDate: e.joiningDate,
        status: e.status,
      }));

    return {
      scope: scope.role,
      summary: {
        totalEmployees: employees.length,
        active,
        inactive,
      },
      byStatus: { ACTIVE: active, INACTIVE: inactive },
      byRole,
      byDepartment: Object.values(byDept),
      recentJoins,
    };
  },

  /**
   * 6. Department Analytics (Admin & Manager only)
   */
  async getDepartmentAnalytics({ user }) {
    const scope = await getScopedContext(user);
    if (scope.isEmployee) {
      const error = new Error('Access denied: Employees cannot view organization department analytics.');
      error.statusCode = 403;
      throw error;
    }

    const deptQuery = {};
    if (scope.isManager) {
      deptQuery._id = { $in: scope.managedDeptIds };
    }

    const departments = await Department.find(deptQuery).populate('manager', 'name email role jobTitle');
    const today = getTodayDateString();

    const results = await Promise.all(
      departments.map(async (dept) => {
        const deptEmployees = await User.find({ department: dept._id }).select('_id status');
        const employeeIds = deptEmployees.map((e) => e._id);
        const activeCount = deptEmployees.filter((e) => e.status === 'ACTIVE').length;

        // Department tasks
        const tasks = await Task.find({
          $or: [{ department: dept._id }, { assignedTo: { $in: employeeIds } }],
        }).select('status dueDate');

        let completedTasks = 0;
        let openTasks = 0;
        let overdueTasks = 0;

        tasks.forEach((t) => {
          if (t.status === TASK_STATUS.COMPLETED) {
            completedTasks++;
          } else if (t.status !== TASK_STATUS.CANCELLED) {
            openTasks++;
            if (t.dueDate < today) overdueTasks++;
          }
        });

        // Department attendance rate (today)
        const todayAttendance = await Attendance.find({
          employee: { $in: employeeIds },
          date: today,
        }).select('status');

        const presentToday = todayAttendance.filter(
          (a) => a.status === ATTENDANCE_STATUS.PRESENT || a.status === ATTENDANCE_STATUS.LATE
        ).length;

        const attendanceRate =
          activeCount > 0 ? Math.round((presentToday / activeCount) * 100) : 0;

        // Approved leave days in current month
        const [year, month] = today.split('-').map(Number);
        const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const monthEnd = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        const leaves = await Leave.find({
          employee: { $in: employeeIds },
          status: LEAVE_STATUS.APPROVED,
          startDate: { $lte: monthEnd },
          endDate: { $gte: monthStart },
        }).select('totalDays');

        const approvedLeaveDays = leaves.reduce((acc, l) => acc + (l.totalDays || 0), 0);

        return {
          id: dept._id.toString(),
          name: dept.name,
          code: dept.code,
          status: dept.status,
          manager: dept.manager
            ? {
                id: dept.manager._id.toString(),
                name: dept.manager.name,
                email: dept.manager.email,
                role: dept.manager.role,
              }
            : null,
          employeeCount: deptEmployees.length,
          activeEmployeeCount: activeCount,
          taskWorkload: {
            total: tasks.length,
            completed: completedTasks,
            open: openTasks,
            overdue: overdueTasks,
            completionRate: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0,
          },
          attendanceRate,
          approvedLeaveDays,
        };
      })
    );

    return {
      departments: results,
      totalDepartments: results.length,
    };
  },

  /**
   * 7. Report Generator (JSON & CSV Data)
   */
  async getReportData({ user, type, from, to, department, status }) {
    const supportedTypes = ['attendance', 'leave', 'tasks', 'employees', 'departments'];
    const normalizedType = (type || '').toLowerCase();

    if (!supportedTypes.includes(normalizedType)) {
      const error = new Error(
        `Unsupported report type '${type}'. Supported types: ${supportedTypes.join(', ')}`
      );
      error.statusCode = 400;
      throw error;
    }

    const scope = await getScopedContext(user);
    const { from: fromDate, to: toDate } = parseDateRange(from, to);

    // Enforce RBAC per report type
    if (scope.isEmployee) {
      if (['employees', 'departments'].includes(normalizedType)) {
        const error = new Error('Forbidden: Employees cannot generate organization employee or department reports.');
        error.statusCode = 403;
        throw error;
      }
    }

    let reportPayload = {
      reportType: normalizedType,
      generatedAt: new Date().toISOString(),
      generatedBy: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      dateRange: { from: fromDate, to: toDate },
      summary: {},
      records: [],
    };

    switch (normalizedType) {
      case 'attendance': {
        const attAnalytics = await this.getAttendanceAnalytics({
          user,
          from: fromDate,
          to: toDate,
          department,
        });

        const query = { date: { $gte: fromDate, $lte: toDate } };
        if (scope.isEmployee) query.employee = user._id;
        else if (scope.isManager) query.employee = { $in: scope.managedUserIds };
        if (status && status !== 'ALL') query.status = status.toUpperCase();

        const records = await Attendance.find(query)
          .populate({
            path: 'employee',
            select: 'name email employeeId department',
            populate: { path: 'department', select: 'name code' },
          })
          .sort({ date: -1 });

        reportPayload.summary = attAnalytics.summary;
        reportPayload.records = records.map((r) => ({
          id: r._id.toString(),
          date: r.date,
          employeeId: r.employee?.employeeId || 'N/A',
          employeeName: r.employee?.name || 'Unknown',
          employeeEmail: r.employee?.email || 'N/A',
          department: r.employee?.department?.name || 'Unassigned',
          status: r.status,
          checkIn: r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : 'N/A',
          checkOut: r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : 'N/A',
          totalMinutes: r.totalMinutes || 0,
          totalHours: Number(((r.totalMinutes || 0) / 60).toFixed(1)),
        }));
        break;
      }

      case 'leave': {
        const leaveAnalytics = await this.getLeaveAnalytics({
          user,
          from: fromDate,
          to: toDate,
          department,
        });

        const query = {
          $or: [
            { startDate: { $gte: fromDate, $lte: toDate } },
            { endDate: { $gte: fromDate, $lte: toDate } },
          ],
        };
        if (scope.isEmployee) query.employee = user._id;
        else if (scope.isManager) query.employee = { $in: scope.managedUserIds };
        if (status && status !== 'ALL') query.status = status.toUpperCase();

        const records = await Leave.find(query)
          .populate({
            path: 'employee',
            select: 'name email employeeId department',
            populate: { path: 'department', select: 'name code' },
          })
          .populate('reviewedBy', 'name email')
          .sort({ createdAt: -1 });

        reportPayload.summary = leaveAnalytics.summary;
        reportPayload.records = records.map((l) => ({
          id: l._id.toString(),
          employeeId: l.employee?.employeeId || 'N/A',
          employeeName: l.employee?.name || 'Unknown',
          department: l.employee?.department?.name || 'Unassigned',
          leaveType: l.leaveType,
          startDate: l.startDate,
          endDate: l.endDate,
          totalDays: l.totalDays,
          status: l.status,
          reason: l.reason,
          reviewedBy: l.reviewedBy?.name || 'N/A',
          reviewComment: l.reviewComment || '',
        }));
        break;
      }

      case 'tasks': {
        const taskAnalytics = await this.getTaskAnalytics({
          user,
          from: fromDate,
          to: toDate,
          department,
        });

        const query = {
          $or: [
            { dueDate: { $gte: fromDate, $lte: toDate } },
            { createdAt: { $gte: new Date(`${fromDate}T00:00:00.000Z`), $lte: new Date(`${toDate}T23:59:59.999Z`) } },
          ],
        };
        if (scope.isEmployee) query.assignedTo = user._id;
        else if (scope.isManager) {
          query.$or = [
            { department: { $in: scope.managedDeptIds } },
            { assignedTo: { $in: scope.managedUserIds } },
            { assignedBy: user._id },
          ];
        }
        if (status && status !== 'ALL') query.status = status.toUpperCase();

        const records = await Task.find(query)
          .populate('assignedTo', 'name email employeeId')
          .populate('assignedBy', 'name email')
          .populate('department', 'name code')
          .sort({ dueDate: 1 });

        const today = getTodayDateString();

        reportPayload.summary = taskAnalytics.summary;
        reportPayload.records = records.map((t) => {
          const isOverdue =
            t.status !== TASK_STATUS.COMPLETED &&
            t.status !== TASK_STATUS.CANCELLED &&
            t.dueDate < today;

          return {
            id: t._id.toString(),
            title: t.title,
            department: t.department?.name || 'Unassigned',
            assignedTo: t.assignedTo?.name || 'Unassigned',
            assignedToEmail: t.assignedTo?.email || 'N/A',
            assignedBy: t.assignedBy?.name || 'N/A',
            priority: t.priority,
            status: t.status,
            dueDate: t.dueDate,
            isOverdue: isOverdue ? 'YES' : 'NO',
            completedAt: t.completedAt ? new Date(t.completedAt).toISOString() : 'N/A',
          };
        });
        break;
      }

      case 'employees': {
        const empAnalytics = await this.getEmployeeAnalytics({ user });
        const query = {};
        if (scope.isManager) query._id = { $in: scope.managedUserIds };
        if (status && status !== 'ALL') query.status = status.toUpperCase();

        const records = await User.find(query)
          .populate('department', 'name code')
          .sort({ employeeId: 1 });

        reportPayload.summary = empAnalytics.summary;
        reportPayload.records = records.map((e) => ({
          id: e._id.toString(),
          employeeId: e.employeeId || 'N/A',
          name: e.name,
          email: e.email,
          role: e.role,
          jobTitle: e.jobTitle || 'Associate',
          department: e.department?.name || 'Unassigned',
          status: e.status,
          joiningDate: e.joiningDate ? new Date(e.joiningDate).toISOString().slice(0, 10) : 'N/A',
          location: e.location || 'Remote',
        }));
        break;
      }

      case 'departments': {
        const deptAnalytics = await this.getDepartmentAnalytics({ user });
        reportPayload.summary = { totalDepartments: deptAnalytics.totalDepartments };
        reportPayload.records = deptAnalytics.departments.map((d) => ({
          id: d.id,
          name: d.name,
          code: d.code,
          status: d.status,
          manager: d.manager?.name || 'Unassigned',
          managerEmail: d.manager?.email || 'N/A',
          totalEmployees: d.employeeCount,
          activeEmployees: d.activeEmployeeCount,
          totalTasks: d.taskWorkload.total,
          completedTasks: d.taskWorkload.completed,
          openTasks: d.taskWorkload.open,
          overdueTasks: d.taskWorkload.overdue,
          taskCompletionRate: `${d.taskWorkload.completionRate}%`,
          attendanceRate: `${d.attendanceRate}%`,
          approvedLeaveDays: d.approvedLeaveDays,
        }));
        break;
      }

      default:
        break;
    }

    return reportPayload;
  },

  /**
   * 8. Safe CSV Serialization with Formula Injection Mitigation
   */
  generateReportCsv(reportData) {
    if (!reportData || !Array.isArray(reportData.records) || reportData.records.length === 0) {
      return 'No records available for the selected report filters.\n';
    }

    // Sanitize string to prevent CSV formula injection (=, +, -, @, \t, \r)
    const sanitizeValue = (val) => {
      if (val === null || val === undefined) return '';
      let str = String(val).trim();
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }
      if (str.includes('"') || str.includes(',') || str.includes('\n')) {
        str = `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = Object.keys(reportData.records[0]).filter((h) => h !== 'id');
    const headerRow = headers.map(sanitizeValue).join(',');

    const rows = reportData.records.map((row) =>
      headers.map((h) => sanitizeValue(row[h])).join(',')
    );

    return `${headerRow}\n${rows.join('\n')}\n`;
  },
};

export default analyticsService;
