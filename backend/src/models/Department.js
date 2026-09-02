import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide department name'],
      unique: true,
      trim: true,
      maxlength: [100, 'Department name cannot exceed 100 characters'],
      index: true,
    },
    code: {
      type: String,
      required: [true, 'Please provide department code'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [10, 'Department code cannot exceed 10 characters'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['ACTIVE', 'INACTIVE'],
        message: '{VALUE} is not a supported department status',
      },
      default: 'ACTIVE',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: uppercase code and trim strings
departmentSchema.pre('save', function (next) {
  if (this.code) {
    this.code = this.code.trim().toUpperCase();
  }
  if (this.name) {
    this.name = this.name.trim();
  }
  next();
});

// Serialize safe department object
departmentSchema.methods.toSafeObject = function (employeeCount = 0) {
  let managerData = null;
  if (this.manager) {
    if (this.manager._id) {
      managerData = {
        id: this.manager._id.toString(),
        name: this.manager.name || `${this.manager.firstName || ''} ${this.manager.lastName || ''}`.trim(),
        email: this.manager.email,
        role: this.manager.role,
        jobTitle: this.manager.jobTitle,
        employeeId: this.manager.employeeId,
        status: this.manager.status,
      };
    } else {
      managerData = { id: this.manager.toString() };
    }
  }

  return {
    id: this._id.toString(),
    name: this.name,
    code: this.code,
    description: this.description || '',
    manager: managerData,
    status: this.status,
    employeeCount: typeof employeeCount === 'number' ? employeeCount : 0,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Department = mongoose.model('Department', departmentSchema);
export default Department;
