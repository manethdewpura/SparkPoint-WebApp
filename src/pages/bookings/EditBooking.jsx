import React, { useState, useEffect, useCallback } from "react";
import {
  updateBooking,
  checkBookingAvailability,
} from "../../services/booking.service";
import { HiX, HiSave, HiLocationMarker } from "react-icons/hi";

const EditBooking = ({ booking, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    ownerNIC: "",
    reservationDate: "",
    timeSlot: "",
    slotsRequested: 1,
  });
  const [availability, setAvailability] = useState(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Get date range (today to 7 days from now)
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 7);

  const formatDateForInput = (date) => {
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    if (booking && isOpen) {
      const reservationDate = booking.reservationTime
        ? new Date(booking.reservationTime).toISOString().split("T")[0]
        : "";

      setFormData({
        ownerNIC: booking.ownerNIC || "",
        reservationDate: reservationDate,
        timeSlot: booking.timeSlotDisplay || "",
        slotsRequested: booking.slotsRequested || 1,
      });
      setError("");
      setSuccess("");
      setAvailability(null);
    }
  }, [booking, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Reset availability and timeSlot when date changes
    if (field === "reservationDate") {
      setAvailability(null);
      setFormData((prev) => ({ ...prev, timeSlot: "" }));
    }
  };

  const checkAvailability = useCallback(async () => {
    if (!booking?.station?.id || !formData.reservationDate) return;

    try {
      setLoadingAvailability(true);
      const response = await checkBookingAvailability(
        booking.station.id,
        formData.reservationDate
      );
      setAvailability(response);
    } catch (err) {
      console.error("Error checking availability:", err);
      setError("Failed to check availability");
    } finally {
      setLoadingAvailability(false);
    }
  }, [booking?.station?.id, formData.reservationDate]);

  useEffect(() => {
    if (formData.reservationDate && booking?.station?.id) {
      checkAvailability();
    }
  }, [formData.reservationDate, booking?.station?.id, checkAvailability]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.ownerNIC || !formData.reservationDate || !formData.timeSlot) {
      setError("Please fill in all required fields");
      return;
    }

    // Find selected time slot info
    const selectedTimeSlot = availability?.availabilityInfo?.find(
      (slot) => slot.displayName === formData.timeSlot
    );

    if (!selectedTimeSlot) {
      setError("Please select a valid time slot");
      return;
    }

    if (formData.slotsRequested > selectedTimeSlot.availableSlots) {
      setError(
        `Only ${selectedTimeSlot.availableSlots} slots available for this time`
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const updateData = {
        ownerNIC: formData.ownerNIC,
        reservationTime: selectedTimeSlot.startTime,
        slotsRequested: parseInt(formData.slotsRequested),
        timeSlotDisplay: formData.timeSlot,
      };

      await updateBooking(booking.id, updateData);

      setSuccess("Booking updated successfully!");

      // Call onUpdate to refresh the booking data in parent components
      if (onUpdate) {
        await onUpdate();
      }

      // Close modal after showing success message
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Error updating booking:", err);
      setError(err.response?.data?.message || "Failed to update booking");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !booking) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800/95 backdrop-blur-md rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700/50 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Edit Booking</h2>
            <p className="text-gray-300 mt-1">
              Booking #{booking.id?.slice(-8) || "N/A"} -{" "}
              {booking.station?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        {/* Station Info */}
        <div className="p-6 border-b border-gray-700">
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-bold text-white mb-2">
              {booking.station?.name}
            </h3>
            <div className="flex items-center text-gray-300 mb-2">
              <HiLocationMarker className="w-4 h-4 mr-2" />
              <span className="text-sm">
                {booking.station?.address}, {booking.station?.city},{" "}
                {booking.station?.province}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <p className="text-sm text-gray-400">Type</p>
                <p className="text-white font-medium">
                  {booking.station?.type}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Slots</p>
                <p className="text-white font-medium">
                  {booking.station?.totalSlots}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* EV Owner NIC */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              EV Owner NIC *
            </label>
            <input
              type="text"
              value={formData.ownerNIC}
              onChange={(e) => handleInputChange("ownerNIC", e.target.value)}
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
                  <div className="text-gray-400">Checking availability...</div>
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
              onClick={onClose}
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
              className="flex-1 py-3 px-4 bg-[#ff7600] text-white rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Updating...
                </>
              ) : (
                <>
                  <HiSave className="w-4 h-4" />
                  Update Booking
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBooking;
