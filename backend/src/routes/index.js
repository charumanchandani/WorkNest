import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import employeeRoutes from './employeeRoutes.js';
import departmentRoutes from './departmentRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import leaveRoutes from './leaveRoutes.js';
import taskRoutes from './taskRoutes.js';
import documentRoutes from './documentRoutes.js';
import announcementRoutes from './announcementRoutes.js';

const router = Router();

// Mount foundational routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/departments', departmentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/leaves', leaveRoutes);
router.use('/tasks', taskRoutes);
router.use('/documents', documentRoutes);
router.use('/announcements', announcementRoutes);

export default router;

