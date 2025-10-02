import { createSlice } from "@reduxjs/toolkit";

// Cookie utility functions
const setCookie = (name, value) => {
  if (typeof document === "undefined") return; // SSR safety check

  const isSecure = window.location.protocol === "https:";
  const secureFlag = isSecure ? ";secure" : "";

  document.cookie = `${name}=${JSON.stringify(
    value
  )};path=/${secureFlag};samesite=strict`;
};

const getCookie = (name) => {
  if (typeof document === "undefined") return null; // SSR safety check

  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      try {
        return JSON.parse(c.substring(nameEQ.length, c.length));
      } catch (e) {
        console.error("Error parsing cookie:", e);
        return null;
      }
    }
  }
  return null;
};

const deleteCookie = (name) => {
  if (typeof document === "undefined") return; // SSR safety check

  const isSecure = window.location.protocol === "https:";
  const secureFlag = isSecure ? ";secure" : "";

  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/${secureFlag}`;
};

// Load initial state from cookies
const getInitialState = () => {
  const savedAuth = getCookie("isAuthenticated");
  const savedUser = getCookie("userData");

  return {
    isAuthenticated: savedAuth || false,
    user: savedUser || null,
    loading: false,
    error: null,
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.error = null;

      // Save authentication state to cookies
      setCookie("isAuthenticated", true);
      setCookie("userData", action.payload.user);
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload;

      // Clear cookies on login failure
      deleteCookie("isAuthenticated");
      deleteCookie("userData");
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.error = null;

      // Clear cookies on logout
      deleteCookie("isAuthenticated");
      deleteCookie("userData");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError } =
  authSlice.actions;
export default authSlice.reducer;
