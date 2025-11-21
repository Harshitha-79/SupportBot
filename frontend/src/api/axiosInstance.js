import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",
});

// Add request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("401 Unauthorized - clearing session and redirecting to login");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("role");
      sessionStorage.removeItem("userId");
      window.location.href = "/login";
      return;
    }
    console.error("Response error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default instance;
