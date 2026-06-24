import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rat_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('rat_token');
      localStorage.removeItem('rat_admin');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
};

// Devices
export const devicesAPI = {
  getAll: (params) => api.get('/devices', { params }),
  getOne: (deviceId) => api.get(`/devices/${deviceId}`),
  delete: (deviceId) => api.delete(`/devices/${deviceId}`),
};

// Data
export const dataAPI = {
  getDeviceData: (deviceId, params) => api.get(`/data/${deviceId}`, { params }),
  deletePhoto: (photoId) => api.delete(`/data/photo/${photoId}`),
  deleteRecording: (recordingId) => api.delete(`/data/recording/${recordingId}`),
};

// Commands
export const commandsAPI = {
  send: (deviceId, type, params) => api.post('/commands/send', { deviceId, type, params }),
  broadcast: (type, params) => api.post('/commands/broadcast', { type, params }),
  getHistory: (deviceId) => api.get(`/commands/${deviceId}`),
};

// APK Builder
export const apkBuilderAPI = {
  generate: (config) => api.post('/apk-builder/generate', config),
  getStatus: () => api.get('/apk-builder/status'),
};

export default api;

