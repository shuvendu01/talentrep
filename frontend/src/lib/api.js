import axios from 'axios';

// Use the production URL directly since we're having env variable issues
const API_URL = typeof window !== 'undefined' && window.location.origin 
  ? window.location.origin 
  : 'https://hiresafe-2.preview.emergentagent.com';

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

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
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
