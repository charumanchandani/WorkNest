import express from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  getPreferences,
  updatePreferences,
} from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All profile and settings routes require authentication
router.use(protect);

router.route('/')
  .get(getProfile)
  .patch(updateProfile);

router.post('/change-password', changePassword);

router.route('/preferences')
  .get(getPreferences)
  .patch(updatePreferences);

export default router;
