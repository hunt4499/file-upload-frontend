import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000',  // or your API URL
  timeout: 10000,
});

// Add auth token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;