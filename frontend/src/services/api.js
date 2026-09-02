import axios from 'axios';
import { API_BASE_URL } from '../constants';

/**
 * Centralized Axios client instance for WorkNest.
 * Configured with base URL, credentials support for HttpOnly cookies, and interceptors.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for centralized error message formatting
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract server message or fallback to network error
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred.';
    error.formattedMessage = message;
    return Promise.reject(error);
  }
);

export default apiClient;
