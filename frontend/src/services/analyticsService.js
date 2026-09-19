import { apiClient } from './api';

export const analyticsService = {
  /**
   * Fetch overview metrics (role-scoped)
   */
  async getOverviewAnalytics(params = {}) {
    return apiClient.get('/analytics/overview', { params });
  },

  /**
   * Fetch attendance analytics and trends
   */
  async getAttendanceAnalytics(params = {}) {
    return apiClient.get('/analytics/attendance', { params });
  },

  /**
   * Fetch leave analytics and type breakdowns
   */
  async getLeaveAnalytics(params = {}) {
    return apiClient.get('/analytics/leave', { params });
  },

  /**
   * Fetch task completion and priority metrics
   */
  async getTaskAnalytics(params = {}) {
    return apiClient.get('/analytics/tasks', { params });
  },

  /**
   * Fetch employee distribution metrics (Manager & Admin only)
   */
  async getEmployeeAnalytics(params = {}) {
    return apiClient.get('/analytics/employees', { params });
  },

  /**
   * Fetch department workload & attendance metrics (Manager & Admin only)
   */
  async getDepartmentAnalytics(params = {}) {
    return apiClient.get('/analytics/departments', { params });
  },

  /**
   * Fetch structured report JSON data
   */
  async getReport(type, params = {}) {
    return apiClient.get(`/reports/${type}`, { params });
  },

  /**
   * Trigger backend CSV download for the specified report
   */
  async downloadReportCsv(type, params = {}) {
    const response = await apiClient.get(`/reports/${type}`, {
      params: { ...params, format: 'csv' },
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Get filename from Content-Disposition header if available or fallback
    const disposition = response.headers?.['content-disposition'];
    let filename = `worknest-${type}-report.csv`;
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default analyticsService;
