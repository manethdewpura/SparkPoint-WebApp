import api from "./auth.service";
import store from "../store/store";

export const registerAdmin = async (adminData) => {
  try {
    // Get user data from Redux store
    const state = store.getState();
    const user = state.auth.user;

    console.log("User role:", user?.roleId || user?.role || user?.Role);
    console.log("Admin data:", adminData);

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

    console.log("Registration successful:", response.data);
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
