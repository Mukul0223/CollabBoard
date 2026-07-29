import axios from "axios";
import { useAuthStore } from "../store/authStore";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach JWT Token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Catch 401 Unauthenticated Errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and user session if unauthenticated/token expired
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

export default API;
