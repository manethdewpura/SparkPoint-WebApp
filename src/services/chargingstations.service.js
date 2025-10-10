import api from "./auth.service";

export const createStation = async (stationData) => {
  try {
    const response = await api.post("/stations", stationData);
    return response.data;
  } catch (error) {
    console.error("Create station failed:", error);
    throw error;
  }
};

export const getAllStations = async () => {
  try {
    const response = await api.get("/stations");
    return response.data;
  } catch (error) {
    console.error("Get all stations failed:", error);
    throw error;
  }
};

export const getStationById = async (stationId) => {
  try {
    const response = await api.get(`/stations/${stationId}`);
    return response.data;
  } catch (error) {
    console.error("Get station by ID failed:", error);
    throw error;
  }
};

export const updateStation = async (stationId, stationData) => {
  try {
    const response = await api.patch(`/stations/${stationId}`, stationData);
    return response.data;
  } catch (error) {
    console.error("Update station failed:", error);
    throw error;
  }
};

export const activateStation = async (stationId) => {
  try {
    const response = await api.patch(`/stations/activate/${stationId}`);
    return response.data;
  } catch (error) {
    console.error("Activate station failed:", error);
    throw error;
  }
};

export const deactivateStation = async (stationId) => {
  try {
    const response = await api.patch(`/stations/deactivate/${stationId}`);
    return response.data;
  } catch (error) {
    console.error("Deactivate station failed:", error);
    throw error;
  }
};

export const updateStationSlots = async (stationId, totalSlots) => {
  try {
    const response = await api.patch(`/stations/${stationId}/slots`, {
      TotalSlots: totalSlots,
    });
    return response.data;
  } catch (error) {
    console.error("Update station slots failed:", error);
    throw error;
  }
};