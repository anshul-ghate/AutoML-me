import api from './api';

export const enterpriseApi = {
  // Authentication
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  
  // Enhanced Evaluation
  getEnhancedEvaluation: (sessionId: string) =>
    api.get(`/api/enterprise-training/evaluate/${sessionId}`),
  
  // Batch Prediction
  batchPredict: (sessionId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/api/enterprise-training/predict/batch?session_id=${sessionId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Generate Report
  generateReport: (sessionId: string, format: string = 'pdf') =>
    api.get(`/api/enterprise-training/export/report/${sessionId}?format=${format}`, {
      responseType: 'blob'
    }),
  
  // Get Prediction Schema
  getPredictionSchema: (sessionId: string) =>
    api.get(`/api/enterprise-training/schema/${sessionId}`),
  
  // Audit
  getAuditData: (userId: string, days: number = 7) =>
    api.get(`/api/enterprise-training/audit/${userId}?days=${days}`)
};
