/**
 * WorkNest Leave Management Constants & Helpers
 */

export const LEAVE_TYPES = {
  ANNUAL: 'ANNUAL',
  CASUAL: 'CASUAL',
  SICK: 'SICK',
  UNPAID: 'UNPAID',
};

export const LEAVE_TYPES_LIST = Object.values(LEAVE_TYPES);

export const LEAVE_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
};

export const LEAVE_STATUS_LIST = Object.values(LEAVE_STATUS);

// Default annual leave balance allocation (per calendar year)
export const DEFAULT_LEAVE_BALANCES = {
  ANNUAL: 18,
  CASUAL: 12,
  SICK: 10,
};

/**
 * Calculates working days (Monday-Friday) between two dates (inclusive)
 * Dates must be in YYYY-MM-DD format.
 */
export const calculateWorkingDays = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return 0;

  const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
  const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number);

  const start = new Date(startYear, startMonth - 1, startDay);
  const end = new Date(endYear, endMonth - 1, endDay);

  if (start > end) return 0;

  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay(); // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
};
