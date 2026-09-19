import api from './api';

export const profileService = {
  /**
   * Retrieves safe profile for authenticated user
   */
  async getProfile() {
    return api.get('/profile');
  },

  /**
   * Updates whitelisted profile fields
   */
  async updateProfile(profileData) {
    return api.patch('/profile', profileData);
  },

  /**
   * Changes account password
   */
  async changePassword({ currentPassword, newPassword, confirmPassword }) {
    return api.post('/profile/change-password', {
      currentPassword,
      newPassword,
      confirmPassword,
    });
  },

  /**
   * Retrieves notification preferences
   */
  async getPreferences() {
    return api.get('/profile/preferences');
  },

  /**
   * Updates notification preferences
   */
  async updatePreferences(preferences) {
    return api.patch('/profile/preferences', preferences);
  },
};

export default profileService;
