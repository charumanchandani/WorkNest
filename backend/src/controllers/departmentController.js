import { departmentService } from '../services/departmentService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

/**
 * @desc    Get all departments with pagination, search, status filters, and active employee counts
 * @route   GET /api/departments
 * @access  Private (Admin, Manager)
 */
export const getDepartments = async (req, res, next) => {
  try {
    const result = await departmentService.getDepartments(req.query);
    return sendSuccess(res, 200, 'Departments retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single department details with manager and assigned employees
 * @route   GET /api/departments/:id
 * @access  Private (Admin, Manager)
 */
export const getDepartmentById = async (req, res, next) => {
  try {
    const result = await departmentService.getDepartmentById(req.params.id);
    return sendSuccess(res, 200, 'Department details retrieved successfully', result);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Create a new department
 * @route   POST /api/departments
 * @access  Private (Admin only)
 */
export const createDepartment = async (req, res, next) => {
  try {
    const department = await departmentService.createDepartment(req.body);
    return sendSuccess(res, 201, 'Department created successfully', { department });
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Update department information
 * @route   PATCH /api/departments/:id
 * @access  Private (Admin only)
 */
export const updateDepartment = async (req, res, next) => {
  try {
    const department = await departmentService.updateDepartment(req.params.id, req.body);
    return sendSuccess(res, 200, 'Department updated successfully', { department });
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Activate or Deactivate department status
 * @route   PATCH /api/departments/:id/status
 * @access  Private (Admin only)
 */
export const updateDepartmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return sendError(res, 400, "Please provide 'status' ('ACTIVE' or 'INACTIVE').");
    }

    const department = await departmentService.updateDepartmentStatus(
      req.params.id,
      status
    );
    return sendSuccess(
      res,
      200,
      `Department status updated to ${department.status}`,
      { department }
    );
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Assign or remove department manager
 * @route   PATCH /api/departments/:id/manager
 * @access  Private (Admin only)
 */
export const updateDepartmentManager = async (req, res, next) => {
  try {
    const { manager } = req.body;
    const department = await departmentService.updateDepartmentManager(
      req.params.id,
      manager
    );
    return sendSuccess(res, 200, 'Department manager updated successfully', { department });
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};
