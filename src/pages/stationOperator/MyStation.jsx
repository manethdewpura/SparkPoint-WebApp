import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getStationById, updateStationSlots } from "../../services/chargingstations.service";
import Sidebar from "../../components/Sidebar";
import Toast from "../../components/Toast";
import {
  HiLocationMarker,
  HiLightningBolt,
  HiPhone,
  HiMail,
  HiUserGroup,
  HiUsers,
  HiShieldCheck,
  HiCalendar,
  HiPencil,
  HiX,
  HiCheck,
} from "react-icons/hi";

const MyStation = () => {
  const [stationData, setStationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingSlots, setIsEditingSlots] = useState(false);
  const [newTotalSlots, setNewTotalSlots] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchStationData = async () => {
      try {
        if (!user?.chargingStationId) {
          setError("No charging station assigned to this user");
          return;
        }

        setLoading(true);
        const response = await getStationById(user.chargingStationId);
        setStationData(response);
      } catch (err) {
        setError("Failed to fetch station data");
        console.error("Error fetching station:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStationData();
  }, [user?.chargingStationId]);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const handleEditSlots = () => {
    setNewTotalSlots(stationData.station.totalSlots.toString());
    setIsEditingSlots(true);
  };

  const handleCancelEdit = () => {
    setIsEditingSlots(false);
    setNewTotalSlots("");
  };

  const handleUpdateSlots = async () => {
    const slotsValue = parseInt(newTotalSlots);
    
    if (isNaN(slotsValue) || slotsValue < 1 || slotsValue > 100) {
      showToast("Total slots must be between 1 and 100", "error");
      return;
    }

    if (slotsValue === stationData.station.totalSlots) {
      showToast("No changes to update", "info");
      handleCancelEdit();
      return;
    }

    try {
      setIsUpdating(true);
      await updateStationSlots(stationData.station.id, slotsValue);
      
      // Refresh station data
      const response = await getStationById(user.chargingStationId);
      setStationData(response);
      
      showToast("Station slots updated successfully!", "success");
      setIsEditingSlots(false);
      setNewTotalSlots("");
    } catch (err) {
      console.error("Error updating slots:", err);
      showToast(
        err.response?.data?.message || "Failed to update station slots",
        "error"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a2955]">
        <Sidebar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg text-white">Loading station data...</div>
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

  if (!stationData) {
    return (
      <div className="min-h-screen bg-[#1a2955]">
        <Sidebar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-gray-300 text-lg">No station data available</div>
        </div>
      </div>
    );
  }

  const { station, stationUsers } = stationData;

  return (
    <div className="min-h-screen bg-[#1a2955]">
      <Sidebar />
      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <main className="pt-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">
              My Charging Station
            </h1>
            <p className="text-gray-300 mt-2">
              Manage and monitor your charging station
            </p>
          </div>

          {/* Station Overview Card */}
          <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {station.name}
                </h2>
                <p className="text-gray-300 mt-1">Station ID: {station.id}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    station.isActive
                      ? "bg-green-900/50 text-green-300 border border-green-700"
                      : "bg-red-900/50 text-red-300 border border-red-700"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      station.isActive ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  {station.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Location Information */}
              <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <HiLocationMarker className="w-5 h-5 mr-2 text-gray-300" />
                  Location Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Address</p>
                    <p className="text-gray-200 font-medium">
                      {station.address}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">City</p>
                      <p className="text-gray-200 font-medium">
                        {station.city}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Province</p>
                      <p className="text-gray-200 font-medium">
                        {station.province}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Coordinates</p>
                    <p className="text-gray-200 font-medium">
                      {station.location.latitude}, {station.location.longitude}
                    </p>
                  </div>
                </div>
              </div>

              {/* Station Details */}
              <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <HiLightningBolt className="w-5 h-5 mr-2 text-gray-300" />
                    Station Information
                  </h3>
                  {!isEditingSlots && (
                    <button
                      onClick={handleEditSlots}
                      className="flex items-center px-3 py-1.5 bg-[#ff7600] text-white rounded-lg hover:bg-[#e66a00] transition-colors text-sm font-medium"
                    >
                      <HiPencil className="w-4 h-4 mr-1" />
                      Update Slots
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Charging Type</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#ff7600] text-white">
                      {station.type}
                    </span>
                  </div>
                  
                  {isEditingSlots ? (
                    <div className="bg-gray-600 rounded-lg p-4 border-2 border-[#ff7600]">
                      <p className="text-sm text-gray-300 mb-2 font-medium">
                        Update Total Slots
                      </p>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={newTotalSlots}
                          onChange={(e) => setNewTotalSlots(e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-[#ff7600]"
                          placeholder="Enter total slots (1-100)"
                          disabled={isUpdating}
                        />
                        <button
                          onClick={handleUpdateSlots}
                          disabled={isUpdating}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <HiCheck className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={isUpdating}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <HiX className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Current: {station.totalSlots} slots | Available: {station.availableSlots} slots
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Total Slots</p>
                        <p className="text-2xl font-bold text-white">
                          {station.totalSlots}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Available</p>
                        <p className="text-2xl font-bold text-green-400">
                          {station.availableSlots}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <HiPhone className="w-5 h-5 mr-2 text-gray-300" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Phone Number</p>
                    <p className="text-gray-200 font-medium">
                      {station.contactPhone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email Address</p>
                    <p className="text-gray-200 font-medium">
                      {station.contactEmail}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-400">Created</p>
                      <p className="text-gray-200 font-medium text-sm">
                        {new Date(station.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Last Updated</p>
                      <p className="text-gray-200 font-medium text-sm">
                        {new Date(station.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Station Users Section */}
          <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Station Users</h2>
                <p className="text-gray-300 mt-1">
                  {stationUsers.length} users assigned to this station
                </p>
              </div>
            </div>

            {stationUsers.length === 0 ? (
              <div className="text-center py-12">
                <HiUserGroup className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  No users assigned to this station
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {stationUsers.map((user) => (
                  <div
                    key={user.id}
                    className="bg-gray-700 rounded-lg p-6 border border-gray-600 hover:shadow-lg hover:border-gray-500 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#ff7600] rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {user.firstName[0]}
                            {user.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-sm text-gray-400">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive
                            ? "bg-green-900/50 text-green-300 border border-green-700"
                            : "bg-red-900/50 text-red-300 border border-red-700"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <HiMail className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-gray-300">{user.email}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <HiUsers className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-gray-300">{user.roleName}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <HiCalendar className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-gray-300">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyStation;
