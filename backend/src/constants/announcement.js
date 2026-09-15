/**
 * Company Announcements Constants & Transition Rules
 */

export const ANNOUNCEMENT_TARGET = {
  ORGANIZATION: 'ORGANIZATION',
  DEPARTMENT: 'DEPARTMENT',
};

export const ANNOUNCEMENT_TARGET_LIST = Object.values(ANNOUNCEMENT_TARGET);

export const ANNOUNCEMENT_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
};

export const ANNOUNCEMENT_STATUS_LIST = Object.values(ANNOUNCEMENT_STATUS);

export const VALID_ANNOUNCEMENT_TRANSITIONS = {
  DRAFT: ['PUBLISHED', 'ARCHIVED'],
  PUBLISHED: ['ARCHIVED'],
  ARCHIVED: [],
};

export const isValidAnnouncementTransition = (currentStatus, newStatus) => {
  if (!currentStatus || !newStatus) return false;
  if (currentStatus === newStatus) return true;
  const allowed = VALID_ANNOUNCEMENT_TRANSITIONS[currentStatus];
  return Array.isArray(allowed) && allowed.includes(newStatus);
};
