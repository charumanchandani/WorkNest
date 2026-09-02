import apiClient from './api';

export const departmentService = {
  /**
   * Fetch paginated departments list with optional search and status filters
   */
  async getDepartments({ page = 1, limit = 10, search = '', status = '' } = {}) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (search && search.trim()) params.append('search', search.trim());
    if (status && status !== 'ALL') params.append('status', status);

    const response = await apiClient.get(`/departments?${params.toString()}`);
    return response.data;
  },

  /**
   * Fetch single department details with assigned employees
   */
  async getDepartment(id) {
    const response = await apiClient.get(`/departments/${id}`);
    return response.data;
  },

  /**
   * Create new department (Admin only)
   */
  async createDepartment(departmentData) {
    const response = await apiClient.post('/departments', departmentData);
    return response.data;
  },

  /**
   * Update department info (Admin only)
   */
  async updateDepartment(id, updateData) {
    const response = await apiClient.patch(`/departments/${id}`, updateData);
    return response.data;
  },

  /**
   * Activate or Deactivate department (Admin only)
   */
  async updateDepartmentStatus(id, status) {
    const response = await apiClient.patch(`/departments/${id}/status`, { status });
    return response.data;
  },

  /**
   * Assign or remove department manager (Admin only)
   */
  async updateDepartmentManager(id, manager) {
    const response = await apiClient.patch(`/departments/${id}/manager`, { manager });
    return response.data;
  },
};

export default departmentService;
