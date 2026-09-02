import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import employeeRoutes from './employeeRoutes.js';
import departmentRoutes from './departmentRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';

const router = Router();

// Mount foundational routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/departments', departmentRoutes);
router.use('/attendance', attendanceRoutes);

export default router;
