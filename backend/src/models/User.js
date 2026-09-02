import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
      sparse: true,
      index: true,
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    name: {
      type: String,
      required: [true, 'Please provide full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide email address'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['EMPLOYEE', 'MANAGER', 'ADMIN'],
        message: '{VALUE} is not a supported role',
      },
      default: 'EMPLOYEE',
      index: true,
    },
    jobTitle: {
      type: String,
      trim: true,
      default: 'Associate',
      maxlength: [100, 'Job title cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      maxlength: [30, 'Phone cannot exceed 30 characters'],
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    location: {
      type: String,
      trim: true,
      default: 'Remote',
      maxlength: [100, 'Location cannot exceed 100 characters'],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['ACTIVE', 'INACTIVE'],
        message: '{VALUE} is not a supported status',
      },
      default: 'ACTIVE',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: Normalize names, sync status, generate employeeId if missing, hash password
userSchema.pre('save', async function (next) {
  // 1. Normalize firstName, lastName, and name
  if (this.firstName || this.lastName) {
    const full = `${this.firstName || ''} ${this.lastName || ''}`.trim();
    if (full) {
      this.name = full;
    }
  } else if (this.name) {
    const parts = this.name.trim().split(/\s+/);
    this.firstName = parts[0] || 'User';
    this.lastName = parts.slice(1).join(' ') || '';
  }

  // 2. Synchronize status and isActive boolean
  if (this.isModified('status')) {
    this.isActive = this.status === 'ACTIVE';
  } else if (this.isModified('isActive')) {
    this.status = this.isActive ? 'ACTIVE' : 'INACTIVE';
  }

  // 3. Auto-generate employeeId if not provided
  if (!this.employeeId) {
    try {
      const count = await mongoose.model('User').countDocuments();
      const seq = String(count + 1).padStart(4, '0');
      let candidate = `WN-${seq}`;

      // Ensure uniqueness in case of race/gaps
      let exists = await mongoose.model('User').findOne({ employeeId: candidate });
      let counter = count + 1;
      while (exists) {
        counter += 1;
        candidate = `WN-${String(counter).padStart(4, '0')}`;
        exists = await mongoose.model('User').findOne({ employeeId: candidate });
      }

      this.employeeId = candidate;
    } catch (err) {
      return next(err);
    }
  }

  // 4. Hash password if modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Return safe user/employee object omitting password and internal details
userSchema.methods.toSafeObject = function () {
  let deptData = null;
  if (this.department) {
    if (this.department._id) {
      deptData = {
        id: this.department._id.toString(),
        name: this.department.name,
        code: this.department.code,
        status: this.department.status,
      };
    } else if (mongoose.Types.ObjectId.isValid(this.department)) {
      deptData = { id: this.department.toString() };
    }
  }

  return {
    id: this._id.toString(),
    employeeId: this.employeeId,
    firstName: this.firstName || '',
    lastName: this.lastName || '',
    name: this.name,
    email: this.email,
    phone: this.phone || '',
    role: this.role,
    jobTitle: this.jobTitle || 'Associate',
    joiningDate: this.joiningDate,
    location: this.location || 'Remote',
    department: deptData,
    status: this.status || (this.isActive ? 'ACTIVE' : 'INACTIVE'),
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const User = mongoose.model('User', userSchema);
export default User;
