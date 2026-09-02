import { Router } from 'express';
import {
  createLeave,
  getMyLeaves,
  getMyBalance,
  getLeaveById,
  cancelLeave,
  getManageLeaves,
  approveLeave,
  rejectLeave,
} from '../controllers/leaveController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

// Protect all leave endpoints with JWT authentication
router.use(protect);

// Employee Self-Service Endpoints
router.post('/', createLeave);
router.get('/my', getMyLeaves);
router.get('/my/balance', getMyBalance);
router.patch('/:id/cancel', cancelLeave);

// Manager / Admin Leave Management & Reviews
router.get('/manage', authorizeRoles('ADMIN', 'MANAGER'), getManageLeaves);
router.patch('/:id/approve', authorizeRoles('ADMIN', 'MANAGER'), approveLeave);
router.patch('/:id/reject', authorizeRoles('ADMIN', 'MANAGER'), rejectLeave);

// Single Leave Request Details
router.get('/:id', getLeaveById);

export default router;
