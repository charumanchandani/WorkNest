import announcementService from '../services/announcementService.js';
import { sendSuccess } from '../utils/responseHandler.js';

/**
 * Create announcement (Admin or Manager)
 * POST /api/announcements
 */
export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, targetType, department, expiresAt, status } = req.body;

    const announcement = await announcementService.createAnnouncement({
      title,
      content,
      targetType,
      department,
      expiresAt,
      status,
      user: req.user,
    });

    return sendSuccess(res, 201, 'Announcement created successfully.', { announcement });
  } catch (error) {
    next(error);
  }
};

/**
 * List announcements with filters, search, and pagination
 * GET /api/announcements
 */
export const getAnnouncements = async (req, res, next) => {
  try {
    const result = await announcementService.getAnnouncements({
      user: req.user,
      query: req.query,
    });

    return sendSuccess(res, 200, 'Announcements retrieved successfully.', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single announcement details
 * GET /api/announcements/:id
 */
export const getAnnouncementById = async (req, res, next) => {
  try {
    const announcement = await announcementService.getAnnouncementById(req.params.id, req.user);
    return sendSuccess(res, 200, 'Announcement retrieved successfully.', { announcement });
  } catch (error) {
    next(error);
  }
};

/**
 * Update announcement (Admin or authorized Manager)
 * PATCH /api/announcements/:id
 */
export const updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await announcementService.updateAnnouncement(
      req.params.id,
      req.body,
      req.user
    );

    return sendSuccess(res, 200, 'Announcement updated successfully.', { announcement });
  } catch (error) {
    next(error);
  }
};

/**
 * Publish a draft announcement
 * PATCH /api/announcements/:id/publish
 */
export const publishAnnouncement = async (req, res, next) => {
  try {
    const announcement = await announcementService.publishAnnouncement(req.params.id, req.user);
    return sendSuccess(res, 200, 'Announcement published successfully.', { announcement });
  } catch (error) {
    next(error);
  }
};

/**
 * Archive an announcement
 * PATCH /api/announcements/:id/archive
 */
export const archiveAnnouncement = async (req, res, next) => {
  try {
    const announcement = await announcementService.archiveAnnouncement(req.params.id, req.user);
    return sendSuccess(res, 200, 'Announcement archived successfully.', { announcement });
  } catch (error) {
    next(error);
  }
};

export default {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  publishAnnouncement,
  archiveAnnouncement,
};
