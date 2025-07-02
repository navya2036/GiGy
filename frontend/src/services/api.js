import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Create an Axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo?.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
