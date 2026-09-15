import documentService from '../services/documentService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

/**
 * Upload a new document (Admin only)
 * POST /api/documents
 */
export const uploadDocument = async (req, res, next) => {
  try {
    const { title, description, category, visibility, department, expiresAt } = req.body;
    const file = req.file;

    const document = await documentService.createDocument({
      title,
      description,
      category,
      visibility,
      department,
      expiresAt,
      file,
      user: req.user,
    });

    return sendSuccess(res, 201, 'Document uploaded successfully.', { document });
  } catch (error) {
    next(error);
  }
};

/**
 * List documents with search, category, department, and status filters
 * GET /api/documents
 */
export const getDocuments = async (req, res, next) => {
  try {
    const result = await documentService.getDocuments({
      user: req.user,
      query: req.query,
    });

    return sendSuccess(res, 200, 'Documents retrieved successfully.', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single document specifications
 * GET /api/documents/:id
 */
export const getDocumentById = async (req, res, next) => {
  try {
    const document = await documentService.getDocumentById(req.params.id, req.user);
    return sendSuccess(res, 200, 'Document retrieved successfully.', { document });
  } catch (error) {
    next(error);
  }
};

/**
 * Securely download document binary
 * GET /api/documents/:id/download
 */
export const downloadDocument = async (req, res, next) => {
  try {
    const { filePath, originalFileName, mimeType } = await documentService.getDocumentForDownload(
      req.params.id,
      req.user
    );

    // Set proper binary download headers
    res.setHeader('Content-Type', mimeType || 'application/octet-stream');
    res.download(filePath, originalFileName, (err) => {
      if (err && !res.headersSent) {
        return sendError(res, 500, 'Failed to stream document file.');
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update document metadata (Admin only)
 * PATCH /api/documents/:id
 */
export const updateDocument = async (req, res, next) => {
  try {
    const document = await documentService.updateDocument(req.params.id, req.body, req.user);
    return sendSuccess(res, 200, 'Document updated successfully.', { document });
  } catch (error) {
    next(error);
  }
};

/**
 * Archive document (Admin only)
 * PATCH /api/documents/:id/archive
 */
export const archiveDocument = async (req, res, next) => {
  try {
    const document = await documentService.archiveDocument(req.params.id, req.user);
    return sendSuccess(res, 200, 'Document archived successfully.', { document });
  } catch (error) {
    next(error);
  }
};

export default {
  uploadDocument,
  getDocuments,
  getDocumentById,
  downloadDocument,
  updateDocument,
  archiveDocument,
};
