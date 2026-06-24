import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
};

// NGOs
export const ngoAPI = {
  register: (data) => api.post('/ngos/register', data),
  getAll: () => api.get('/ngos'),
  getById: (id) => api.get(`/ngos/${id}`),
  getMyNgo: () => api.get('/ngos/me'),
  verify: (id) => api.patch(`/ngos/${id}/verify`),
  reject: (id) => api.patch(`/ngos/${id}/reject`),
  update: (id, data) => api.put(`/ngos/${id}`, data),
};

// Companies
export const companyAPI = {
  register: (data) => api.post('/companies/register', data),
  getMyCompany: () => api.get('/companies/me'),
  getAll: () => api.get('/companies'),
};

// Projects
export const projectAPI = {
  create: (data) => api.post('/projects', data),
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  assignNgo: (id, ngo_id) => api.patch(`/projects/${id}/assign`, { ngo_id }),
};

// Updates
export const updateAPI = {
  add: (data) => api.post('/updates', data),
  getByProject: (projectId) => api.get(`/updates/${projectId}`),
  update: (id, data) => api.put(`/updates/${id}`, data),
};

// Documents
export const documentAPI = {
  upload: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getByProject: (projectId) => api.get(`/documents/${projectId}`),
  delete: (id) => api.delete(`/documents/${id}`),
  getDownloadUrl: (id) => `${API_BASE}/documents/download/${id}`,
};

// Public (no auth required)
export const publicAPI = {
  getProjects: () => api.get('/public/projects'),
  getNgos: () => api.get('/public/ngos'),
};

// Analytics
export const analyticsAPI = {
  getAdminStats: () => api.get('/analytics/admin'),
  getNgoPerformance: () => api.get('/analytics/ngo-performance'),
  getCompanyStats: () => api.get('/analytics/company'),
  getNgoStats: () => api.get('/analytics/ngo-stats'),
  getPublicStats: () => api.get('/analytics/public'),
  getMapData: () => api.get('/analytics/map'),
  getEsgMetrics: () => api.get('/analytics/esg'),
};
