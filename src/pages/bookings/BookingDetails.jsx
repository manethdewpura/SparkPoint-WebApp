import React, { useState } from "react";
import {
  HiX,
  HiClipboardList,
  HiLocationMarker,
  HiClock,
  HiInformationCircle,
} from "react-icons/hi";
import EditBooking from "./EditBooking";

const BookingDetails = ({ booking, isOpen, onClose, user, onUpdate }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  if (!isOpen || !booking) return null;

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

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Booking Details</h2>
            <p className="text-gray-300 mt-1">
              Booking #{booking.id?.slice(-8) || "N/A"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <HiClipboardList className="w-5 h-5 mr-2 text-gray-300" />
                Booking Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Booking ID</p>
                  <p className="text-gray-200 font-medium">
                    {booking.id || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status || "Unknown"}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Owner NIC</p>
                  <p className="text-gray-200 font-medium">
                    {booking.ownerNIC || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Slots Requested</p>
                  <p className="text-gray-200 font-medium">
                    {booking.slotsRequested || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <HiLocationMarker className="w-5 h-5 mr-2 text-gray-300" />
                Station Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Station Name</p>
                  <p className="text-gray-200 font-medium">
                    {booking.station?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Station Type</p>
                  <p className="text-gray-200 font-medium">
                    {booking.station?.type || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Address</p>
                  <p className="text-gray-200 font-medium">
                    {booking.station?.address || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">City & Province</p>
                  <p className="text-gray-200 font-medium">
                    {booking.station?.city && booking.station?.province
                      ? `${booking.station.city}, ${booking.station.province}`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Contact Phone</p>
                  <p className="text-gray-200 font-medium">
                    {booking.station?.contactPhone || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Contact Email</p>
                  <p className="text-gray-200 font-medium">
                    {booking.station?.contactEmail || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Timing Information */}
          <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <HiClock className="w-5 h-5 mr-2 text-gray-300" />
              Timing Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Reservation Time</p>
                <p className="text-gray-200 font-medium">
                  {booking.reservationTime
                    ? booking.reservationTime.replace("T", " ").slice(0, 19)
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Time Slot</p>
                <p className="text-gray-200 font-medium">
                  {booking.timeSlotDisplay || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Slot End Time</p>
                <p className="text-gray-200 font-medium">
                  {booking.slotEndTime
                    ? booking.slotEndTime.replace("T", " ").slice(0, 19)
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-4 p-6 border-t border-gray-700">
          {user?.roleId === 2 ? (
            <>            </>
          ) : (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex-1 bg-[#ff7600] text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Edit Booking
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Edit Booking Modal */}
      <EditBooking
        booking={booking}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={async () => {
          if (onUpdate) {
            await onUpdate(); // Refresh the bookings list
          }
          // Close both modals to force refresh of booking details
          setIsEditModalOpen(false);
          onClose();
        }}
      />
    </div>
  );
};

export default BookingDetails;
