import axios from 'axios';

// Base URL — during dev, Vite proxies /api → localhost:8080
// In production, set VITE_API_URL in .env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ── Request interceptor: attach JWT to every outgoing request ────────────
api.interceptors.request.use(
  (config) => {
    // Token is stored in memory via AuthContext (not localStorage)
    const token = window.__ecoverse_token__;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 globally ────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear token and redirect to login
      window.__ecoverse_token__ = null;
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;