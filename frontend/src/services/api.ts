// API Service Configuration
import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
  timeout: 120000, // 2 minutes for long-running operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('automl_user');
      window.location.href = '/login';
    } else if (error.response?.status === 413) {
      // File too large
      error.message = 'File size exceeds the maximum limit of 50MB';
    } else if (error.code === 'ECONNABORTED') {
      // Timeout
      error.message = 'Request timeout - operation took too long';
    } else if (!error.response) {
      // Network error
      error.message = 'Network error - please check your connection';
    }
    
    return Promise.reject(error);
  }
);

// API endpoint functions
export const apiEndpoints = {
  // Authentication
  auth: {
    login: (credentials: { email: string; password: string }) =>
      api.post('/api/auth/login', credentials),
    register: (userData: { name: string; email: string; password: string }) =>
      api.post('/api/auth/register', userData),
    logout: () => api.post('/api/auth/logout'),
    me: () => api.get('/api/auth/me'),
  },

  // Training workflow
  training: {
    analyze: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post('/api/training/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });
    },
    
    featureEngineer: (file: File, targetColumn: string) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post(
        `/api/training/feature-engineer?target_col=${encodeURIComponent(targetColumn)}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 120000,
        }
      );
    },
    
    train: (config: {
      file: File;
      targetColumn: string;
      testSize: number;
      cvFolds: number;
      autoFeatureEngineering: boolean;
    }) => {
      const formData = new FormData();
      formData.append('file', config.file);
      formData.append('target_column', config.targetColumn);
      formData.append('test_size', config.testSize.toString());
      formData.append('cv_folds', config.cvFolds.toString());
      formData.append('auto_feature_engineering', config.autoFeatureEngineering.toString());
      
      return api.post('/api/training/train', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000, // 5 minutes for training
      });
    },
    
    predict: (sessionId: string, features: Record<string, number>) =>
      api.post('/api/training/predict', {
        session_id: sessionId,
        features,
      }),
    
    evaluate: (sessionId: string) =>
      api.get(`/api/training/evaluate/${sessionId}`),
    
    exportModel: (sessionId: string) =>
      api.get(`/api/training/export/model/${sessionId}`, {
        responseType: 'blob',
      }),
    
    getProgress: (sessionId: string) =>
      api.get(`/api/training/progress/${sessionId}`),
  },

  // Projects management
  projects: {
    list: () => api.get('/api/projects'),
    get: (id: string) => api.get(`/api/projects/${id}`),
    create: (project: { name: string; description?: string }) =>
      api.post('/api/projects', project),
    update: (id: string, updates: Partial<{ name: string; description: string }>) =>
      api.put(`/api/projects/${id}`, updates),
    delete: (id: string) => api.delete(`/api/projects/${id}`),
  },

  // Insights and analytics
  insights: {
    getModelHealth: () => api.get('/api/insights/model-health'),
    getRecommendations: () => api.get('/api/insights/recommendations'),
    getPerformanceMetrics: (modelId?: string) =>
      api.get(`/api/insights/performance${modelId ? `?model_id=${modelId}` : ''}`),
  },
};

export default api;