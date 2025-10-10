import api from "./auth.service";
import store from "../store/store";

export const registerAdmin = async (adminData) => {
  try {
    // Get user data from Redux store
    const state = store.getState();
    const user = state.auth.user;

    // Check if user is admin
    if (
      !user?.id ||
      (user.roleId !== 1 && user.role !== 1 && user.Role !== 1)
    ) {
      throw new Error("Only administrators can register new admins.");
    }

    // Use the axios instance with cookies for authentication
    const response = await api.post(`/users/admin/register`, {
      Username: adminData.Username,
      Email: adminData.Email,
      FirstName: adminData.FirstName,
      LastName: adminData.LastName,
      Password: adminData.Password,
    });

    return response.data;
  } catch (error) {
    console.error("Admin registration failed:", error);

    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    } else if (error.response?.status === 403) {
      throw new Error(
        "Access denied. Only administrators can register new admins."
      );
    } else {
      throw new Error(
        error.response?.data?.message || error.message || "Registration failed"
      );
    }
  }
};

export const getUserProfile = async () => {
  try {
    const response = await api.get("/users/profile");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user profile:", error);

    if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    } else if (error.response?.status === 403) {
      throw new Error("Access denied.");
    } else {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch profile"
      );
    }
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.patch("/users/profile", {
      Username: profileData.Username,
      Email: profileData.Email,
      FirstName: profileData.FirstName,
      LastName: profileData.LastName,
      Password: profileData.Password,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to update user profile:", error);

    if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    } else if (error.response?.status === 403) {
      throw new Error("Access denied.");
    } else {
      throw new Error(
        error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          "Failed to update profile"
      );
    }
  }
};