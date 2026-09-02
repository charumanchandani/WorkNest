import mongoose from 'mongoose';
import { DEFAULT_LEAVE_BALANCES } from '../constants/leave.js';

const leaveBalanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide employee reference for leave balance'],
      index: true,
    },
    year: {
      type: Number,
      required: [true, 'Please provide balance calendar year'],
      default: () => new Date().getFullYear(),
    },
    annual: {
      type: Number,
      default: DEFAULT_LEAVE_BALANCES.ANNUAL,
      min: [0, 'Annual leave allocation cannot be negative'],
    },
    casual: {
      type: Number,
      default: DEFAULT_LEAVE_BALANCES.CASUAL,
      min: [0, 'Casual leave allocation cannot be negative'],
    },
    sick: {
      type: Number,
      default: DEFAULT_LEAVE_BALANCES.SICK,
      min: [0, 'Sick leave allocation cannot be negative'],
    },
    usedAnnual: {
      type: Number,
      default: 0,
      min: [0, 'Used annual leave cannot be negative'],
    },
    usedCasual: {
      type: Number,
      default: 0,
      min: [0, 'Used casual leave cannot be negative'],
    },
    usedSick: {
      type: Number,
      default: 0,
      min: [0, 'Used sick leave cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index: Strictly ONE leave balance record per employee per calendar year
leaveBalanceSchema.index({ employee: 1, year: 1 }, { unique: true });

leaveBalanceSchema.methods.toSafeObject = function (pendingCounts = {}) {
  const pendingAnnual = pendingCounts.ANNUAL || 0;
  const pendingCasual = pendingCounts.CASUAL || 0;
  const pendingSick = pendingCounts.SICK || 0;
  const pendingUnpaid = pendingCounts.UNPAID || 0;
  const usedUnpaid = pendingCounts.USED_UNPAID || 0;

  return {
    id: this._id.toString(),
    employeeId: this.employee.toString(),
    year: this.year,
    annual: {
      allocated: this.annual,
      used: this.usedAnnual,
      pending: pendingAnnual,
      available: Math.max(0, this.annual - this.usedAnnual - pendingAnnual),
    },
    casual: {
      allocated: this.casual,
      used: this.usedCasual,
      pending: pendingCasual,
      available: Math.max(0, this.casual - this.usedCasual - pendingCasual),
    },
    sick: {
      allocated: this.sick,
      used: this.usedSick,
      pending: pendingSick,
      available: Math.max(0, this.sick - this.usedSick - pendingSick),
    },
    unpaid: {
      used: usedUnpaid,
      pending: pendingUnpaid,
      available: null, // Unpaid leave is not capped by quota
    },
    totalAvailable:
      Math.max(0, this.annual - this.usedAnnual - pendingAnnual) +
      Math.max(0, this.casual - this.usedCasual - pendingCasual) +
      Math.max(0, this.sick - this.usedSick - pendingSick),
  };
};

export const LeaveBalance = mongoose.model('LeaveBalance', leaveBalanceSchema);
export default LeaveBalance;
