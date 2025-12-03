import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ✅ VERY IMPORTANT
});

// ✅ No token interceptor needed anymore
api.interceptors.request.use((config) => {
  return config;
});

export default api;
