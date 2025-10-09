import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAllStations } from "../../services/chargingstations.service";
import {
  createBooking,
  checkBookingAvailability,
} from "../../services/booking.service";
import Sidebar from "../../components/Sidebar";
import {
  HiLocationMarker,
  HiClock,
  HiUser,
  HiX,
  HiArrowLeft,
  HiCheckCircle,
  HiExclamationCircle,
} from "react-icons/hi";
import { createToastUtils, initialToastState } from "../../utils/toastUtils";

const CreateBooking = () => {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(initialToastState);

  const [formData, setFormData] = useState({
    ownerNIC: "",
    reservationDate: "",
    timeSlot: "",
    slotsRequested: 1,
  });

  // Get date range (today to 7 days from now)
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 7);

  const formatDateForInput = (date) => {
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    fetchStations();
  }, []);

  // Toast utility functions
  const { showToast, hideToast } = createToastUtils(setToast);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const response = await getAllStations();
      setStations(response);
    } catch (err) {
      setError("Failed to fetch charging stations");
      console.error("Error fetching stations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (station) => {
    setSelectedStation(station);
    setIsModalOpen(true);
    setFormData({
      ownerNIC: "",
      reservationDate: "",
      timeSlot: "",
      slotsRequested: 1,
    });
    setAvailability(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStation(null);
    setAvailability(null);
    setFormData({
      ownerNIC: "",
      reservationDate: "",
      timeSlot: "",
      slotsRequested: 1,
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Reset availability when date changes
    if (field === "reservationDate") {
      setAvailability(null);
    }
  };

  const checkAvailability = useCallback(async () => {
    if (!selectedStation || !formData.reservationDate) return;

    try {
      setLoadingAvailability(true);
      const response = await checkBookingAvailability(
        selectedStation.id,
        formData.reservationDate
      );
      setAvailability(response);
    } catch (err) {
      console.error("Error checking availability:", err);
      showToast("Failed to check availability", "error");
    } finally {
      setLoadingAvailability(false);
    }
  }, [selectedStation, formData.reservationDate, showToast]);

  useEffect(() => {
    if (formData.reservationDate && selectedStation) {
      checkAvailability();
    }
  }, [formData.reservationDate, selectedStation, checkAvailability]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !selectedStation ||
      !formData.ownerNIC ||
      !formData.reservationDate ||
      !formData.timeSlot
    ) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    // Find selected time slot info
    const selectedTimeSlot = availability?.availabilityInfo?.find(
      (slot) => slot.displayName === formData.timeSlot
    );

    if (!selectedTimeSlot) {
      showToast("Please select a valid time slot", "error");
      return;
    }

    if (formData.slotsRequested > selectedTimeSlot.availableSlots) {
      showToast(
        `Only ${selectedTimeSlot.availableSlots} slots available for this time`,
        "error"
      );
      return;
    }

    try {
      setSubmitting(true);

      const bookingData = {
        ownerNIC: formData.ownerNIC,
        stationId: selectedStation.id,
        reservationTime: selectedTimeSlot.startTime,
        slotsRequested: parseInt(formData.slotsRequested),
      };

      await createBooking(bookingData);
      showToast("Booking created successfully!", "success");
      handleCloseModal();
    } catch (err) {
      console.error("Error creating booking:", err);
      showToast("Failed to create booking. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a2955]">
        <Sidebar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg text-white">Loading charging stations...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a2955]">
        <Sidebar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-red-300 text-lg">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a2955]">
      <Sidebar />

      <main className="pt-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/bookings")}
                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors duration-200"
              >
                <HiArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Create New Booking
                </h1>
                <p className="text-gray-300">
                  Select a charging station and create a booking for EV owners
                </p>
              </div>
            </div>
          </div>

          {/* Stations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stations.map((station) => (
              <div
                key={station.id}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {station.name}
                  </h3>
                  <div className="flex items-center text-gray-300 mb-2">
                    <HiLocationMarker className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {station.address}, {station.city}, {station.province}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Type</p>
                      <p className="text-white font-medium">{station.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Total Slots</p>
                      <p className="text-white font-medium">
                        {station.totalSlots}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Status</p>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          station.isActive
                            ? "bg-green-900/50 text-green-300 border border-green-700"
                            : "bg-red-900/50 text-red-300 border border-red-700"
                        }`}
                      >
                        {station.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenModal(station)}
                  disabled={!station.isActive}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    station.isActive
                      ? "bg-[#ff7600] text-white hover:bg-orange-600"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Create Booking
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      {isModalOpen && selectedStation && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-gray-800/95 backdrop-blur-md rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700/50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Create Booking
                </h2>
                <p className="text-gray-300 mt-1">{selectedStation.name}</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* EV Owner NIC */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  EV Owner NIC *
                </label>
                <input
                  type="text"
                  value={formData.ownerNIC}
                  onChange={(e) =>
                    handleInputChange("ownerNIC", e.target.value)
                  }
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff7600] focus:border-transparent"
                  placeholder="Enter NIC number"
                  required
                />
              </div>

              {/* Reservation Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reservation Date *
                </label>
                <input
                  type="date"
                  value={formData.reservationDate}
                  onChange={(e) =>
                    handleInputChange("reservationDate", e.target.value)
                  }
                  min={formatDateForInput(today)}
                  max={formatDateForInput(maxDate)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff7600] focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Select a date within the next 7 days
                </p>
              </div>

              {/* Time Slot Selection */}
              {formData.reservationDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Time Slot *
                  </label>

                  {loadingAvailability ? (
                    <div className="text-center py-4">
                      <div className="text-gray-400">
                        Checking availability...
                      </div>
                    </div>
                  ) : availability?.availabilityInfo ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {availability.availabilityInfo.map((slot) => (
                        <label
                          key={slot.displayName}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                            slot.isAvailable
                              ? "border-gray-600 hover:border-[#ff7600] bg-gray-700"
                              : "border-gray-700 bg-gray-900 cursor-not-allowed opacity-50"
                          } ${
                            formData.timeSlot === slot.displayName
                              ? "border-[#ff7600] bg-[#ff7600]/10"
                              : ""
                          }`}
                        >
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="timeSlot"
                              value={slot.displayName}
                              checked={formData.timeSlot === slot.displayName}
                              onChange={(e) =>
                                handleInputChange("timeSlot", e.target.value)
                              }
                              disabled={!slot.isAvailable}
                              className="mr-3 text-[#ff7600] focus:ring-[#ff7600]"
                            />
                            <div>
                              <div className="text-white font-medium">
                                {slot.displayName}
                              </div>
                              <div className="text-sm text-gray-400">
                                {slot.availableSlots} slots available
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-400">
                      Select a date to view available time slots
                    </div>
                  )}
                </div>
              )}

              {/* Number of Slots */}
              {formData.timeSlot && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Number of Slots *
                  </label>
                  <select
                    value={formData.slotsRequested}
                    onChange={(e) =>
                      handleInputChange("slotsRequested", e.target.value)
                    }
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff7600] focus:border-transparent"
                    required
                  >
                    {Array.from(
                      {
                        length:
                          availability?.availabilityInfo?.find(
                            (slot) => slot.displayName === formData.timeSlot
                          )?.availableSlots || 1,
                      },
                      (_, i) => i + 1
                    ).map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !formData.ownerNIC ||
                    !formData.reservationDate ||
                    !formData.timeSlot
                  }
                  className="flex-1 py-3 px-4 bg-[#ff7600] text-white rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  {submitting ? "Creating..." : "Create Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`flex items-center p-4 rounded-lg shadow-lg border ${
              toast.type === "success"
                ? "bg-green-900/90 border-green-700 text-green-300"
                : "bg-red-900/90 border-red-700 text-red-300"
            } backdrop-blur-sm`}
          >
            {toast.type === "success" ? (
              <HiCheckCircle className="w-5 h-5 mr-3" />
            ) : (
              <HiExclamationCircle className="w-5 h-5 mr-3" />
            )}
            <span className="mr-3">{toast.message}</span>
            <button
              onClick={hideToast}
              className="text-gray-300 hover:text-white transition-colors"
            >
              <HiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateBooking;
