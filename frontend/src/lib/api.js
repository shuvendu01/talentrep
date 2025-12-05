import axios from 'axios';

// Get API URL from environment or use current origin
const API_URL = typeof window !== 'undefined' && window.location.origin 
  ? window.location.origin 
  : process.env.NEXT_PUBLIC_BACKEND_URL || 'https://talenthub-10.preview.emergentagent.com';

// Get API Key from environment
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'talenthub-api-key-dev-2025-change-in-production';

console.log('API URL:', API_URL);
console.log('API Key configured:', API_KEY ? 'Yes' : 'No');

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY, // Add API key to all requests
  },
  withCredentials: false,
  timeout: 30000, // 30 second timeout
});

// Add auth token and API key to requests
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // Add JWT token if available
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Ensure API key is always present
      if (!config.headers['X-API-Key']) {
        config.headers['X-API-Key'] = API_KEY;
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
