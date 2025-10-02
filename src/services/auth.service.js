import axios from "axios";
import store from "../store/Store";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
} from "../store/authSlice";

const API_URL = import.meta.env.VITE_BASE_URL;

// Axios client configured to use proxy and send httpOnly cookies
const api = axios.create({ baseURL: "/api", withCredentials: true });

export const login = async (loginData) => {
  // Dispatch login start action
  store.dispatch(loginStart());

  try {
    const { data } = await api.post(`/auth/login`, loginData, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });

    if (data?.user) {
      store.dispatch(
        loginSuccess({
          user: data.user,
        })
      );
    } else {
      store.dispatch(loginFailure(data?.message || "Login failed"));
    }

    return data;
  } catch (error) {
    // Dispatch login failure action on error
    store.dispatch(loginFailure(error.message || "Network error"));
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    // Get user data from Redux store
    const state = store.getState();
    const userId = state.auth.user?.id;

    if (userId) {
      // Send logout request to server (cookie-based)
      await api.post(
        `/auth/logout`,
        { userId },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Clear Redux state
    store.dispatch(logout());

    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    // Still clear local state even if server request fails
    store.dispatch(logout());
    return { success: false, error: error.message };
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const state = store.getState();
        const userId = state?.auth?.user?.id;
        await axios.post(
          `/api/auth/refresh`,
          { userId },
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );
        return api(originalRequest); // retry with refreshed cookie
      } catch (refreshError) {
        // refresh failed → force logout
        console.error("Token refresh failed:", refreshError);

        // Dispatch logout action and let UI handle navigation
        store.dispatch(logout());
      }
    }

    return Promise.reject(error);
  }
);

export default api;
