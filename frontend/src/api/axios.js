import axios from 'axios';

// Base URL: during dev, Vite proxies /api to localhost:8080.
// In production, set VITE_API_URL in .env.
const defaultDevApiBase = 'http://localhost:8080/api';
const configuredBase = (import.meta.env.VITE_API_URL || '').trim();

function normalizeApiBase(url) {
  if (!url) return '';
  const trimmed = url.replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

const baseURL = normalizeApiBase(configuredBase) ||
  (import.meta.env.DEV ? defaultDevApiBase : '/api');

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Attach JWT to every outgoing request.
api.interceptors.request.use(
  (config) => {
    const token = window.__ecoverse_token__ || sessionStorage.getItem('ecoverse_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Let the browser set multipart boundaries for FormData uploads.
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth failures globally.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const skipAuthRedirect = error.config?.skipAuthRedirect === true;
    if (status === 401 && !skipAuthRedirect) {
      window.__ecoverse_token__ = null;
      sessionStorage.removeItem('ecoverse_token');
      sessionStorage.removeItem('ecoverse_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
