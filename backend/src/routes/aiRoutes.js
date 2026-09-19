import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getAIStatus,
  getTaskSummary,
  generateLeaveDraft,
  getDocumentSummary,
  getProductivityInsight,
} from '../controllers/aiController.js';

const router = Router();

// All AI routes require authentication
router.use(protect);

router.get('/status', getAIStatus);
router.post('/task-summary', getTaskSummary);
router.post('/leave-draft', generateLeaveDraft);
router.post('/document-summary', getDocumentSummary);
router.post('/productivity-insight', getProductivityInsight);

export default router;
