import mongoose from 'mongoose';
import User from '../models/User.js';
import Department from '../models/Department.js';

// Helper to escape regex special characters
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const employeeService = {
  /**
   * Retrieve paginated and filtered list of employees
   */
  async getEmployees({
    page = 1,
    limit = 10,
    search = '',
    role = '',
    status = '',
    department = '',
  } = {}) {
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

    // 3. Department Filter
    if (department && department !== 'ALL') {
      if (mongoose.Types.ObjectId.isValid(department)) {
        query.department = department;
      }
    }

    // 4. Search Query (Name, Email, EmployeeId, JobTitle)
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
        .populate('department', 'name code status')
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

    const user = await User.findById(id).populate('department', 'name code status');
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
      department = null,
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

    // Validate Department if assigned
    let departmentId = null;
    if (department && department !== 'NONE') {
      if (!mongoose.Types.ObjectId.isValid(department)) {
        const error = new Error('Invalid department ID format.');
        error.statusCode = 400;
        throw error;
      }

      const dept = await Department.findById(department);
      if (!dept) {
        const error = new Error('Selected department does not exist.');
        error.statusCode = 400;
        throw error;
      }

      if (dept.status !== 'ACTIVE') {
        const error = new Error('Cannot assign employee to an inactive department.');
        error.statusCode = 400;
        throw error;
      }

      departmentId = dept._id;
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
      department: departmentId,
      employeeId: employeeId ? employeeId.trim().toUpperCase() : undefined,
      status: 'ACTIVE',
      isActive: true,
    });

    await newUser.save();
    await newUser.populate('department', 'name code status');

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

    // If role is being changed to EMPLOYEE, check if user is manager of any department
    if (
      updateData.role === 'EMPLOYEE' &&
      user.role !== 'EMPLOYEE'
    ) {
      const managedDept = await Department.findOne({ manager: user._id });
      if (managedDept) {
        const error = new Error(
          `Cannot change role to EMPLOYEE because this user is currently assigned as manager of the '${managedDept.name}' department. Please reassign the department manager first.`
        );
        error.statusCode = 400;
        throw error;
      }
    }

    // Validate Department if updating department
    if (updateData.department !== undefined) {
      if (!updateData.department || updateData.department === 'NONE') {
        user.department = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(updateData.department)) {
          const error = new Error('Invalid department ID format.');
          error.statusCode = 400;
          throw error;
        }

        const dept = await Department.findById(updateData.department);
        if (!dept) {
          const error = new Error('Selected department does not exist.');
          error.statusCode = 400;
          throw error;
        }

        if (dept.status !== 'ACTIVE') {
          const error = new Error('Cannot assign employee to an inactive department.');
          error.statusCode = 400;
          throw error;
        }

        user.department = dept._id;
      }
    }

    allowedFields.forEach((field) => {
      if (field === 'department') return; // Handled explicitly above

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
    await user.populate('department', 'name code status');
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
    await user.populate('department', 'name code status');

    return user.toSafeObject();
  },
};

export default employeeService;
