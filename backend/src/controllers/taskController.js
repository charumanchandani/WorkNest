import { taskService } from '../services/taskService.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const taskController = {
  /**
   * Create a new task (Manager / Admin)
   * POST /api/tasks
   */
  async createTask(req, res, next) {
    try {
      const { title, description, assignedTo, priority, dueDate } = req.body;
      const task = await taskService.createTask({
        creatorUser: req.user,
        title,
        description,
        assignedTo,
        priority,
        dueDate,
      });

      return sendSuccess(res, 201, 'Task created and assigned successfully', { task });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get tasks list with role-scoping, search, and workload summary
   * GET /api/tasks
   */
  async getTasks(req, res, next) {
    try {
      const { records, pagination, summary } = await taskService.getTasks({
        user: req.user,
        ...req.query,
      });

      return sendSuccess(res, 200, 'Tasks retrieved successfully', {
        tasks: records,
        records,
        pagination,
        summary,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get personal tasks for authenticated employee
   * GET /api/tasks/my
   */
  async getMyTasks(req, res, next) {
    try {
      const { records, pagination, summary } = await taskService.getMyTasks({
        userId: req.user._id,
        ...req.query,
      });

      return sendSuccess(res, 200, 'Personal tasks retrieved successfully', {
        tasks: records,
        records,
        pagination,
        summary,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get single task details
   * GET /api/tasks/:id
   */
  async getTaskById(req, res, next) {
    try {
      const task = await taskService.getTaskById({
        id: req.params.id,
        user: req.user,
      });

      return sendSuccess(res, 200, 'Task details retrieved successfully', { task });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update task metadata (Manager / Admin)
   * PATCH /api/tasks/:id
   */
  async updateTask(req, res, next) {
    try {
      const { title, description, assignedTo, priority, dueDate } = req.body;
      const task = await taskService.updateTask({
        id: req.params.id,
        updaterUser: req.user,
        title,
        description,
        assignedTo,
        priority,
        dueDate,
      });

      return sendSuccess(res, 200, 'Task updated successfully', { task });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update task progress status (Employee assignee or Manager / Admin)
   * PATCH /api/tasks/:id/status
   */
  async updateTaskStatus(req, res, next) {
    try {
      const { status } = req.body;
      const task = await taskService.updateTaskStatus({
        id: req.params.id,
        user: req.user,
        status,
      });

      return sendSuccess(res, 200, 'Task status updated successfully', { task });
    } catch (err) {
      next(err);
    }
  },
};

export default taskController;
