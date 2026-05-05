import axios from 'axios';

const apiBaseURL = import.meta.env.VITE_API_URL || (
  import.meta.env.PROD ? '/_/backend/api' : `${window.location.protocol}//${window.location.hostname}:5000/api`
);

const api = axios.create({
  baseURL: apiBaseURL
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
