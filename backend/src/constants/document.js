/**
 * Document Vault Constants, MIME Types, and Restrictions
 */

export const DOCUMENT_CATEGORY = {
  POLICY: 'POLICY',
  HR: 'HR',
  GUIDELINE: 'GUIDELINE',
  FORM: 'FORM',
  TRAINING: 'TRAINING',
  OTHER: 'OTHER',
};

export const DOCUMENT_CATEGORY_LIST = Object.values(DOCUMENT_CATEGORY);

export const DOCUMENT_VISIBILITY = {
  ORGANIZATION: 'ORGANIZATION',
  DEPARTMENT: 'DEPARTMENT',
};

export const DOCUMENT_VISIBILITY_LIST = Object.values(DOCUMENT_VISIBILITY);

export const DOCUMENT_STATUS = {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
};

export const DOCUMENT_STATUS_LIST = Object.values(DOCUMENT_STATUS);

// 10 MB in bytes
export const MAX_DOCUMENT_FILE_SIZE = 10 * 1024 * 1024;

// MIME Types mapped to their canonical extensions
export const ALLOWED_MIME_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'text/plain': ['.txt'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
};

export const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.txt',
  '.png',
  '.jpg',
  '.jpeg',
];
