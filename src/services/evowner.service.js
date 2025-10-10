import api from "./auth.service";
import store from "../store/store";

export const registerEVOwner = async (ownerData) => {
  try {
    // Use the axios instance with cookies for authentication
    const response = await api.post(`/evowners/register`, {
      Username: ownerData.Username,
      Email: ownerData.Email,
      FirstName: ownerData.FirstName,
      LastName: ownerData.LastName,
      Password: ownerData.Password,
      NIC: ownerData.NIC,
      Phone: ownerData.Phone,
    });

    return response.data;
  } catch (error) {
    console.error("EV Owner registration failed:", error);

    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    } else if (error.response?.status === 403) {
      throw new Error("Access denied.");
    } else {
      throw new Error(
        error.response?.data?.message || error.message || "Registration failed"
      );
    }
  }
};

export const getAllEVOwners = async (searchTerm = "") => {
  try {
    // Get user data from Redux store
    const state = store.getState();
    const user = state.auth.user;

    // Check if user is admin
    if (
      !user?.id ||
      (user.roleId !== 1 && user.role !== 1 && user.Role !== 1)
    ) {
      throw new Error("Only administrators can view EV owners.");
    }

    // Build query parameters
    const params = new URLSearchParams();
    if (searchTerm.trim()) {
      params.append("SearchTerm", searchTerm.trim());
    }

    const queryString = params.toString();
    const url = queryString ? `/evowners/all?${queryString}` : "/evowners/all";

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch EV owners:", error);

    if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    } else if (error.response?.status === 403) {
      throw new Error("Access denied. Only administrators can view EV owners.");
    } else {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch EV owners"
      );
    }
  }
};

export const getEVOwnerByNIC = async (nic) => {
  try {
    // Get user data from Redux store
    const state = store.getState();
    const user = state.auth.user;

    // Check if user is admin
    if (
      !user?.id ||
      (user.roleId !== 1 && user.role !== 1 && user.Role !== 1)
    ) {
      throw new Error("Only administrators can view EV owner details.");
    }

    const response = await api.get(`/evowners/profile/${nic}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch EV owner:", error);

    if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    } else if (error.response?.status === 403) {
      throw new Error(
        "Access denied. Only administrators can view EV owner details."
      );
    } else if (error.response?.status === 404) {
      throw new Error("EV owner not found.");
    } else {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch EV owner"
      );
    }
  }
};

export const updateEVOwner = async (nic, ownerData) => {
  try {
    // Get user data from Redux store
    const state = store.getState();
    const user = state.auth.user;

    // Check if user is admin
    if (
      !user?.id ||
      (user.roleId !== 1 && user.role !== 1 && user.Role !== 1)
    ) {
      throw new Error("Only administrators can update EV owners.");
    }

    const response = await api.patch(`/evowners/admin/update/${nic}`, {
      FirstName: ownerData.FirstName,
      LastName: ownerData.LastName,
      Email: ownerData.Email,
      Phone: ownerData.Phone,
      Password: ownerData.Password,
    });

    return response.data;
  } catch (error) {
    console.error("Failed to update EV owner:", error);

    if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    } else if (error.response?.status === 403) {
      throw new Error(
        "Access denied. Only administrators can update EV owners."
      );
    } else if (error.response?.status === 404) {
      throw new Error("EV owner not found.");
    } else {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update EV owner"
      );
    }
  }
};

export const deactivateEVOwner = async (nic) => {
  try {
    // Get user data from Redux store
    const state = store.getState();
    const user = state.auth.user;

    // Check if user is admin
    if (
      !user?.id ||
      (user.roleId !== 1 && user.role !== 1 && user.Role !== 1)
    ) {
      throw new Error("Only administrators can deactivate EV owners.");
    }

    const response = await api.patch(`/evowners/admin/deactivate/${nic}`);

    return response.data;
  } catch (error) {
    console.error("Failed to deactivate EV owner:", error);

    if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    } else if (error.response?.status === 403) {
      throw new Error(
        "Access denied. Only administrators can deactivate EV owners."
      );
    } else if (error.response?.status === 404) {
      throw new Error("EV owner not found.");
    } else {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to deactivate EV owner"
      );
    }
  }
};

export const reactivateEVOwner = async (nic) => {
  try {
    // Get user data from Redux store
    const state = store.getState();
    const user = state.auth.user;

    // Check if user is admin
    if (
      !user?.id ||
      (user.roleId !== 1 && user.role !== 1 && user.Role !== 1)
    ) {
      throw new Error("Only administrators can reactivate EV owners.");
    }

    const response = await api.patch(`/evowners/reactivate/${nic}`);

    return response.data;
  } catch (error) {
    console.error("Failed to reactivate EV owner:", error);

    if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    } else if (error.response?.status === 403) {
      throw new Error(
        "Access denied. Only administrators can reactivate EV owners."
      );
    } else if (error.response?.status === 404) {
      throw new Error("EV owner not found.");
    } else {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to reactivate EV owner"
      );
    }
  }
};

