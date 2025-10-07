import api from "./auth.service";
import store from "../store/store";

export const registerStationOperator = async (operatorData, stationId) => {
  try {
    // Get user data from Redux store
    const state = store.getState();
    const user = state.auth.user;

    // Check if user is admin
    if (
      !user?.id ||
      (user.roleId !== 1 && user.role !== 1 && user.Role !== 1)
    ) {
      throw new Error("Only administrators can register station operators.");
    }

    // Use the axios instance with cookies for authentication
    const response = await api.post(`/users/station-user`, {
      Username: operatorData.Username,
      Email: operatorData.Email,
      FirstName: operatorData.FirstName,
      LastName: operatorData.LastName,
      ChargingStationId: stationId,
      Password: operatorData.Password,
    });

    return response.data;
  } catch (error) {
    console.error("Station operator registration failed:", error);

    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    } else if (error.response?.status === 403) {
      throw new Error(
        "Access denied. Only administrators can register station operators."
      );
    } else {
      throw new Error(
        error.response?.data?.message || error.message || "Registration failed"
      );
    }
  }
};

export const getAllStationOperators = async (searchTerm = "") => {
  try {
    // Get user data from Redux store
    const state = store.getState();
    const user = state.auth.user;

    // Check if user is admin
    if (
      !user?.id ||
      (user.roleId !== 1 && user.role !== 1 && user.Role !== 1)
    ) {
      throw new Error("Only administrators can view station operators.");
    }

    // Build query parameters
    const params = new URLSearchParams();
    if (searchTerm.trim()) {
      params.append("SearchTerm", searchTerm.trim());
    }

    const queryString = params.toString();
    const url = queryString
      ? `/users/station-users?${queryString}`
      : "/users/station-users";

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch station operators:", error);

    if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    } else if (error.response?.status === 403) {
      throw new Error(
        "Access denied. Only administrators can view station operators."
      );
    } else {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch station operators"
      );
    }
  }
};

export const getStationOperatorById = async (operatorId) => {
  try {
    // Get user data from Redux store
    const state = store.getState();
    const user = state.auth.user;

    // Check if user is admin
    if (
      !user?.id ||
      (user.roleId !== 1 && user.role !== 1 && user.Role !== 1)
    ) {
      throw new Error("Only administrators can view station operator details.");
    }

    const response = await api.get(`/users/station-user/${operatorId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch station operator:", error);

    if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    } else if (error.response?.status === 403) {
      throw new Error(
        "Access denied. Only administrators can view station operator details."
      );
    } else if (error.response?.status === 404) {
      throw new Error("Station operator not found.");
    } else {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch station operator"
      );
    }
  }
};

export const updateStationOperator = async (operatorId, operatorData) => {
  try {
    // Get user data from Redux store
    const state = store.getState();
    const user = state.auth.user;

    // Check if user is admin
    if (
      !user?.id ||
      (user.roleId !== 1 && user.role !== 1 && user.Role !== 1)
    ) {
      throw new Error("Only administrators can update station operators.");
    }

    const response = await api.patch(`/users/station-user/${operatorId}`, {
      Username: operatorData.Username,
      Email: operatorData.Email,
      FirstName: operatorData.FirstName,
      LastName: operatorData.LastName,
      ChargingStationId: operatorData.ChargingStationId,
      Password: operatorData.Password,
    });

    return response.data;
  } catch (error) {
    console.error("Failed to update station operator:", error);

    if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    } else if (error.response?.status === 403) {
      throw new Error(
        "Access denied. Only administrators can update station operators."
      );
    } else if (error.response?.status === 404) {
      throw new Error("Station operator not found.");
    } else {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update station operator"
      );
    }
  }
};
