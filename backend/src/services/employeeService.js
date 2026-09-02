import mongoose from 'mongoose';
import User from '../models/User.js';

// Helper to escape regex special characters
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const employeeService = {
  /**
   * Retrieve paginated and filtered list of employees
   */
  async getEmployees({ page = 1, limit = 10, search = '', role = '', status = '' }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    // 1. Role Filter
    if (role && ['EMPLOYEE', 'MANAGER', 'ADMIN'].includes(role.toUpperCase())) {
      query.role = role.toUpperCase();
    }

    // 2. Status Filter
    if (status && ['ACTIVE', 'INACTIVE'].includes(status.toUpperCase())) {
      query.status = status.toUpperCase();
    }

    // 3. Search Query (Name, Email, EmployeeId, JobTitle)
    if (search && search.trim()) {
      const sanitized = escapeRegex(search.trim());
      const searchRegex = new RegExp(sanitized, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { employeeId: searchRegex },
        { jobTitle: searchRegex },
      ];
    }

    const [employees, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return {
      employees: employees.map((u) => u.toSafeObject()),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    };
  },

  /**
   * Get single employee by ID
   */
  async getEmployeeById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid employee ID format.');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(id);
    if (!user) {
      const error = new Error('Employee not found.');
      error.statusCode = 404;
      throw error;
    }

    return user.toSafeObject();
  },

  /**
   * Create a new employee with User account
   */
  async createEmployee(data) {
    const {
      firstName,
      lastName,
      name,
      email,
      role = 'EMPLOYEE',
      jobTitle = 'Associate',
      phone = '',
      joiningDate,
      location = 'Remote',
      department = '',
      employeeId,
      initialPassword,
    } = data;

    if (!email || (!name && !firstName)) {
      const error = new Error('Please provide employee name and email address.');
      error.statusCode = 400;
      throw error;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check email uniqueness
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      const error = new Error('An account with this email address already exists.');
      error.statusCode = 409;
      throw error;
    }

    // Check custom employee ID uniqueness if supplied
    if (employeeId && employeeId.trim()) {
      const normalizedId = employeeId.trim().toUpperCase();
      const existingId = await User.findOne({ employeeId: normalizedId });
      if (existingId) {
        const error = new Error(`Employee ID '${normalizedId}' is already assigned.`);
        error.statusCode = 409;
        throw error;
      }
    }

    // Secure temporary initial password
    const tempPassword = initialPassword || 'Welcome@WN2026';

    const newUser = new User({
      firstName: firstName?.trim() || '',
      lastName: lastName?.trim() || '',
      name: name?.trim() || `${firstName || ''} ${lastName || ''}`.trim(),
      email: normalizedEmail,
      password: tempPassword,
      role: ['EMPLOYEE', 'MANAGER', 'ADMIN'].includes(role) ? role : 'EMPLOYEE',
      jobTitle: jobTitle?.trim() || 'Associate',
      phone: phone?.trim() || '',
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      location: location?.trim() || 'Remote',
      department: department?.trim() || '',
      employeeId: employeeId ? employeeId.trim().toUpperCase() : undefined,
      status: 'ACTIVE',
      isActive: true,
    });

    await newUser.save();

    return {
      employee: newUser.toSafeObject(),
      temporaryPasswordNotice: initialPassword ? null : 'Temporary password initialized to default: Welcome@WN2026',
    };
  },

  /**
   * Update employee profile details
   */
  async updateEmployee(id, updateData) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid employee ID format.');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(id);
    if (!user) {
      const error = new Error('Employee not found.');
      error.statusCode = 404;
      throw error;
    }

    // Explicit allowlist of updateable fields to prevent injection
    const allowedFields = [
      'firstName',
      'lastName',
      'name',
      'phone',
      'jobTitle',
      'location',
      'joiningDate',
      'department',
      'role',
    ];

    // If role is being changed from ADMIN to another role, check last admin rule
    if (
      updateData.role &&
      user.role === 'ADMIN' &&
      updateData.role !== 'ADMIN'
    ) {
      const otherAdmins = await User.countDocuments({
        role: 'ADMIN',
        status: 'ACTIVE',
        _id: { $ne: user._id },
      });
      if (otherAdmins === 0) {
        const error = new Error('Cannot change role of the last active Administrator in the organization.');
        error.statusCode = 400;
        throw error;
      }
    }

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        if (field === 'joiningDate') {
          user[field] = new Date(updateData[field]);
        } else if (field === 'role') {
          if (['EMPLOYEE', 'MANAGER', 'ADMIN'].includes(updateData[field])) {
            user[field] = updateData[field];
          }
        } else if (typeof updateData[field] === 'string') {
          user[field] = updateData[field].trim();
        }
      }
    });

    await user.save();
    return user.toSafeObject();
  },

  /**
   * Activate or Deactivate employee
   */
  async updateEmployeeStatus(id, newStatus) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid employee ID format.');
      error.statusCode = 400;
      throw error;
    }

    const normalizedStatus = newStatus?.toUpperCase();
    if (!['ACTIVE', 'INACTIVE'].includes(normalizedStatus)) {
      const error = new Error("Invalid status. Must be 'ACTIVE' or 'INACTIVE'.");
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(id);
    if (!user) {
      const error = new Error('Employee not found.');
      error.statusCode = 404;
      throw error;
    }

    // Last Active Admin Protection
    if (user.role === 'ADMIN' && normalizedStatus === 'INACTIVE') {
      const otherActiveAdmins = await User.countDocuments({
        role: 'ADMIN',
        status: 'ACTIVE',
        _id: { $ne: user._id },
      });

      if (otherActiveAdmins === 0) {
        const error = new Error('Cannot deactivate the last active Administrator in the organization.');
        error.statusCode = 400;
        throw error;
      }
    }

    user.status = normalizedStatus;
    user.isActive = normalizedStatus === 'ACTIVE';
    await user.save();

    return user.toSafeObject();
  },
};

export default employeeService;
