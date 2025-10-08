import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getAllBookings,
  updateBookingStatus,
  cancelBooking,
} from "../../services/booking.service";
import Sidebar from "../../components/Sidebar";
import BookingDetails from "./BookingDetails";
import { HiClipboardList } from "react-icons/hi";
import { ROLES } from "../../constants/roles";

const Bookings = () => {
  const [bookingsData, setBookingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    fromDate: "",
    toDate: "",
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusBooking, setStatusBooking] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelBookingData, setCancelBookingData] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = {};

      // Only add non-empty filter values
      if (filters.status) queryParams.status = filters.status;
      if (filters.fromDate) queryParams.fromDate = filters.fromDate;
      if (filters.toDate) queryParams.toDate = filters.toDate;

      const response = await getAllBookings(queryParams);
      setBookingsData(response);
    } catch (err) {
      setError("Failed to fetch bookings data");
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      fromDate: "",
      toDate: "",
    });
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const handleStatusUpdate = (booking) => {
    const timeCheck = checkTimeRestriction(booking.reservationTime);

    // Don't open modal if button should be disabled
    if (
      timeCheck.withinTwelveHours &&
      (booking.status?.toLowerCase() === "confirmed" ||
        booking.status?.toLowerCase() === "pending")
    ) {
      return;
    }

    setStatusBooking(booking);
    setNewStatus(booking.status || "");
    setStatusModalOpen(true);
  };

  const handleCloseStatusModal = () => {
    setStatusModalOpen(false);
    setStatusBooking(null);
    setNewStatus("");
  };

  const checkTimeRestriction = (reservationTime) => {
    if (!reservationTime) return { allowed: true, remainingTime: null };

    const now = new Date();
    const reservation = new Date(reservationTime);
    const timeDiff = reservation.getTime() - now.getTime();
    const hoursRemaining = timeDiff / (1000 * 60 * 60);

    return {
      allowed: hoursRemaining > 12,
      remainingTime: hoursRemaining,
      withinTwelveHours: hoursRemaining <= 12 && hoursRemaining > 0,
    };
  };

  const handleStatusSubmit = async () => {
    if (!statusBooking || !newStatus) return;

    try {
      setStatusUpdateLoading(true);
      await updateBookingStatus(statusBooking.id, { status: newStatus });

      // Refresh bookings data
      await fetchBookings();

      // Close modal and reset state
      handleCloseStatusModal();

      alert("Booking status updated successfully!");
    } catch (error) {
      console.error("Error updating booking status:", error);
      alert("Failed to update booking status. Please try again.");
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const isStatusUpdateValid = (booking, selectedStatus) => {
    if (!booking || !selectedStatus)
      return { valid: false, message: "Please select a status" };

    const timeCheck = checkTimeRestriction(booking.reservationTime);

    // If within 12 hours, only allow specific statuses
    if (timeCheck.withinTwelveHours) {
      const allowedStatuses = ["In Progress", "Completed", "No Show"];
      if (!allowedStatuses.includes(selectedStatus)) {
        return {
          valid: false,
          message:
            "Only 'In Progress', 'Completed', and 'No Show' status updates are allowed within 12 hours of reservation time.",
        };
      }
    }

    return { valid: true, message: null };
  };

  const handleCancelBooking = (booking) => {
    const timeCheck = checkTimeRestriction(booking.reservationTime);

    if (!timeCheck.allowed) {
      alert(
        "Bookings can only be cancelled at least 12 hours before the reservation time."
      );
      return;
    }

    setCancelBookingData(booking);
    setCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    setCancelModalOpen(false);
    setCancelBookingData(null);
  };

  const handleCancelConfirm = async () => {
    if (!cancelBookingData) return;

    try {
      setCancelLoading(true);
      await cancelBooking(cancelBookingData.id);

      // Refresh bookings data
      await fetchBookings();

      // Close modal and reset state
      handleCloseCancelModal();

      alert("Booking cancelled successfully!");
    } catch (error) {
      console.error("Error cancelling booking:", error);

      // Check if it's the 12-hour restriction error
      if (error.response?.data?.message?.includes("12 hours")) {
        alert(error.response.data.message);
      } else {
        alert("Failed to cancel booking. Please try again.");
      }
    } finally {
      setCancelLoading(false);
    }
  };

  const canCancelBooking = (booking) => {
    const timeCheck = checkTimeRestriction(booking.reservationTime);
    return (
      timeCheck.allowed &&
      booking.status?.toLowerCase() !== "cancelled" &&
      booking.status?.toLowerCase() !== "completed"
    );
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "in progress":
        return "bg-teal-900/50 text-teal-300 border border-teal-700";
      case "confirmed":
        return "bg-green-900/50 text-green-300 border border-green-700";
      case "cancelled":
        return "bg-red-900/50 text-red-300 border border-red-700";
      case "no show":
        return "bg-purple-900/50 text-purple-300 border border-purple-700";
      case "completed":
        return "bg-blue-900/50 text-blue-300 border border-blue-700";
      default:
        return "bg-yellow-900/50 text-yellow-300 border border-yellow-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a2955]">
        <Sidebar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg text-white">Loading bookings data...</div>
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">
              Bookings Management
            </h1>
            <p className="text-gray-300 mt-2">
              View and manage all charging station bookings
            </p>
          </div>

          {/* Filters Section */}
          <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">
              Filter Bookings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff7600] focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="No Show">No Show</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) =>
                    handleFilterChange("fromDate", e.target.value)
                  }
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff7600] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) => handleFilterChange("toDate", e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff7600] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-4">
              {/* <button
                onClick={fetchBookings}
                className="bg-[#ff7600] text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Apply Filters
              </button> */}
              <button
                onClick={clearFilters}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Bookings List */}
          <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">All Bookings</h2>
                <p className="text-gray-300 mt-1">
                  {bookingsData.length} bookings found
                </p>
              </div>
              {user?.roleId === ROLES.ADMIN && (
                <button
                  onClick={() => navigate("/bookings/create")}
                  className="bg-[#ff7600] text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                >
                  Create Booking
                </button>
              )}
            </div>

            {bookingsData.length === 0 ? (
              <div className="text-center py-12">
                <HiClipboardList className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No bookings found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {bookingsData.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-gray-700 rounded-lg p-6 border border-gray-600 hover:shadow-lg hover:border-gray-500 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-white text-lg">
                          Booking #{booking.id?.slice(-8) || "N/A"}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Owner: {booking.ownerNIC || "N/A"}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status || "Unknown"}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-400">Station</p>
                          <p className="text-gray-200 font-medium">
                            {booking.station?.name ||
                              `Station ${booking.stationId?.slice(-8)}` ||
                              "N/A"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {booking.station?.city && booking.station?.province
                              ? `${booking.station.city}, ${booking.station.province}`
                              : booking.station?.address ||
                                "Location not available"}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-400">Slots</p>
                            <p className="text-gray-200 font-medium">
                              {booking.slotsRequested || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Type</p>
                            <p className="text-gray-200 font-medium">
                              {booking.station?.type || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-400">
                          Reservation Time
                        </p>
                        <p className="text-gray-200 font-medium">
                          {booking.reservationTime
                            ? booking.reservationTime
                                .replace("T", " ")
                                .slice(0, 19)
                            : "N/A"}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-gray-600">
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDetails(booking)}
                              className="flex-1 bg-[#0191fe] text-white text-sm py-2 px-3 rounded hover:bg-blue-600 transition-colors"
                            >
                              View Details
                            </button>
                            {(user?.roleId === ROLES.ADMIN ||
                              user?.roleId === ROLES.STATION_OPERATOR) &&
                              (() => {
                                const timeCheck = checkTimeRestriction(
                                  booking.reservationTime
                                );
                                const isDisabled =
                                  (timeCheck.withinTwelveHours &&
                                    (booking.status?.toLowerCase() ===
                                      "confirmed" ||
                                      booking.status?.toLowerCase() ===
                                        "pending")) ||
                                  (booking.status?.toLowerCase() ===
                                    "cancelled" &&
                                    !timeCheck.allowed) ||
                                  booking.status?.toLowerCase() === "cancelled";

                                let tooltipText = "Edit Status";
                                if (
                                  timeCheck.withinTwelveHours &&
                                  (booking.status?.toLowerCase() ===
                                    "confirmed" ||
                                    booking.status?.toLowerCase() === "pending")
                                ) {
                                  tooltipText =
                                    "Status update restricted within 12 hours for confirmed/pending bookings";
                                } else if (
                                  booking.status?.toLowerCase() ===
                                    "cancelled" &&
                                  !timeCheck.allowed
                                ) {
                                  tooltipText =
                                    "Cannot edit status for cancelled bookings past the time restriction";
                                } else if (
                                  booking.status?.toLowerCase() === "cancelled"
                                ) {
                                  tooltipText =
                                    "Cannot edit status for cancelled bookings";
                                }

                                return (
                                  <div className="relative flex-1">
                                    <button
                                      onClick={() =>
                                        !isDisabled &&
                                        handleStatusUpdate(booking)
                                      }
                                      disabled={isDisabled}
                                      className={`w-full text-white text-sm py-2 px-3 rounded transition-colors ${
                                        isDisabled
                                          ? "bg-gray-500 cursor-not-allowed opacity-50"
                                          : "bg-gray-600 hover:bg-gray-500"
                                      }`}
                                      title={tooltipText}
                                    >
                                      Edit Status
                                    </button>
                                  </div>
                                );
                              })()}
                          </div>
                          {user?.roleId === ROLES.ADMIN &&
                            canCancelBooking(booking) && (
                              <button
                                onClick={() => handleCancelBooking(booking)}
                                className="w-full bg-red-600 text-white text-sm py-2 px-3 rounded hover:bg-red-700 transition-colors"
                              >
                                Cancel Booking
                              </button>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Booking Details Modal */}
      <BookingDetails
        booking={selectedBooking}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        user={user}
        onUpdate={fetchBookings}
      />

      {/* Status Update Modal */}
      {statusModalOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={handleCloseStatusModal}
        >
          <div
            className="bg-gray-800/95 backdrop-blur-md rounded-lg p-6 w-full max-w-md mx-4 border border-gray-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4">
              Update Booking Status
            </h3>

            {statusBooking && (
              <div className="mb-4">
                <p className="text-gray-300 text-sm mb-2">
                  Booking #{statusBooking.id?.slice(-8) || "N/A"}
                </p>
                <p className="text-gray-400 text-xs">
                  Reservation:{" "}
                  {statusBooking.reservationTime
                    ? statusBooking.reservationTime
                        .replace("T", " ")
                        .slice(0, 19)
                    : "N/A"}
                </p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff7600] focus:border-transparent"
              >
                <option value="">Select a status</option>
                {user?.roleId === ROLES.ADMIN ? (
                  <>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="No Show">No Show</option>
                  </>
                ) : (
                  <>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="No Show">No Show</option>
                  </>
                )}
              </select>

              {/* Show error message for invalid status selection */}
              {statusBooking &&
                newStatus &&
                (() => {
                  const validation = isStatusUpdateValid(
                    statusBooking,
                    newStatus
                  );
                  if (!validation.valid) {
                    return (
                      <p className="text-red-400 text-xs mt-2">
                        ⚠️ {validation.message}
                      </p>
                    );
                  }
                  return null;
                })()}

              {/* Show restriction info for bookings within 12 hours */}
              {statusBooking &&
                checkTimeRestriction(statusBooking.reservationTime)
                  .withinTwelveHours && (
                  <div className="mt-2">
                    <p className="text-yellow-400 text-xs">
                      ⚠️ Limited status options available (within 12 hours of
                      reservation)
                    </p>
                    <p className="text-red-400 text-xs mt-1">
                      Only 'In Progress', 'Completed', and 'No Show' status
                      updates are allowed within 12 hours of reservation time.
                    </p>
                  </div>
                )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleStatusSubmit}
                disabled={
                  statusUpdateLoading ||
                  !newStatus ||
                  !isStatusUpdateValid(statusBooking, newStatus).valid
                }
                className="flex-1 bg-[#ff7600] text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {statusUpdateLoading ? "Updating..." : "Update Status"}
              </button>
              <button
                onClick={handleCloseStatusModal}
                disabled={statusUpdateLoading}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Confirmation Modal */}
      {cancelModalOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={handleCloseCancelModal}
        >
          <div
            className="bg-gray-800/95 backdrop-blur-md rounded-lg p-6 w-full max-w-md mx-4 border border-gray-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4">
              Cancel Booking Confirmation
            </h3>

            {cancelBookingData && (
              <div className="mb-6">
                <p className="text-gray-300 text-sm mb-2">
                  Are you sure you want to cancel this booking?
                </p>
                <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                  <p className="text-gray-300 text-sm mb-1">
                    Booking #{cancelBookingData.id?.slice(-8) || "N/A"}
                  </p>
                  <p className="text-gray-400 text-xs mb-2">
                    Station:{" "}
                    {cancelBookingData.station?.name ||
                      `Station ${cancelBookingData.stationId?.slice(-8)}` ||
                      "N/A"}
                  </p>
                  <p className="text-gray-400 text-xs">
                    Reservation:{" "}
                    {cancelBookingData.reservationTime
                      ? cancelBookingData.reservationTime
                          .replace("T", " ")
                          .slice(0, 19)
                      : "N/A"}
                  </p>
                </div>
                <p className="text-red-400 text-sm">
                  ⚠️ This action cannot be undone. The booking will be
                  permanently cancelled.
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleCancelConfirm}
                disabled={cancelLoading}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelLoading ? "Cancelling..." : "Yes, Cancel Booking"}
              </button>
              <button
                onClick={handleCloseCancelModal}
                disabled={cancelLoading}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Keep Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
