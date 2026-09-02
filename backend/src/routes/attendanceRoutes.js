import { Router } from 'express';
import {
  checkIn,
  checkOut,
  getTodayAttendance,
  getMyAttendance,
  getMySummary,
  getAttendance,
  getAttendanceById,
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

// Protect all attendance endpoints with JWT authentication
router.use(protect);

// Employee Self-Service Endpoints
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/today', getTodayAttendance);
router.get('/my', getMyAttendance);
router.get('/my/summary', getMySummary);

// Manager / Admin Attendance Monitoring
router.get('/', authorizeRoles('ADMIN', 'MANAGER'), getAttendance);
router.get('/:id', getAttendanceById);

export default router;
