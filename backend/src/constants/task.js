/**
 * Task Management Constants & Transition Rules
 */

export const TASK_STATUS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const TASK_STATUS_LIST = Object.values(TASK_STATUS);

export const TASK_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
};

export const TASK_PRIORITY_LIST = Object.values(TASK_PRIORITY);

// State Transition Rules
export const VALID_STATUS_TRANSITIONS = {
  TODO: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'TODO', 'CANCELLED'],
  COMPLETED: ['IN_PROGRESS'],
  CANCELLED: ['TODO'],
};

/**
 * Validates whether transition from current status to new status is permitted
 */
export const isValidStatusTransition = (currentStatus, newStatus) => {
  if (!currentStatus || !newStatus) return false;
  if (currentStatus === newStatus) return true; // No-op transition
  const allowed = VALID_STATUS_TRANSITIONS[currentStatus];
  return Array.isArray(allowed) && allowed.includes(newStatus);
};
