import axios from "axios";
import useAuthStore from "../stores/authStore";

const instance = axios.create({
  baseURL: "http://localhost:5005/api",
  withCredentials: true,
});

// Response Interceptor for handling global session expiration
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the error is 401 and NOT from the login endpoint
    if (error.response && error.response.status === 401 && !error.config.url.endsWith("/auth/login")) {
      // Token expired or invalid
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default instance;
