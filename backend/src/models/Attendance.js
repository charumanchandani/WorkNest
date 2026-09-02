import mongoose from 'mongoose';
import { ATTENDANCE_STATUS_LIST } from '../constants/attendance.js';

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide employee reference for attendance'],
      index: true,
    },
    date: {
      type: String,
      required: [true, 'Please provide business date (YYYY-MM-DD)'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
      index: true,
    },
    checkIn: {
      type: Date,
      default: null,
    },
    checkOut: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ATTENDANCE_STATUS_LIST,
        message: '{VALUE} is not a valid attendance status',
      },
      default: 'PRESENT',
      index: true,
    },
    totalMinutes: {
      type: Number,
      default: 0,
      min: [0, 'Total worked minutes cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index: Strictly ONE attendance record per employee per business calendar day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
attendanceSchema.index({ status: 1, date: 1 });

// Instance method to return clean, safe attendance serialization
attendanceSchema.methods.toSafeObject = function () {
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

  return {
    id: this._id.toString(),
    employee: empData,
    date: this.date,
    checkIn: this.checkIn,
    checkOut: this.checkOut,
    status: this.status,
    totalMinutes: this.totalMinutes || 0,
    isCheckedIn: Boolean(this.checkIn),
    isCheckedOut: Boolean(this.checkOut),
    notes: this.notes || '',
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
