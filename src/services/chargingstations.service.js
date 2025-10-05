import api from "./auth.service";

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
    const response = await api.put(`/stations/${stationId}`, stationData);
    return response.data;
  } catch (error) {
    console.error("Update station failed:", error);
    throw error;
  }
};

export const toggleStationStatus = async (stationId, isActive) => {
  try {
    const response = await api.patch(`/stations/${stationId}/status`, {
      isActive,
    });
    return response.data;
  } catch (error) {
    console.error("Toggle station status failed:", error);
    throw error;
  }
};
