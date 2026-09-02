import { employeeService } from '../services/employeeService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

/**
 * @desc    Get all employees with pagination, search, and filtering
 * @route   GET /api/employees
 * @access  Private (Admin, Manager)
 */
export const getEmployees = async (req, res, next) => {
  try {
    const result = await employeeService.getEmployees(req.query);
    return sendSuccess(res, 200, 'Employees retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single employee details
 * @route   GET /api/employees/:id
 * @access  Private (Admin, Manager)
 */
export const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    return sendSuccess(res, 200, 'Employee details retrieved successfully', { employee });
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Create a new employee
 * @route   POST /api/employees
 * @access  Private (Admin only)
 */
export const createEmployee = async (req, res, next) => {
  try {
    const result = await employeeService.createEmployee(req.body);
    return sendSuccess(res, 201, 'Employee created successfully', result);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Update employee profile
 * @route   PATCH /api/employees/:id
 * @access  Private (Admin only)
 */
export const updateEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.updateEmployee(req.params.id, req.body);
    return sendSuccess(res, 200, 'Employee updated successfully', { employee });
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Activate / Deactivate employee status
 * @route   PATCH /api/employees/:id/status
 * @access  Private (Admin only)
 */
export const updateEmployeeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return sendError(res, 400, "Please provide 'status' ('ACTIVE' or 'INACTIVE').");
    }

    const employee = await employeeService.updateEmployeeStatus(
      req.params.id,
      status
    );
    return sendSuccess(
      res,
      200,
      `Employee status updated to ${employee.status}`,
      { employee }
    );
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};
