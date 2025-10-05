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
