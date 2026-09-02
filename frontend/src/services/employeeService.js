import apiClient from './api';

export const employeeService = {
  /**
   * Fetch paginated employees list with optional search, role, and status filters
   */
  async getEmployees({ page = 1, limit = 10, search = '', role = '', status = '' } = {}) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (search && search.trim()) params.append('search', search.trim());
    if (role && role !== 'ALL') params.append('role', role);
    if (status && status !== 'ALL') params.append('status', status);

    const response = await apiClient.get(`/employees?${params.toString()}`);
    return response.data;
  },

  /**
   * Fetch single employee details by ID
   */
  async getEmployee(id) {
    const response = await apiClient.get(`/employees/${id}`);
    return response.data;
  },

  /**
   * Create new employee record (Admin only)
   */
  async createEmployee(employeeData) {
    const response = await apiClient.post('/employees', employeeData);
    return response.data;
  },

  /**
   * Update existing employee profile details (Admin only)
   */
  async updateEmployee(id, updateData) {
    const response = await apiClient.patch(`/employees/${id}`, updateData);
    return response.data;
  },

  /**
   * Activate or Deactivate employee account (Admin only)
   */
  async updateEmployeeStatus(id, status) {
    const response = await apiClient.patch(`/employees/${id}/status`, { status });
    return response.data;
  },
};

export default employeeService;
