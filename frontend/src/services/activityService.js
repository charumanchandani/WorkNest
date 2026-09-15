import api from './api';

/**
 * Activity & Audit Feed Frontend Service
 */
export const activityService = {
  /**
   * Retrieve RBAC-scoped paginated activity feed
   */
  async getActivities(params = {}) {
    const response = await api.get('/activities', { params });
    return response.data;
  },
};

export default activityService;
