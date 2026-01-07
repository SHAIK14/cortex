import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for injecting JWT
api.interceptors.request.use((config) => {
  // We can't use useAuthStore.getState() directly if we want to avoid SSR issues,
  // but for client-side requests, it's fine.
  if (typeof window !== 'undefined') {
    const { token } = JSON.parse(localStorage.getItem('cortex-auth-storage') || '{}')?.state || {};
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
