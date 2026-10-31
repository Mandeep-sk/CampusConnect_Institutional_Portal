import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle auth expirations
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear local session if token is stale
      const originalRequest = error.config;
      if (originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/register') {
        localStorage.removeItem('cc_token');
        localStorage.removeItem('cc_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
