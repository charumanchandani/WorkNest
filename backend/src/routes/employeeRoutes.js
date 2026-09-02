import { Router } from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
} from '../controllers/employeeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

// Protect all employee routes
router.use(protect);

// Read routes: Accessible by ADMIN and MANAGER
router.get('/', authorizeRoles('ADMIN', 'MANAGER'), getEmployees);
router.get('/:id', authorizeRoles('ADMIN', 'MANAGER'), getEmployeeById);

// Write / Mutate routes: Accessible strictly by ADMIN
router.post('/', authorizeRoles('ADMIN'), createEmployee);
router.patch('/:id', authorizeRoles('ADMIN'), updateEmployee);
router.patch('/:id/status', authorizeRoles('ADMIN'), updateEmployeeStatus);

export default router;
