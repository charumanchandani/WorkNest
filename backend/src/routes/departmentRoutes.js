import { Router } from 'express';
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  updateDepartmentStatus,
  updateDepartmentManager,
} from '../controllers/departmentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

// Protect all department routes with authentication
router.use(protect);

// Read routes: Accessible by ADMIN and MANAGER
router.get('/', authorizeRoles('ADMIN', 'MANAGER'), getDepartments);
router.get('/:id', authorizeRoles('ADMIN', 'MANAGER'), getDepartmentById);

// Mutation routes: Accessible strictly by ADMIN
router.post('/', authorizeRoles('ADMIN'), createDepartment);
router.patch('/:id', authorizeRoles('ADMIN'), updateDepartment);
router.patch('/:id/status', authorizeRoles('ADMIN'), updateDepartmentStatus);
router.patch('/:id/manager', authorizeRoles('ADMIN'), updateDepartmentManager);

export default router;
