import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import {
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_DOCUMENT_FILE_SIZE,
} from '../constants/document.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root uploads directory: backend/uploads
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

// Ensure uploads directory exists synchronously on startup
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Validates whether the given file mimeType and originalFileName are supported and safe.
 */
export const validateFileType = (mimeType, originalFileName) => {
  if (!mimeType || !originalFileName) {
    return { valid: false, message: 'File MIME type and filename are required.' };
  }

  const ext = path.extname(originalFileName).toLowerCase();

  // 1. Validate file extension
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      message: `File extension '${ext}' is not permitted. Supported types: ${ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }

  // 2. Validate MIME type
  const allowedExtsForMime = ALLOWED_MIME_TYPES[mimeType.toLowerCase()];
  if (!allowedExtsForMime || !allowedExtsForMime.includes(ext)) {
    return {
      valid: false,
      message: `File type '${mimeType}' does not match permitted extensions.`,
    };
  }

  // 3. Block executable and dangerous patterns
  const dangerousPatterns = [/\.exe$/i, /\.bat$/i, /\.cmd$/i, /\.sh$/i, /\.js$/i, /\.vbs$/i, /\.msi$/i];
  if (dangerousPatterns.some((pattern) => pattern.test(originalFileName))) {
    return {
      valid: false,
      message: 'Executable or dangerous scripts cannot be uploaded.',
    };
  }

  return { valid: true };
};

/**
 * Generates an opaque, collision-resistant storage key
 */
export const generateStorageKey = (originalFileName) => {
  const ext = path.extname(originalFileName).toLowerCase();
  const randomBytes = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  return `doc-${timestamp}-${randomBytes}${ext}`;
};

/**
 * Safely resolves and validates that a storageKey does not escape UPLOADS_DIR (Path Traversal Protection)
 */
export const resolveSafeFilePath = (storageKey) => {
  if (!storageKey || typeof storageKey !== 'string') {
    throw new Error('Invalid storage key provided.');
  }

  // Sanitize input key: strip null bytes and normalize
  const sanitizedKey = path.basename(storageKey);
  const resolvedPath = path.resolve(UPLOADS_DIR, sanitizedKey);

  // Enforce boundary check
  if (!resolvedPath.startsWith(UPLOADS_DIR)) {
    throw new Error('Path traversal attempt detected.');
  }

  return resolvedPath;
};

/**
 * Checks if a file exists in the safe storage
 */
export const checkFileExists = async (storageKey) => {
  try {
    const filePath = resolveSafeFilePath(storageKey);
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

/**
 * Saves a file buffer into the uploads directory
 */
export const saveFileFromBuffer = async (buffer, originalFileName, mimeType) => {
  const validation = validateFileType(mimeType, originalFileName);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  if (buffer.length > MAX_DOCUMENT_FILE_SIZE) {
    throw new Error(`File size exceeds the 10 MB limit (${(buffer.length / (1024 * 1024)).toFixed(2)} MB).`);
  }

  const storageKey = generateStorageKey(originalFileName);
  const filePath = resolveSafeFilePath(storageKey);

  await fs.promises.writeFile(filePath, buffer);

  return {
    storageKey,
    size: buffer.length,
    mimeType,
    originalFileName,
  };
};

/**
 * Deletes a stored file safely
 */
export const deleteStoredFile = async (storageKey) => {
  try {
    const filePath = resolveSafeFilePath(storageKey);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`[StorageService] Failed to delete file ${storageKey}:`, error.message);
    return false;
  }
};

/**
 * Returns the absolute safe path for streaming/downloading
 */
export const getFileDownloadPath = (storageKey) => {
  const filePath = resolveSafeFilePath(storageKey);
  if (!fs.existsSync(filePath)) {
    throw new Error('Physical document file not found in storage repository.');
  }
  return filePath;
};

export default {
  validateFileType,
  generateStorageKey,
  resolveSafeFilePath,
  checkFileExists,
  saveFileFromBuffer,
  deleteStoredFile,
  getFileDownloadPath,
};
