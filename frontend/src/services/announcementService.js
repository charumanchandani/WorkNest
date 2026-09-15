import api from './api';

/**
 * Company Announcements Frontend Service
 */
export const announcementService = {
  /**
   * List announcements (Feed or Management view)
   */
  async getAnnouncements(params = {}) {
    const response = await api.get('/announcements', { params });
    return response.data;
  },

  /**
   * Get single announcement
   */
  async getAnnouncementById(id) {
    const response = await api.get(`/announcements/${id}`);
    return response.data;
  },

  /**
   * Create new announcement (Admin or Manager)
   */
  async createAnnouncement(payload) {
    const response = await api.post('/announcements', payload);
    return response.data;
  },

  /**
   * Update announcement (Admin or authorized Manager)
   */
  async updateAnnouncement(id, payload) {
    const response = await api.patch(`/announcements/${id}`, payload);
    return response.data;
  },

  /**
   * Publish draft announcement
   */
  async publishAnnouncement(id) {
    const response = await api.patch(`/announcements/${id}/publish`);
    return response.data;
  },

  /**
   * Archive announcement
   */
  async archiveAnnouncement(id) {
    const response = await api.patch(`/announcements/${id}/archive`);
    return response.data;
  },
};

export default announcementService;
