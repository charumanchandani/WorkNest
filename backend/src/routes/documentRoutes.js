import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { documentUpload } from '../middleware/uploadMiddleware.js';
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  downloadDocument,
  updateDocument,
  archiveDocument,
} from '../controllers/documentController.js';

const router = Router();

// Protect all document endpoints
router.use(protect);

// 1. Document collection & creation
router
  .route('/')
  .post(authorizeRoles('ADMIN'), documentUpload.single('file'), uploadDocument)
  .get(getDocuments);

// 2. Download binary route (before parameterized subroutes if any)
router.get('/:id/download', downloadDocument);

// 3. Document item inspection, update, and archive
router
  .route('/:id')
  .get(getDocumentById)
  .patch(authorizeRoles('ADMIN'), updateDocument);

router.patch('/:id/archive', authorizeRoles('ADMIN'), archiveDocument);

export default router;
