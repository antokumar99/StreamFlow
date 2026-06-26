import axios from "axios";
import {
  clearAuthToken,
  getAuthToken,
} from "./authToken";

const api = axios.create({
  baseURL:
     process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:4000/api",

  headers: {
    "Content-Type": "application/json",
  },

  withCredentials: true,
});

/* =========================
   REQUEST INTERCEPTOR
   Automatically attach token
   ========================= */

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token =
        getAuthToken();

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

/* =========================
   RESPONSE INTERCEPTOR
   Handle global errors
   ========================= */

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      console.log("Unauthorized user");

      // remove token if stored
      clearAuthToken();

      // redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);


export default api;
