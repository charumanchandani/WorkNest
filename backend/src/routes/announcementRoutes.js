import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  publishAnnouncement,
  archiveAnnouncement,
} from '../controllers/announcementController.js';

const router = Router();

// Protect all announcement endpoints
router.use(protect);

// 1. Announcements collection & creation
router
  .route('/')
  .post(authorizeRoles('ADMIN', 'MANAGER'), createAnnouncement)
  .get(getAnnouncements);

// 2. Specific announcement state transitions
router.patch(
  '/:id/publish',
  authorizeRoles('ADMIN', 'MANAGER'),
  publishAnnouncement
);

router.patch(
  '/:id/archive',
  authorizeRoles('ADMIN', 'MANAGER'),
  archiveAnnouncement
);

// 3. Announcement item query and update
router
  .route('/:id')
  .get(getAnnouncementById)
  .patch(authorizeRoles('ADMIN', 'MANAGER'), updateAnnouncement);

export default router;
