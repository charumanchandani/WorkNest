import apiClient from './api';

export const leaveService = {
  /**
   * Submit a new leave request
   */
  async createLeave({ leaveType, startDate, endDate, reason }) {
    const response = await apiClient.post('/leaves', {
      leaveType,
      startDate,
      endDate,
      reason,
    });
    return response.data;
  },

  /**
   * Fetch personal leave requests with pagination and filters
   */
  async getMyLeaves({
    page = 1,
    limit = 20,
    status = '',
    leaveType = '',
    from = '',
    to = '',
  } = {}) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (status && status !== 'ALL') params.append('status', status);
    if (leaveType && leaveType !== 'ALL') params.append('leaveType', leaveType);
    if (from) params.append('from', from);
    if (to) params.append('to', to);

    const response = await apiClient.get(`/leaves/my?${params.toString()}`);
    return response.data;
  },

  /**
   * Fetch authenticated employee's leave balance quotas and usage
   */
  async getMyBalance(year = '') {
    const params = new URLSearchParams();
    if (year) params.append('year', year);

    const response = await apiClient.get(`/leaves/my/balance?${params.toString()}`);
    return response.data;
  },

  /**
   * Fetch single leave request details
   */
  async getLeaveById(id) {
    const response = await apiClient.get(`/leaves/${id}`);
    return response.data;
  },

  /**
   * Cancel personal pending leave request
   */
  async cancelLeave(id) {
    const response = await apiClient.patch(`/leaves/${id}/cancel`);
    return response.data;
  },

  /**
   * Fetch organization/department leave requests for review (Admin & Manager)
   */
  async getManageLeaves({
    page = 1,
    limit = 20,
    search = '',
    department = '',
    employee = '',
    status = '',
    leaveType = '',
    from = '',
    to = '',
  } = {}) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (search && search.trim()) params.append('search', search.trim());
    if (department && department !== 'ALL') params.append('department', department);
    if (employee) params.append('employee', employee);
    if (status && status !== 'ALL') params.append('status', status);
    if (leaveType && leaveType !== 'ALL') params.append('leaveType', leaveType);
    if (from) params.append('from', from);
    if (to) params.append('to', to);

    const response = await apiClient.get(`/leaves/manage?${params.toString()}`);
    return response.data;
  },

  /**
   * Approve a pending leave request
   */
  async approveLeave(id, reviewComment = '') {
    const response = await apiClient.patch(`/leaves/${id}/approve`, {
      reviewComment,
    });
    return response.data;
  },

  /**
   * Reject a pending leave request
   */
  async rejectLeave(id, reviewComment = '') {
    const response = await apiClient.patch(`/leaves/${id}/reject`, {
      reviewComment,
    });
    return response.data;
  },
};

export default leaveService;
