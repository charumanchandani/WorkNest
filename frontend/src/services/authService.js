import apiClient from './api';

export const authService = {
  /**
   * Register a new user
   */
  async register({ name, email, password }) {
    const response = await apiClient.post('/auth/register', {
      name,
      email,
      password,
    });
    return response.data;
  },

  /**
   * Authenticate user credentials
   */
  async login({ email, password }) {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  /**
   * Fetch current authenticated user session
   */
  async getMe() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  /**
   * Invalidate session and clear auth cookie
   */
  async logout() {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
};

export default authService;
