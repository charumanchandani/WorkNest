import multer from 'multer';
import { MAX_DOCUMENT_FILE_SIZE } from '../constants/document.js';
import { validateFileType } from '../services/storageService.js';

// Use MemoryStorage so that the file is safely buffered and handed to storageService
const memoryStorage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const validation = validateFileType(file.mimetype, file.originalname);
  if (!validation.valid) {
    const error = new Error(validation.message);
    error.statusCode = 400;
    return cb(error, false);
  }
  cb(null, true);
};

export const documentUpload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: MAX_DOCUMENT_FILE_SIZE,
    files: 1,
  },
  fileFilter,
});

export default documentUpload;
