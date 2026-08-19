import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  withCredentials: true,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // If 401, clear stale token
    if (err.response?.status === 401) {
      localStorage.removeItem("jwt_token");
    }
    const message = err.response?.data?.message || err.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

export default api;
