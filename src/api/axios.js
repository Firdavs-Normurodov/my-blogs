import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: process.env.BACKEND_URL + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token management
api.interceptors.response.use(
  (response) => {
    // If the response includes a token, store it
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';

    // Don't show error toast for auth check failures
    if (!(error.config.url.includes('/user/profile') && error.response?.status === 401)) {
      toast.error(message);
    }

    // If token is invalid, remove it
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }

    return Promise.reject(error);
  }
);

export default api;
