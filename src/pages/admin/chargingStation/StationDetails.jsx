import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FiArrowLeft, FiMapPin, FiUsers, FiActivity } from "react-icons/fi";
import { getStationById } from "../../../services/chargingstations.service";
import Sidebar from "../../../components/Sidebar";

const StationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStationDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getStationById(id);
      const stationData = {
        ...data.station,
        stationUsers: data.stationUsers || [],
      };
      setStation(stationData);
    } catch (error) {
      console.error("Error fetching station details:", error);
      setError(
        error.response?.data?.message || "Failed to fetch station details"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStationDetails();
  }, [fetchStationDetails]);

  const handleGoBack = () => {
    navigate("/admin/stations");
  };

  const handleEditStation = () => {
    const stationId = station?.id || id;
    navigate(`/admin/stations/${stationId}/edit`);
  };

  const handleRegisterOperator = () => {
    const stationId = station?.id || id;
    navigate(`/admin/stations/${stationId}/register-operator`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a2955]">
        <Sidebar userType="Admin" />
        <main className="pt-16 pb-8 px-6">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="flex items-center gap-3 text-white">
              <AiOutlineLoading3Quarters className="animate-spin h-6 w-6" />
              <span className="text-lg">Loading station details...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a2955]">
        <Sidebar userType="Admin" />
        <main className="pt-16 pb-8 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={handleGoBack}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              ← Back to Stations
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="min-h-screen bg-[#1a2955]">
        <Sidebar userType="Admin" />
        <main className="pt-16 pb-8 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 text-center">
              <p className="text-gray-300 text-lg">Station not found.</p>
            </div>
            <button
              onClick={handleGoBack}
              className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              ← Back to Stations
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a2955]">
      <Sidebar userType="Admin" />

      <main className="pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={handleGoBack}
                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors duration-200"
              >
                <FiArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {station.name || "Station Name"}
                </h1>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
                      station.isActive !== undefined && station.isActive
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {station.isActive !== undefined
                      ? station.isActive
                        ? "Active"
                        : "Inactive"
                      : "Unknown"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleEditStation}
                className="bg-[#ff7600] hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Edit Station
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FiActivity className="h-5 w-5" />
                Basic Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Station Name
                  </label>
                  <p className="text-white text-lg">{station.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Type
                  </label>
                  <p className="text-white">{station.type || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Total Slots
                  </label>
                  <p className="text-white text-lg">{station.totalSlots || 0}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Operating Hours
                  </label>
                  <p className="text-white">
                    {station.operatingHours || "6:00 AM - 12:00 PM"}
                  </p>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FiMapPin className="h-5 w-5" />
                Location Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Address
                  </label>
                  <p className="text-white">{station.address || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Coordinates
                  </label>
                  <p className="text-white">
                    {typeof station.location === "object" &&
                    station.location !== null
                      ? station.location.latitude && station.location.longitude
                        ? `${station.location.latitude}, ${station.location.longitude}`
                        : JSON.stringify(station.location)
                      : station.location || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    City
                  </label>
                  <p className="text-white">{station.city || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    State/Province
                  </label>
                  <p className="text-white">{station.province || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">
                Additional Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Contact Number
                  </label>
                  <p className="text-white">{station.contactPhone || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Email
                  </label>
                  <p className="text-white">{station.contactEmail || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Created At
                  </label>
                  <p className="text-white">
                    {station.createdAt
                      ? new Date(station.createdAt).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Last Updated
                  </label>
                  <p className="text-white">
                    {station.updatedAt
                      ? new Date(station.updatedAt).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Station Operators */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 lg:col-span-3">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <FiUsers className="h-5 w-5" />
                  Station Operators ({station.stationUsers?.length || 0})
                </h2>
                <button
                  onClick={handleRegisterOperator}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  + Add Operator
                </button>
              </div>

              {station.stationUsers && station.stationUsers.length > 0 ? (
                <div className="space-y-3">
                  {station.stationUsers.map((user) => (
                    <div
                      key={user.id}
                      className="bg-gray-700 p-4 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.firstName?.charAt(0) || "U"}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.username}
                          </p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                          <p className="text-gray-400 text-xs">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiUsers className="mx-auto h-12 w-12 text-gray-600 mb-3" />
                  <p className="text-gray-400 mb-4">
                    No operators assigned to this station
                  </p>
                  <button
                    onClick={handleRegisterOperator}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Register First Operator
                  </button>
                </div>
              )}
            </div>

            
          </div>
        </div>
      </main>
    </div>
  );
};

export default StationDetails;
