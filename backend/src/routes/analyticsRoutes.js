import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import {
  getOverviewAnalytics,
  getAttendanceAnalytics,
  getLeaveAnalytics,
  getTaskAnalytics,
  getEmployeeAnalytics,
  getDepartmentAnalytics,
} from '../controllers/analyticsController.js';

const router = Router();

// All analytics routes require authentication
router.use(protect);

router.get('/overview', getOverviewAnalytics);
router.get('/attendance', getAttendanceAnalytics);
router.get('/leave', getLeaveAnalytics);
router.get('/tasks', getTaskAnalytics);
router.get('/employees', authorizeRoles('MANAGER', 'ADMIN'), getEmployeeAnalytics);
router.get('/departments', authorizeRoles('MANAGER', 'ADMIN'), getDepartmentAnalytics);

export default router;
