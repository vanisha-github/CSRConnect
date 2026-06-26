import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

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
  uploadProfileImage: (formData) => api.post('/ngos/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  removeProfileImage: () => api.delete('/ngos/profile-image'),
  getGallery: () => api.get('/ngos/gallery'),
  uploadGalleryImage: (formData) => api.post('/ngos/gallery', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteGalleryImage: (id) => api.delete(`/ngos/gallery/${id}`),
};

// Companies
export const companyAPI = {
  register: (data) => api.post('/companies/register', data),
  getMyCompany: () => api.get('/companies/me'),
  getAll: () => api.get('/companies'),
  update: (id, data) => api.put(`/companies/${id}`, data),
  uploadProfileImage: (formData) => api.post('/companies/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  removeProfileImage: () => api.delete('/companies/profile-image'),
  getGallery: () => api.get('/companies/gallery'),
  uploadGalleryImage: (formData) => api.post('/companies/gallery', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteGalleryImage: (id) => api.delete(`/companies/gallery/${id}`),
};

// Projects
export const projectAPI = {
  create: (data) => api.post('/projects', data),
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  assignNgo: (id, ngo_id) => api.patch(`/projects/${id}/assign`, { ngo_id }),
  uploadCoverImage: (id, formData) => api.post(`/projects/${id}/cover-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  removeCoverImage: (id) => api.delete(`/projects/${id}/cover-image`),
  verify: (id, verified) => api.patch(`/projects/${id}/verify`, { verified }),
};

// Updates
export const updateAPI = {
  add: (data) => api.post('/updates', data),
  addWithFile: (formData) => api.post('/updates', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getByProject: (projectId) => api.get(`/updates/${projectId}`),
  update: (id, data) => api.put(`/updates/${id}`, data),
  updateWithFile: (id, formData) => api.put(`/updates/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/updates/${id}`),
  toggleVisibility: (id, is_public) => api.patch(`/updates/${id}/visibility`, { is_public }),
  review: (id, data) => api.patch(`/updates/${id}/review`, data),
};

// Documents
export const documentAPI = {
  upload: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getByProject: (projectId) => api.get(`/documents/${projectId}`),
  delete: (id) => api.delete(`/documents/${id}`),
  toggleVisibility: (id, is_public) => api.patch(`/documents/${id}/visibility`, { is_public }),
  review: (id, data) => api.patch(`/documents/${id}/review`, data),
  getDownloadUrl: (filePath, fileName) => {
    if (!filePath) return '#';
    return `${API_BASE}/files/download?url=${encodeURIComponent(filePath)}&name=${encodeURIComponent(fileName || 'file')}`;
  },
  isImage: (fileName) => /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(fileName),
  getMyGallery: () => api.get('/documents/my-gallery'),
};

// Public (no auth required)
export const publicAPI = {
  getProjects: () => api.get('/public/projects'),
  getProjectById: (id) => api.get(`/public/projects/${id}`),
  getNgos: () => api.get('/public/ngos'),
  getNgoById: (id) => api.get(`/public/ngos/${id}`),
  getGallery: () => api.get('/public/gallery'),
};

export const fileAPI = {
  getDownloadUrl: (url, name) => `${API_BASE}/files/download?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name || 'file')}`,
};
export const analyticsAPI = {
  getAdminStats: () => api.get('/analytics/admin'),
  getNgoPerformance: () => api.get('/analytics/ngo-performance'),
  getCompanyStats: () => api.get('/analytics/company'),
  getNgoStats: () => api.get('/analytics/ngo-stats'),
  getPublicStats: () => api.get('/analytics/public'),
  getMapData: () => api.get('/analytics/map'),
  getEsgMetrics: () => api.get('/analytics/esg'),
  getCompanyEsgMetrics: () => api.get('/analytics/company-esg'),
};
