import api from './api';

/**
 * Document Vault Frontend Service
 */
export const documentService = {
  /**
   * List documents with server-side filters & pagination
   */
  async getDocuments(params = {}) {
    const response = await api.get('/documents', { params });
    return response.data;
  },

  /**
   * Get single document metadata
   */
  async getDocumentById(id) {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  /**
   * Upload a new document with FormData (Admin only)
   */
  async uploadDocument(formData) {
    const response = await api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Securely download document binary
   */
  async downloadDocument(id, defaultFileName = 'document') {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });

    // Create a temporary link element to trigger browser download
    const blob = new Blob([response.data], {
      type: response.headers['content-type'] || 'application/octet-stream',
    });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = defaultFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    return true;
  },

  /**
   * Update document metadata (Admin only)
   */
  async updateDocument(id, payload) {
    const response = await api.patch(`/documents/${id}`, payload);
    return response.data;
  },

  /**
   * Archive document (Admin only)
   */
  async archiveDocument(id) {
    const response = await api.patch(`/documents/${id}/archive`);
    return response.data;
  },
};

export default documentService;
