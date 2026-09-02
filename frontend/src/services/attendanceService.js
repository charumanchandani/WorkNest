import apiClient from './api';

export const attendanceService = {
  /**
   * Check in authenticated user for today
   */
  async checkIn() {
    const response = await apiClient.post('/attendance/check-in');
    return response.data;
  },

  /**
   * Check out authenticated user for today
   */
  async checkOut() {
    const response = await apiClient.post('/attendance/check-out');
    return response.data;
  },

  /**
   * Fetch today's check-in / check-out status
   */
  async getTodayAttendance() {
    const response = await apiClient.get('/attendance/today');
    return response.data;
  },

  /**
   * Fetch personal attendance history with filters & pagination
   */
  async getMyAttendance({ page = 1, limit = 20, from = '', to = '', status = '' } = {}) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    if (status && status !== 'ALL') params.append('status', status);

    const response = await apiClient.get(`/attendance/my?${params.toString()}`);
    return response.data;
  },

  /**
   * Fetch monthly attendance statistics summary
   */
  async getMySummary(month = '') {
    const params = new URLSearchParams();
    if (month) params.append('month', month);

    const response = await apiClient.get(`/attendance/my/summary?${params.toString()}`);
    return response.data;
  },

  /**
   * Fetch organization or department-wide attendance monitoring list (Admin & Manager)
   */
  async getAttendance({
    page = 1,
    limit = 20,
    employee = '',
    department = '',
    status = '',
    from = '',
    to = '',
    search = '',
  } = {}) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (employee) params.append('employee', employee);
    if (department && department !== 'ALL') params.append('department', department);
    if (status && status !== 'ALL') params.append('status', status);
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    if (search && search.trim()) params.append('search', search.trim());

    const response = await apiClient.get(`/attendance?${params.toString()}`);
    return response.data;
  },

  /**
   * Fetch single attendance record details
   */
  async getAttendanceById(id) {
    const response = await apiClient.get(`/attendance/${id}`);
    return response.data;
  },
};

export default attendanceService;
