import mongoose from 'mongoose';
import Department from '../models/Department.js';
import User from '../models/User.js';

// Helper to escape regex special characters
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const departmentService = {
  /**
   * Retrieve paginated and filtered list of departments with dynamic employee counts
   */
  async getDepartments({ page = 1, limit = 10, search = '', status = '' } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    // Status Filter
    if (status && ['ACTIVE', 'INACTIVE'].includes(status.toUpperCase())) {
      query.status = status.toUpperCase();
    }

    // Search Query (Name, Code, Description)
    if (search && search.trim()) {
      const sanitized = escapeRegex(search.trim());
      const searchRegex = new RegExp(sanitized, 'i');
      query.$or = [
        { name: searchRegex },
        { code: searchRegex },
        { description: searchRegex },
      ];
    }

    const [departments, total] = await Promise.all([
      Department.find(query)
        .populate('manager', 'name firstName lastName email role jobTitle employeeId status isActive')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limitNum),
      Department.countDocuments(query),
    ]);

    // Compute active employee counts per department in a single aggregation query
    const departmentIds = departments.map((d) => d._id);
    const countResults = await User.aggregate([
      {
        $match: {
          department: { $in: departmentIds },
          status: 'ACTIVE',
        },
      },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = {};
    countResults.forEach((item) => {
      countMap[item._id.toString()] = item.count;
    });

    const totalPages = Math.ceil(total / limitNum) || 1;

    return {
      departments: departments.map((dept) =>
        dept.toSafeObject(countMap[dept._id.toString()] || 0)
      ),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    };
  },

  /**
   * Retrieve single department details with manager and assigned employees preview
   */
  async getDepartmentById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid department ID format.');
      error.statusCode = 400;
      throw error;
    }

    const department = await Department.findById(id).populate(
      'manager',
      'name firstName lastName email role jobTitle employeeId status isActive'
    );

    if (!department) {
      const error = new Error('Department not found.');
      error.statusCode = 404;
      throw error;
    }

    const [employeeCount, assignedEmployees] = await Promise.all([
      User.countDocuments({ department: department._id, status: 'ACTIVE' }),
      User.find({ department: department._id })
        .select('name firstName lastName email role jobTitle employeeId status location joiningDate')
        .sort({ name: 1 })
        .limit(100),
    ]);

    return {
      department: department.toSafeObject(employeeCount),
      employees: assignedEmployees.map((emp) => emp.toSafeObject ? emp.toSafeObject() : emp),
    };
  },

  /**
   * Create a new department
   */
  async createDepartment(data) {
    const { name, code, description = '', manager = null } = data;

    if (!name || !name.trim()) {
      const error = new Error('Please provide a department name.');
      error.statusCode = 400;
      throw error;
    }

    if (!code || !code.trim()) {
      const error = new Error('Please provide a department code (e.g. ENG, HR).');
      error.statusCode = 400;
      throw error;
    }

    const trimmedName = name.trim();
    const normalizedCode = code.trim().toUpperCase();

    // Check for duplicate name or code
    const existingDept = await Department.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${escapeRegex(trimmedName)}$`, 'i') } },
        { code: normalizedCode },
      ],
    });

    if (existingDept) {
      if (existingDept.code.toUpperCase() === normalizedCode) {
        const error = new Error(`Department code '${normalizedCode}' is already in use.`);
        error.statusCode = 409;
        throw error;
      }
      const error = new Error(`Department name '${trimmedName}' already exists.`);
      error.statusCode = 409;
      throw error;
    }

    let managerId = null;
    if (manager) {
      if (!mongoose.Types.ObjectId.isValid(manager)) {
        const error = new Error('Invalid manager ID format.');
        error.statusCode = 400;
        throw error;
      }

      const managerUser = await User.findById(manager);
      if (!managerUser) {
        const error = new Error('Assigned manager does not exist.');
        error.statusCode = 400;
        throw error;
      }

      if (managerUser.status !== 'ACTIVE') {
        const error = new Error('Cannot assign an inactive user as department manager.');
        error.statusCode = 400;
        throw error;
      }

      if (!['MANAGER', 'ADMIN'].includes(managerUser.role)) {
        const error = new Error('Department manager must have role MANAGER or ADMIN.');
        error.statusCode = 400;
        throw error;
      }

      managerId = managerUser._id;
    }

    const department = new Department({
      name: trimmedName,
      code: normalizedCode,
      description: description?.trim() || '',
      manager: managerId,
      status: 'ACTIVE',
    });

    await department.save();
    await department.populate('manager', 'name firstName lastName email role jobTitle employeeId status isActive');

    return department.toSafeObject(0);
  },

  /**
   * Update department details
   */
  async updateDepartment(id, updateData) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid department ID format.');
      error.statusCode = 400;
      throw error;
    }

    const department = await Department.findById(id);
    if (!department) {
      const error = new Error('Department not found.');
      error.statusCode = 404;
      throw error;
    }

    const { name, code, description, manager } = updateData;

    // Check duplicate name
    if (name && name.trim() && name.trim().toLowerCase() !== department.name.toLowerCase()) {
      const duplicateName = await Department.findOne({
        _id: { $ne: department._id },
        name: { $regex: new RegExp(`^${escapeRegex(name.trim())}$`, 'i') },
      });
      if (duplicateName) {
        const error = new Error(`Department name '${name.trim()}' is already in use.`);
        error.statusCode = 409;
        throw error;
      }
      department.name = name.trim();
    }

    // Check duplicate code
    if (code && code.trim() && code.trim().toUpperCase() !== department.code) {
      const normalizedCode = code.trim().toUpperCase();
      const duplicateCode = await Department.findOne({
        _id: { $ne: department._id },
        code: normalizedCode,
      });
      if (duplicateCode) {
        const error = new Error(`Department code '${normalizedCode}' is already in use.`);
        error.statusCode = 409;
        throw error;
      }
      department.code = normalizedCode;
    }

    if (description !== undefined) {
      department.description = typeof description === 'string' ? description.trim() : '';
    }

    if (manager !== undefined) {
      if (!manager || manager === 'NONE') {
        department.manager = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(manager)) {
          const error = new Error('Invalid manager ID format.');
          error.statusCode = 400;
          throw error;
        }

        const managerUser = await User.findById(manager);
        if (!managerUser) {
          const error = new Error('Assigned manager does not exist.');
          error.statusCode = 400;
          throw error;
        }

        if (managerUser.status !== 'ACTIVE') {
          const error = new Error('Cannot assign an inactive user as department manager.');
          error.statusCode = 400;
          throw error;
        }

        if (!['MANAGER', 'ADMIN'].includes(managerUser.role)) {
          const error = new Error('Department manager must have role MANAGER or ADMIN.');
          error.statusCode = 400;
          throw error;
        }

        department.manager = managerUser._id;
      }
    }

    await department.save();
    await department.populate('manager', 'name firstName lastName email role jobTitle employeeId status isActive');

    const employeeCount = await User.countDocuments({ department: department._id, status: 'ACTIVE' });
    return department.toSafeObject(employeeCount);
  },

  /**
   * Activate or Deactivate department
   */
  async updateDepartmentStatus(id, newStatus) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid department ID format.');
      error.statusCode = 400;
      throw error;
    }

    const normalizedStatus = newStatus?.toUpperCase();
    if (!['ACTIVE', 'INACTIVE'].includes(normalizedStatus)) {
      const error = new Error("Invalid status. Must be 'ACTIVE' or 'INACTIVE'.");
      error.statusCode = 400;
      throw error;
    }

    const department = await Department.findById(id);
    if (!department) {
      const error = new Error('Department not found.');
      error.statusCode = 404;
      throw error;
    }

    // Safety Rule: Reject deactivation if active employees are assigned to this department
    if (normalizedStatus === 'INACTIVE') {
      const activeEmployeeCount = await User.countDocuments({
        department: department._id,
        status: 'ACTIVE',
      });

      if (activeEmployeeCount > 0) {
        const error = new Error(
          `This department has ${activeEmployeeCount} active employee(s). Reassign them before deactivating the department.`
        );
        error.statusCode = 400;
        throw error;
      }
    }

    department.status = normalizedStatus;
    await department.save();
    await department.populate('manager', 'name firstName lastName email role jobTitle employeeId status isActive');

    const employeeCount = await User.countDocuments({ department: department._id, status: 'ACTIVE' });
    return department.toSafeObject(employeeCount);
  },

  /**
   * Assign or remove department manager
   */
  async updateDepartmentManager(id, managerId) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid department ID format.');
      error.statusCode = 400;
      throw error;
    }

    const department = await Department.findById(id);
    if (!department) {
      const error = new Error('Department not found.');
      error.statusCode = 404;
      throw error;
    }

    if (!managerId || managerId === 'NONE') {
      department.manager = null;
    } else {
      if (!mongoose.Types.ObjectId.isValid(managerId)) {
        const error = new Error('Invalid manager ID format.');
        error.statusCode = 400;
        throw error;
      }

      const managerUser = await User.findById(managerId);
      if (!managerUser) {
        const error = new Error('Assigned manager does not exist.');
        error.statusCode = 400;
        throw error;
      }

      if (managerUser.status !== 'ACTIVE') {
        const error = new Error('Cannot assign an inactive user as department manager.');
        error.statusCode = 400;
        throw error;
      }

      if (!['MANAGER', 'ADMIN'].includes(managerUser.role)) {
        const error = new Error('Department manager must have role MANAGER or ADMIN.');
        error.statusCode = 400;
        throw error;
      }

      department.manager = managerUser._id;
    }

    await department.save();
    await department.populate('manager', 'name firstName lastName email role jobTitle employeeId status isActive');

    const employeeCount = await User.countDocuments({ department: department._id, status: 'ACTIVE' });
    return department.toSafeObject(employeeCount);
  },
};

export default departmentService;
