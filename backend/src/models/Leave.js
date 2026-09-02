import mongoose from 'mongoose';
import { LEAVE_TYPES_LIST, LEAVE_STATUS_LIST } from '../constants/leave.js';

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide employee reference for leave request'],
      index: true,
    },
    leaveType: {
      type: String,
      enum: {
        values: LEAVE_TYPES_LIST,
        message: '{VALUE} is not a valid leave type',
      },
      required: [true, 'Please select a leave type'],
      index: true,
    },
    startDate: {
      type: String,
      required: [true, 'Please provide start date (YYYY-MM-DD)'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'],
      index: true,
    },
    endDate: {
      type: String,
      required: [true, 'Please provide end date (YYYY-MM-DD)'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'],
      index: true,
    },
    totalDays: {
      type: Number,
      required: [true, 'Total working days must be calculated'],
      min: [1, 'Leave duration must be at least 1 working day'],
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason for the leave request'],
      trim: true,
      minlength: [3, 'Reason must be at least 3 characters'],
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: {
        values: LEAVE_STATUS_LIST,
        message: '{VALUE} is not a valid leave status',
      },
      default: 'PENDING',
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewComment: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Review comment cannot exceed 500 characters'],
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Helpful Compound Indexes
leaveSchema.index({ employee: 1, startDate: 1, endDate: 1 });
leaveSchema.index({ status: 1, startDate: 1 });

leaveSchema.methods.toSafeObject = function () {
  let empData = null;
  if (this.employee) {
    if (this.employee._id) {
      let deptData = null;
      if (this.employee.department) {
        if (this.employee.department._id) {
          deptData = {
            id: this.employee.department._id.toString(),
            name: this.employee.department.name,
            code: this.employee.department.code,
          };
        } else {
          deptData = { id: this.employee.department.toString() };
        }
      }

      empData = {
        id: this.employee._id.toString(),
        name: this.employee.name,
        email: this.employee.email,
        employeeId: this.employee.employeeId,
        role: this.employee.role,
        jobTitle: this.employee.jobTitle,
        department: deptData,
        status: this.employee.status,
      };
    } else {
      empData = { id: this.employee.toString() };
    }
  }

  let reviewerData = null;
  if (this.reviewedBy) {
    if (this.reviewedBy._id) {
      reviewerData = {
        id: this.reviewedBy._id.toString(),
        name: this.reviewedBy.name,
        email: this.reviewedBy.email,
        role: this.reviewedBy.role,
      };
    } else {
      reviewerData = { id: this.reviewedBy.toString() };
    }
  }

  return {
    id: this._id.toString(),
    employee: empData,
    leaveType: this.leaveType,
    startDate: this.startDate,
    endDate: this.endDate,
    totalDays: this.totalDays,
    reason: this.reason,
    status: this.status,
    reviewedBy: reviewerData,
    reviewedAt: this.reviewedAt,
    reviewComment: this.reviewComment || '',
    cancelledAt: this.cancelledAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Leave = mongoose.model('Leave', leaveSchema);
export default Leave;
