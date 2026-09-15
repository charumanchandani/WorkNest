import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getActivities } from '../controllers/activityController.js';

const router = Router();

// Protect all activity endpoints
router.use(protect);

router.get('/', getActivities);

export default router;
