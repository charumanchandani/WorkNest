import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getReport } from '../controllers/reportController.js';

const router = Router();

// All report routes require authentication
router.use(protect);

router.get('/:type', getReport);

export default router;
