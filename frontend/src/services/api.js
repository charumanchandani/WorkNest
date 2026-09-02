import axios from 'axios';
import { API_BASE_URL } from '../constants';

/**
 * Centralized Axios client instance for WorkNest.
 * Configured with base URL, standard JSON headers, and extensible interceptors.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for token attachment in future auth phase
apiClient.interceptors.request.use(
  (config) => {
    // Token resolution logic will be integrated in Phase 3
    const token = localStorage.getItem('worknest_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error response handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error response interceptor
    return Promise.reject(error);
  }
);

export default apiClient;
