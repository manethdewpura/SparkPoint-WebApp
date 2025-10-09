import api from "./auth.service";

// Create a new booking
export const createBooking = async (bookingData) => {
  try {
    const response = await api.post("/bookings", bookingData);
    return response.data;
  } catch (error) {
    console.error("Create booking failed:", error);
    throw error;
  }
};

// Get all bookings with optional query parameters
export const getAllBookings = async (queryParams = {}) => {
  try {
    const params = new URLSearchParams();

    // Add query parameters if they exist
    if (queryParams.status) params.append("Status", queryParams.status);
    if (queryParams.stationId)
      params.append("StationId", queryParams.stationId);
    if (queryParams.fromDate) params.append("FromDate", queryParams.fromDate);
    if (queryParams.toDate) params.append("ToDate", queryParams.toDate);

    const queryString = params.toString();
    const url = queryString ? `/bookings/?${queryString}` : "/bookings/";

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Get all bookings failed:", error);
    throw error;
  }
};

// Get booking by ID
export const getBookingById = async (bookingId) => {
  try {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error("Get booking by ID failed:", error);
    throw error;
  }
};

// Update booking
export const updateBooking = async (bookingId, bookingData) => {
  try {
    const response = await api.patch(`/bookings/${bookingId}`, bookingData);
    return response.data;
  } catch (error) {
    console.error("Update booking failed:", error);
    throw error;
  }
};

// Cancel booking
export const cancelBooking = async (bookingId) => {
  try {
    const response = await api.patch(`/bookings/cancel/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error("Cancel booking failed:", error);
    throw error;
  }
};

// Update booking status
export const updateBookingStatus = async (bookingId, statusData) => {
  try {
    const response = await api.patch(
      `/bookings/status/${bookingId}`,
      statusData
    );
    return response.data;
  } catch (error) {
    console.error("Update booking status failed:", error);
    throw error;
  }
};

// Check booking availability for a station
export const checkBookingAvailability = async (
  stationId,
  date,
  queryParams = {}
) => {
  try {
    const params = new URLSearchParams();

    // Add optional query parameters for availability check
    if (queryParams.time) params.append("time", queryParams.time);
    if (queryParams.duration) params.append("duration", queryParams.duration);

    const queryString = params.toString();
    const url = queryString
      ? `/bookings/availability/${stationId}/date/${date}?${queryString}`
      : `/bookings/availability/${stationId}/date/${date}`;

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Check booking availability failed:", error);
    throw error;
  }
};
