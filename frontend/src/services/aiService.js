import { apiClient } from './api';

export const aiService = {
  /**
   * Fetch current AI availability status
   */
  async getAIStatus() {
    return apiClient.get('/ai/status');
  },

  /**
   * Request AI task summary
   */
  async getTaskSummary(taskId) {
    return apiClient.post('/ai/task-summary', { taskId });
  },

  /**
   * Request AI leave application draft
   */
  async generateLeaveDraft({ leaveType, startDate, endDate, reason }) {
    return apiClient.post('/ai/leave-draft', {
      leaveType,
      startDate,
      endDate,
      reason,
    });
  },

  /**
   * Request AI document summary
   */
  async getDocumentSummary(documentId) {
    return apiClient.post('/ai/document-summary', { documentId });
  },

  /**
   * Request AI productivity insights
   */
  async getProductivityInsight(params = {}) {
    return apiClient.post('/ai/productivity-insight', params);
  },
};

export default aiService;
