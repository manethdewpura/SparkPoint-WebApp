import axios from "axios";
import store from "../store/Store";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateAccessToken,
} from "../store/authSlice";

const API_URL = import.meta.env.VITE_BASE_URL;

const api = axios.create({ baseURL: import.meta.env.VITE_BASE_URL });

export const login = async (loginData) => {
  // Dispatch login start action
  store.dispatch(loginStart());

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
      credentials: "include", // Include cookies for refresh token
    });

    const data = await response.json();

    if (response.ok && data.accessToken) {
      // Set default Authorization header for future requests
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${data.accessToken}`;

      // Dispatch login success action with user data and token
      store.dispatch(
        loginSuccess({
          user: data.user,
          accessToken: data.accessToken,
        })
      );
    } else {
      // Dispatch login failure action
      store.dispatch(loginFailure(data.message || "Login failed"));
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
      // Send logout request to server
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.auth.accessToken}`,
        },
        body: JSON.stringify({ userId }),
        credentials: "include",
      });
    }

    // Clear Redux state
    store.dispatch(logout());

    // Clear Authorization header
    delete api.defaults.headers.common["Authorization"];

    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    // Still clear local state even if server request fails
    store.dispatch(logout());
    delete api.defaults.headers.common["Authorization"];
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
        const res = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newAccessToken = res.data.accessToken;

        // Update Redux store
        store.dispatch(updateAccessToken(newAccessToken));

        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        return api(originalRequest); // retry
      } catch (refreshError) {
        // refresh failed → force logout
        console.error("Token refresh failed:", refreshError);

        // Dispatch logout action
        store.dispatch(logout());

        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
