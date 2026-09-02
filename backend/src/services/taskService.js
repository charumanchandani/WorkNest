import mongoose from 'mongoose';
import Task from '../models/Task.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import {
  TASK_STATUS,
  TASK_STATUS_LIST,
  TASK_PRIORITY,
  TASK_PRIORITY_LIST,
  isValidStatusTransition,
} from '../constants/task.js';
import { getTodayDateString } from '../constants/attendance.js';

// Helper to escape regex special characters
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const taskService = {
  /**
   * Create a new task (Manager or Admin)
   */
  async createTask({
    creatorUser,
    title,
    description = '',
    assignedTo,
    priority = TASK_PRIORITY.MEDIUM,
    dueDate,
  }) {
    if (!title || title.trim().length < 3) {
      const error = new Error('Task title is required and must be at least 3 characters.');
      error.statusCode = 400;
      throw error;
    }

    if (title.trim().length > 150) {
      const error = new Error('Task title cannot exceed 150 characters.');
      error.statusCode = 400;
      throw error;
    }

    if (!assignedTo || !mongoose.Types.ObjectId.isValid(assignedTo)) {
      const error = new Error('Please select a valid employee to assign this task.');
      error.statusCode = 400;
      throw error;
    }

    const assignee = await User.findById(assignedTo).populate('department');
    if (!assignee) {
      const error = new Error('Assigned employee not found.');
      error.statusCode = 404;
      throw error;
    }

    if (assignee.status !== 'ACTIVE') {
      const error = new Error('Tasks cannot be assigned to inactive employees.');
      error.statusCode = 400;
      throw error;
    }

    // Manager Scope Check
    if (creatorUser.role === 'MANAGER') {
      const managedDepts = await Department.find({ manager: creatorUser._id }).select('_id');
      const managedDeptIds = managedDepts.map((d) => d._id.toString());
      const assigneeDeptId = assignee.department?._id?.toString() || assignee.department?.toString();

      const isSelf = assignee._id.toString() === creatorUser._id.toString();
      if (!isSelf && (!assigneeDeptId || !managedDeptIds.includes(assigneeDeptId))) {
        const error = new Error('Managers can only assign tasks to employees within their managed departments.');
        error.statusCode = 403;
        throw error;
      }
    }

    // Validate Priority
    const taskPriority = priority ? priority.toUpperCase() : TASK_PRIORITY.MEDIUM;
    if (!TASK_PRIORITY_LIST.includes(taskPriority)) {
      const error = new Error(`Invalid task priority. Allowed values: ${TASK_PRIORITY_LIST.join(', ')}.`);
      error.statusCode = 400;
      throw error;
    }

    // Validate Due Date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dueDate || !dateRegex.test(dueDate)) {
      const error = new Error('Please provide a valid due date in YYYY-MM-DD format.');
      error.statusCode = 400;
      throw error;
    }

    const today = getTodayDateString();
    if (dueDate < today) {
      const error = new Error('Due date cannot be set in the past for new tasks.');
      error.statusCode = 400;
      throw error;
    }

    const task = new Task({
      title: title.trim(),
      description: description ? description.trim() : '',
      assignedTo: assignee._id,
      assignedBy: creatorUser._id,
      department: assignee.department?._id || assignee.department || null,
      priority: taskPriority,
      status: TASK_STATUS.TODO,
      dueDate,
      completedAt: null,
    });

    await task.save();
    await task.populate([
      {
        path: 'assignedTo',
        select: 'name email employeeId role jobTitle department status',
        populate: { path: 'department', select: 'name code' },
      },
      {
        path: 'assignedBy',
        select: 'name email role',
      },
      {
        path: 'department',
        select: 'name code',
      },
    ]);

    return task.toSafeObject();
  },

  /**
   * Get organization / department tasks list with filters, pagination, and workload summary
   */
  async getTasks({
    user,
    page = 1,
    limit = 20,
    search = '',
    status = '',
    priority = '',
    department = '',
    assignedTo = '',
    dueDate = '',
    from = '',
    to = '',
  } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    let allowedEmployeeIds = null;
    let managedDeptIds = null;

    // RBAC Scoping
    if (user.role === 'EMPLOYEE') {
      query.assignedTo = user._id;
    } else if (user.role === 'MANAGER') {
      const managedDepts = await Department.find({ manager: user._id }).select('_id');
      managedDeptIds = managedDepts.map((d) => d._id);

      const deptUsers = await User.find({
        $or: [{ department: { $in: managedDeptIds } }, { _id: user._id }],
      }).select('_id');
      allowedEmployeeIds = deptUsers.map((u) => u._id);

      query.$or = [
        { department: { $in: managedDeptIds } },
        { assignedTo: { $in: allowedEmployeeIds } },
        { assignedBy: user._id },
      ];
    }

    // 1. Employee filter
    if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
      if (allowedEmployeeIds && !allowedEmployeeIds.some((id) => id.toString() === assignedTo)) {
        return {
          records: [],
          pagination: { page: pageNum, limit: limitNum, total: 0, totalPages: 1 },
          summary: { total: 0, todo: 0, inProgress: 0, completed: 0, cancelled: 0, overdue: 0 },
        };
      }
      query.assignedTo = assignedTo;
    }

    // 2. Department filter
    if (department && department !== 'ALL' && mongoose.Types.ObjectId.isValid(department)) {
      query.department = department;
    }

    // 3. Status filter
    if (status && TASK_STATUS_LIST.includes(status.toUpperCase())) {
      query.status = status.toUpperCase();
    }

    // 4. Priority filter
    if (priority && TASK_PRIORITY_LIST.includes(priority.toUpperCase())) {
      query.priority = priority.toUpperCase();
    }

    // 5. Due date range / exact
    if (dueDate && /^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      query.dueDate = dueDate;
    } else if (from && to) {
      query.dueDate = { $gte: from, $lte: to };
    } else if (from) {
      query.dueDate = { $gte: from };
    } else if (to) {
      query.dueDate = { $lte: to };
    }

    // 6. Search across title, assignee name, email, employeeId
    if (search && search.trim()) {
      const sanitized = escapeRegex(search.trim());
      const searchRegex = new RegExp(sanitized, 'i');
      const matchedUsers = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }, { employeeId: searchRegex }],
      }).select('_id');

      const matchedUserIds = matchedUsers.map((u) => u._id);

      query.$and = query.$and || [];
      query.$and.push({
        $or: [{ title: searchRegex }, { assignedTo: { $in: matchedUserIds } }],
      });
    }

    const [records, total, allScopedTasks] = await Promise.all([
      Task.find(query)
        .sort({ dueDate: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate({
          path: 'assignedTo',
          select: 'name email employeeId role jobTitle department status',
          populate: { path: 'department', select: 'name code' },
        })
        .populate({
          path: 'assignedBy',
          select: 'name email role',
        })
        .populate({
          path: 'department',
          select: 'name code',
        }),
      Task.countDocuments(query),
      // Aggregate summary metrics across all matching queries without pagination
      Task.find(query).select('status dueDate'),
    ]);

    const today = getTodayDateString();
    let todoCount = 0;
    let inProgressCount = 0;
    let completedCount = 0;
    let cancelledCount = 0;
    let overdueCount = 0;

    allScopedTasks.forEach((t) => {
      if (t.status === TASK_STATUS.TODO) todoCount++;
      else if (t.status === TASK_STATUS.IN_PROGRESS) inProgressCount++;
      else if (t.status === TASK_STATUS.COMPLETED) completedCount++;
      else if (t.status === TASK_STATUS.CANCELLED) cancelledCount++;

      if (t.status !== TASK_STATUS.COMPLETED && t.status !== TASK_STATUS.CANCELLED && t.dueDate < today) {
        overdueCount++;
      }
    });

    const totalPages = Math.ceil(total / limitNum) || 1;

    return {
      records: records.map((r) => r.toSafeObject()),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
      summary: {
        total,
        active: todoCount + inProgressCount,
        todo: todoCount,
        inProgress: inProgressCount,
        completed: completedCount,
        cancelled: cancelledCount,
        overdue: overdueCount,
      },
    };
  },

  /**
   * Get personal tasks for authenticated employee
   */
  async getMyTasks({
    userId,
    page = 1,
    limit = 20,
    search = '',
    status = '',
    priority = '',
    dueDate = '',
  } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = { assignedTo: userId };

    if (status && TASK_STATUS_LIST.includes(status.toUpperCase())) {
      query.status = status.toUpperCase();
    }

    if (priority && TASK_PRIORITY_LIST.includes(priority.toUpperCase())) {
      query.priority = priority.toUpperCase();
    }

    if (dueDate && /^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      query.dueDate = dueDate;
    }

    if (search && search.trim()) {
      const sanitized = escapeRegex(search.trim());
      query.title = new RegExp(sanitized, 'i');
    }

    const [records, total, allPersonalTasks] = await Promise.all([
      Task.find(query)
        .sort({ dueDate: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate({
          path: 'assignedTo',
          select: 'name email employeeId role jobTitle department status',
          populate: { path: 'department', select: 'name code' },
        })
        .populate({
          path: 'assignedBy',
          select: 'name email role',
        })
        .populate({
          path: 'department',
          select: 'name code',
        }),
      Task.countDocuments(query),
      Task.find({ assignedTo: userId }).select('status dueDate'),
    ]);

    const today = getTodayDateString();
    let todo = 0;
    let inProgress = 0;
    let completed = 0;
    let overdue = 0;
    let dueSoon = 0;

    // Calculate 3-day window for dueSoon
    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    const threeDaysLaterStr = getTodayDateString(threeDaysLater);

    allPersonalTasks.forEach((t) => {
      if (t.status === TASK_STATUS.TODO) todo++;
      else if (t.status === TASK_STATUS.IN_PROGRESS) inProgress++;
      else if (t.status === TASK_STATUS.COMPLETED) completed++;

      if (t.status !== TASK_STATUS.COMPLETED && t.status !== TASK_STATUS.CANCELLED) {
        if (t.dueDate < today) {
          overdue++;
        } else if (t.dueDate <= threeDaysLaterStr) {
          dueSoon++;
        }
      }
    });

    const totalPages = Math.ceil(total / limitNum) || 1;

    return {
      records: records.map((r) => r.toSafeObject()),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
      summary: {
        total: allPersonalTasks.length,
        active: todo + inProgress,
        todo,
        inProgress,
        completed,
        overdue,
        dueSoon,
      },
    };
  },

  /**
   * Get single task details by ID
   */
  async getTaskById({ id, user }) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid task ID format.');
      error.statusCode = 400;
      throw error;
    }

    const task = await Task.findById(id)
      .populate({
        path: 'assignedTo',
        select: 'name email employeeId role jobTitle department status',
        populate: { path: 'department', select: 'name code' },
      })
      .populate({
        path: 'assignedBy',
        select: 'name email role',
      })
      .populate({
        path: 'department',
        select: 'name code',
      });

    if (!task) {
      const error = new Error('Task not found.');
      error.statusCode = 404;
      throw error;
    }

    // RBAC check
    if (user.role === 'ADMIN') {
      return task.toSafeObject();
    }

    if (user.role === 'MANAGER') {
      const isAssignee = task.assignedTo?._id?.toString() === user._id.toString();
      const isAssigner = task.assignedBy?._id?.toString() === user._id.toString();

      if (isAssignee || isAssigner) {
        return task.toSafeObject();
      }

      const managedDepts = await Department.find({ manager: user._id }).select('_id');
      const managedDeptIds = managedDepts.map((d) => d._id.toString());
      const taskDeptId = task.department?._id?.toString() || task.department?.toString();

      if (taskDeptId && managedDeptIds.includes(taskDeptId)) {
        return task.toSafeObject();
      }

      const error = new Error('Unauthorized to view tasks outside your managed department.');
      error.statusCode = 403;
      throw error;
    }

    // EMPLOYEE: Assignee only
    if (task.assignedTo?._id?.toString() !== user._id.toString()) {
      const error = new Error('Unauthorized to view tasks assigned to other employees.');
      error.statusCode = 403;
      throw error;
    }

    return task.toSafeObject();
  },

  /**
   * Update task metadata (Manager or Admin)
   */
  async updateTask({
    id,
    updaterUser,
    title,
    description,
    assignedTo,
    priority,
    dueDate,
  }) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid task ID format.');
      error.statusCode = 400;
      throw error;
    }

    const task = await Task.findById(id);
    if (!task) {
      const error = new Error('Task not found.');
      error.statusCode = 404;
      throw error;
    }

    // Manager Scope Check
    if (updaterUser.role === 'MANAGER') {
      const managedDepts = await Department.find({ manager: updaterUser._id }).select('_id');
      const managedDeptIds = managedDepts.map((d) => d._id.toString());
      const taskDeptId = task.department?.toString();

      const isAssigner = task.assignedBy.toString() === updaterUser._id.toString();
      if (!isAssigner && (!taskDeptId || !managedDeptIds.includes(taskDeptId))) {
        const error = new Error('Unauthorized to edit tasks outside your managed department.');
        error.statusCode = 403;
        throw error;
      }
    }

    // Reassignment check
    if (assignedTo && assignedTo !== task.assignedTo.toString()) {
      if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
        const error = new Error('Invalid employee ID for reassignment.');
        error.statusCode = 400;
        throw error;
      }

      const newAssignee = await User.findById(assignedTo).populate('department');
      if (!newAssignee) {
        const error = new Error('Assigned employee not found.');
        error.statusCode = 404;
        throw error;
      }

      if (newAssignee.status !== 'ACTIVE') {
        const error = new Error('Cannot assign task to an inactive employee.');
        error.statusCode = 400;
        throw error;
      }

      if (updaterUser.role === 'MANAGER') {
        const managedDepts = await Department.find({ manager: updaterUser._id }).select('_id');
        const managedDeptIds = managedDepts.map((d) => d._id.toString());
        const assigneeDeptId = newAssignee.department?._id?.toString() || newAssignee.department?.toString();

        const isSelf = newAssignee._id.toString() === updaterUser._id.toString();
        if (!isSelf && (!assigneeDeptId || !managedDeptIds.includes(assigneeDeptId))) {
          const error = new Error('Cannot reassign task to employee outside your managed departments.');
          error.statusCode = 403;
          throw error;
        }
      }

      task.assignedTo = newAssignee._id;
      task.department = newAssignee.department?._id || newAssignee.department || null;
    }

    if (title !== undefined) {
      if (!title || title.trim().length < 3) {
        const error = new Error('Task title must be at least 3 characters.');
        error.statusCode = 400;
        throw error;
      }
      task.title = title.trim();
    }

    if (description !== undefined) {
      task.description = description ? description.trim() : '';
    }

    if (priority !== undefined) {
      const taskPriority = priority.toUpperCase();
      if (!TASK_PRIORITY_LIST.includes(taskPriority)) {
        const error = new Error(`Invalid task priority. Allowed: ${TASK_PRIORITY_LIST.join(', ')}.`);
        error.statusCode = 400;
        throw error;
      }
      task.priority = taskPriority;
    }

    if (dueDate !== undefined) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
        const error = new Error('Due date must be in YYYY-MM-DD format.');
        error.statusCode = 400;
        throw error;
      }
      task.dueDate = dueDate;
    }

    await task.save();
    await task.populate([
      {
        path: 'assignedTo',
        select: 'name email employeeId role jobTitle department status',
        populate: { path: 'department', select: 'name code' },
      },
      {
        path: 'assignedBy',
        select: 'name email role',
      },
      {
        path: 'department',
        select: 'name code',
      },
    ]);

    return task.toSafeObject();
  },

  /**
   * Update task progress status (Employee assignee or Manager/Admin)
   */
  async updateTaskStatus({ id, user, status }) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid task ID format.');
      error.statusCode = 400;
      throw error;
    }

    const task = await Task.findById(id);
    if (!task) {
      const error = new Error('Task not found.');
      error.statusCode = 404;
      throw error;
    }

    // RBAC Authorization
    const isAssignee = task.assignedTo.toString() === user._id.toString();
    const isAssigner = task.assignedBy.toString() === user._id.toString();
    const isAdmin = user.role === 'ADMIN';

    let isAuthorized = isAdmin || isAssignee || isAssigner;

    if (!isAuthorized && user.role === 'MANAGER') {
      const managedDepts = await Department.find({ manager: user._id }).select('_id');
      const managedDeptIds = managedDepts.map((d) => d._id.toString());
      const taskDeptId = task.department?.toString();
      if (taskDeptId && managedDeptIds.includes(taskDeptId)) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      const error = new Error('Unauthorized to update status for this task.');
      error.statusCode = 403;
      throw error;
    }

    const newStatus = status ? status.toUpperCase() : '';
    if (!TASK_STATUS_LIST.includes(newStatus)) {
      const error = new Error(`Invalid status. Allowed values: ${TASK_STATUS_LIST.join(', ')}.`);
      error.statusCode = 400;
      throw error;
    }

    // Validate Transition Rules
    if (!isValidStatusTransition(task.status, newStatus)) {
      const error = new Error(`Invalid status transition from ${task.status} to ${newStatus}.`);
      error.statusCode = 400;
      throw error;
    }

    if (newStatus === TASK_STATUS.COMPLETED) {
      task.completedAt = new Date();
    } else {
      task.completedAt = null;
    }

    task.status = newStatus;
    await task.save();

    await task.populate([
      {
        path: 'assignedTo',
        select: 'name email employeeId role jobTitle department status',
        populate: { path: 'department', select: 'name code' },
      },
      {
        path: 'assignedBy',
        select: 'name email role',
      },
      {
        path: 'department',
        select: 'name code',
      },
    ]);

    return task.toSafeObject();
  },
};

export default taskService;
