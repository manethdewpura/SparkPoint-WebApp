import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import {
  getAllStations,
  toggleStationStatus,
} from "../../../services/chargingstations.service";
import Sidebar from "../../../components/Sidebar";
import { formatLocation } from "../../../utils/locationUtils";

const ChargingStations = () => {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const data = await getAllStations();
      setStations(data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch stations");
    } finally {
      setLoading(false);
    }
  };

  const handleViewStation = (stationId) => {
    navigate(`/admin/stations/${stationId}`);
  };

  const handleUpdateStation = (stationId) => {
    navigate(`/admin/stations/${stationId}/edit`);
  };

  const handleToggleStatus = async (stationId, currentStatus) => {
    try {
      await toggleStationStatus(stationId, !currentStatus);
      // Refresh the stations list
      fetchStations();
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to update station status"
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#1a2955]">
      <Sidebar userType="Admin" />

      <main className="pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center min-h-[60vh]">
              <div className="flex items-center gap-3 text-white">
                <AiOutlineLoading3Quarters className="animate-spin h-6 w-6" />
                <span className="text-lg">Loading stations...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center text-white">
                <div className="flex justify-between items-center mb-8">
                  <div className="text-left">
                    <h1 className="text-4xl font-bold mb-4">
                      Charging Stations Management
                    </h1>
                    <p className="text-gray-300 text-lg">
                      Manage and monitor all charging stations in the system
                    </p>
                  </div>
                  <button
                    className="bg-[#ff7600] hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                    onClick={() => navigate("/admin/stations/new")}
                  >
                    Add New Station
                  </button>
                </div>
              </div>

              {stations.length === 0 ? (
                <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 text-center">
                  <p className="text-gray-300 text-lg">
                    No charging stations found.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  {stations.map((station) => (
                    <div
                      key={station._id || station.id}
                      className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200 hover:-translate-y-1"
                    >
                      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-700">
                        <h3 className="text-xl font-semibold text-white">
                          {station.name}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
                            station.isActive
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {station.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="space-y-3 mb-6">
                        <p className="text-gray-300 text-sm">
                          <span className="font-medium text-white">
                            Location:
                          </span>{" "}
                          {formatLocation(station.location)}
                        </p>
                        <p className="text-gray-300 text-sm">
                          <span className="font-medium text-white">Type:</span>{" "}
                          {station.type || "N/A"}
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                          <p className="text-gray-300 text-sm">
                            <span className="font-medium text-white">
                              Total Slots:
                            </span>{" "}
                            <span className="text-[#ff7600] font-bold">
                              {station.totalSlots || 0}
                            </span>
                          </p>
                          <p className="text-gray-300 text-sm">
                            <span className="font-medium text-white">
                              Available Slots:
                            </span>{" "}
                            <span className="text-green-400 font-bold">
                              {station.availableSlots || 0}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button
                            className="bg-[#0191fe] hover:bg-[#0367b4] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex-1"
                            onClick={() => handleViewStation(station.id)}
                          >
                            View Details
                          </button>
                          <button
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex-1"
                            onClick={() => handleUpdateStation(station.id)}
                          >
                            Update
                          </button>
                        </div>
                        <button
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 w-full ${
                            station.isActive
                              ? "bg-red-600 hover:bg-red-700 text-white"
                              : "bg-green-600 hover:bg-green-700 text-white"
                          }`}
                          onClick={() =>
                            handleToggleStatus(station.id, station.isActive)
                          }
                        >
                          {station.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ChargingStations;
