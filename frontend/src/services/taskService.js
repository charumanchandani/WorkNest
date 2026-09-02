import api from './api';

/**
 * Task Management Frontend API Client
 */
export const taskService = {
  /**
   * Create a new task (Manager / Admin)
   */
  async createTask(payload) {
    const response = await api.post('/tasks', payload);
    return response.data;
  },

  /**
   * Get organization / department tasks (Manager / Admin / Employee scoped)
   */
  async getTasks(params = {}) {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  /**
   * Get personal tasks for authenticated employee
   */
  async getMyTasks(params = {}) {
    const response = await api.get('/tasks/my', { params });
    return response.data;
  },

  /**
   * Get single task details
   */
  async getTaskById(id) {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  /**
   * Update task metadata (Manager / Admin)
   */
  async updateTask(id, payload) {
    const response = await api.patch(`/tasks/${id}`, payload);
    return response.data;
  },

  /**
   * Update task progress status (Employee assignee or Manager / Admin)
   */
  async updateTaskStatus(id, status) {
    const response = await api.patch(`/tasks/${id}/status`, { status });
    return response.data;
  },
};

export default taskService;
