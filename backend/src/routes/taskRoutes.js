import { Router } from 'express';
import { taskController } from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

// Protect all task endpoints
router.use(protect);

// 1. Create a task (Admin or Manager)
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), taskController.createTask);

// 2. Personal tasks for authenticated employee
router.get('/my', taskController.getMyTasks);

// 3. Organization / Department tasks listing with scoping & workload summary
router.get('/', taskController.getTasks);

// 4. Get task by ID
router.get('/:id', taskController.getTaskById);

// 5. Update task details (Admin or Manager)
router.patch('/:id', authorizeRoles('ADMIN', 'MANAGER'), taskController.updateTask);

// 6. Update task status (Assignee or Manager/Admin)
router.patch('/:id/status', taskController.updateTaskStatus);

export default router;
