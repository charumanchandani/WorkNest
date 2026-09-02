/**
 * Attendance Management Constants & Timezone Strategy
 * Target Business Timezone: Asia/Kolkata (+05:30)
 */

export const ATTENDANCE_TIMEZONE = 'Asia/Kolkata';

export const ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  LATE: 'LATE',
  HALF_DAY: 'HALF_DAY',
  ABSENT: 'ABSENT',
  ON_LEAVE: 'ON_LEAVE',
};

export const ATTENDANCE_STATUS_LIST = Object.values(ATTENDANCE_STATUS);

// Daily workday start threshold for determining PRESENT vs LATE
export const LATE_THRESHOLD_HOURS = 9;
export const LATE_THRESHOLD_MINUTES = 30; // 09:30 AM

/**
 * Returns today's business date string in YYYY-MM-DD format based on configured timezone
 */
export const getTodayDateString = (date = new Date(), timezone = ATTENDANCE_TIMEZONE) => {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date); // Formats as YYYY-MM-DD
  } catch {
    return new Date(date).toISOString().slice(0, 10);
  }
};

/**
 * Checks if a given timestamp in local timezone is after the late threshold (09:30 AM)
 */
export const isLateCheckIn = (date = new Date(), timezone = ATTENDANCE_TIMEZONE) => {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
    const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);

    if (hour > LATE_THRESHOLD_HOURS) {
      return true;
    }
    if (hour === LATE_THRESHOLD_HOURS && minute > LATE_THRESHOLD_MINUTES) {
      return true;
    }
    return false;
  } catch {
    const hour = date.getHours();
    const minute = date.getMinutes();
    return hour > 9 || (hour === 9 && minute > 30);
  }
};
