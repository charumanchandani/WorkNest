import mongoose from 'mongoose';
import { TASK_STATUS_LIST, TASK_PRIORITY_LIST } from '../constants/task.js';
import { getTodayDateString } from '../constants/attendance.js';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true,
      minlength: [3, 'Task title must be at least 3 characters'],
      maxlength: [150, 'Task title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Task description cannot exceed 2000 characters'],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please assign task to an employee'],
      index: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide assigning user reference'],
      index: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: TASK_PRIORITY_LIST,
        message: '{VALUE} is not a valid task priority',
      },
      default: 'MEDIUM',
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: TASK_STATUS_LIST,
        message: '{VALUE} is not a valid task status',
      },
      default: 'TODO',
      index: true,
    },
    dueDate: {
      type: String,
      required: [true, 'Please provide task due date (YYYY-MM-DD)'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format'],
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Helpful Compound Indexes
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ department: 1, status: 1 });
taskSchema.index({ dueDate: 1, status: 1 });

taskSchema.methods.toSafeObject = function () {
  let assigneeData = null;
  if (this.assignedTo) {
    if (this.assignedTo._id) {
      let deptData = null;
      if (this.assignedTo.department) {
        if (this.assignedTo.department._id) {
          deptData = {
            id: this.assignedTo.department._id.toString(),
            name: this.assignedTo.department.name,
            code: this.assignedTo.department.code,
          };
        } else {
          deptData = { id: this.assignedTo.department.toString() };
        }
      }

      assigneeData = {
        id: this.assignedTo._id.toString(),
        name: this.assignedTo.name,
        email: this.assignedTo.email,
        employeeId: this.assignedTo.employeeId,
        role: this.assignedTo.role,
        jobTitle: this.assignedTo.jobTitle,
        department: deptData,
        status: this.assignedTo.status,
      };
    } else {
      assigneeData = { id: this.assignedTo.toString() };
    }
  }

  let assignerData = null;
  if (this.assignedBy) {
    if (this.assignedBy._id) {
      assignerData = {
        id: this.assignedBy._id.toString(),
        name: this.assignedBy.name,
        email: this.assignedBy.email,
        role: this.assignedBy.role,
      };
    } else {
      assignerData = { id: this.assignedBy.toString() };
    }
  }

  let deptData = null;
  if (this.department) {
    if (this.department._id) {
      deptData = {
        id: this.department._id.toString(),
        name: this.department.name,
        code: this.department.code,
      };
    } else {
      deptData = { id: this.department.toString() };
    }
  }

  const today = getTodayDateString();
  const isOverdue =
    this.status !== 'COMPLETED' && this.status !== 'CANCELLED' && this.dueDate < today;

  return {
    id: this._id.toString(),
    title: this.title,
    description: this.description || '',
    assignedTo: assigneeData,
    assignedBy: assignerData,
    department: deptData,
    priority: this.priority,
    status: this.status,
    dueDate: this.dueDate,
    isOverdue,
    completedAt: this.completedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Task = mongoose.model('Task', taskSchema);
export default Task;
