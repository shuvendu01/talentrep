import axios from 'axios';

// Use the production URL directly since we're having env variable issues
const API_URL = typeof window !== 'undefined' && window.location.origin 
  ? window.location.origin 
  : 'https://jobvista-1.preview.emergentagent.com';

console.log('API URL:', API_URL);

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
  timeout: 30000, // 30 second timeout
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling and session management
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors (expired token or invalid session)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear invalid token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        
        // Only redirect if not already on login/register pages
        const publicPaths = ['/auth/login', '/auth/register', '/auth/verify', '/', '/auth/forgot-password'];
        const currentPath = window.location.pathname;
        
        if (!publicPaths.some(path => currentPath.startsWith(path))) {
          window.location.href = '/auth/login';
        }
      }
    }
    
    if (error.response) {
      // Server responded with error
      console.error('API Error Response:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('API No Response:', error.request);
      console.error('Request URL:', error.config?.url);
    } else {
      // Error in request setup
      console.error('API Request Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
