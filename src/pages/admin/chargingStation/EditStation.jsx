import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import {
  getStationById,
  updateStation,
} from "../../../services/chargingstations.service";
import Sidebar from "../../../components/Sidebar";

const EditStation = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchingStation, setFetchingStation] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    location: {
      longitude: "",
      latitude: "",
    },
    type: "AC",
    totalSlots: "",
    address: "",
    city: "",
    province: "",
    contactPhone: "",
    contactEmail: "",
  });

  const fetchStation = useCallback(async () => {
    if (!id) {
      setError("No station ID provided");
      setFetchingStation(false);
      return;
    }

    try {
      setFetchingStation(true);
      setError("");

      const response = await getStationById(id);

      // Handle different possible response structures
      let station = null;

      if (response.data) {
        station = response.data;
      } else if (response.station) {
        station = response.station;
      } else if (response._id || response.id) {
        station = response;
      } else {
        station = response;
      }

      if (!station || (!station._id && !station.id)) {
        throw new Error("Station not found or invalid station data");
      }

      const newFormData = {
        name: station.name || "",
        location: {
          longitude: (
            station.location?.longitude ||
            station.longitude ||
            ""
          ).toString(),
          latitude: (
            station.location?.latitude ||
            station.latitude ||
            ""
          ).toString(),
        },
        type: station.type || "AC",
        totalSlots: (station.totalSlots || "").toString(),
        address: station.address || "",
        city: station.city || "",
        province: station.province || "",
        contactPhone: station.contactPhone || "",
        contactEmail: station.contactEmail || "",
      };

      setFormData(newFormData);
    } catch (error) {
      console.error("Error fetching station:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch station details"
      );
    } finally {
      setFetchingStation(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStation();
  }, [fetchStation]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "longitude" || name === "latitude") {
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [name]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Convert string values to appropriate types
      const submitData = {
        ...formData,
        location: {
          longitude: parseFloat(formData.location.longitude),
          latitude: parseFloat(formData.location.latitude),
        },
        totalSlots: parseInt(formData.totalSlots),
      };

      // Call the API service to update the station
      await updateStation(id, submitData);

      // Navigate back to stations list on success
      navigate("/admin/stations");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update station");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/stations");
  };

  if (fetchingStation) {
    return (
      <div className="min-h-screen bg-[#1a2955]">
        <Sidebar />
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

  return (
    <div className="min-h-screen bg-[#1a2955]">
      <Sidebar />

      <main className="pt-16 pb-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-white mb-8">
            <h1 className="text-4xl font-bold mb-4">Edit Charging Station</h1>
            <p className="text-gray-300 text-lg">
              Update charging station information (ID: {id})
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Station Name */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Station Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff7600] focus:border-transparent"
                  placeholder="Enter station name"
                />
              </div>

              {/* Location Coordinates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Longitude <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.location.longitude}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff7600] focus:border-transparent"
                    placeholder="e.g., 79.8612"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">
                    Latitude <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.location.latitude}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff7600] focus:border-transparent"
                    placeholder="e.g., 6.9271"
                  />
                </div>
              </div>

              {/* Station Type */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Station Type <span className="text-red-400">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff7600] focus:border-transparent"
                >
                  <option value="AC">AC</option>
                  <option value="DC">DC</option>
                  <option value="Universal">Universal</option>
                </select>
              </div>

              {/* Total Slots */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Total Slots <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="totalSlots"
                  value={formData.totalSlots}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff7600] focus:border-transparent"
                  placeholder="e.g., 5"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff7600] focus:border-transparent"
                  placeholder="e.g., No. 123, Maple Street, Anytown"
                />
              </div>

              {/* City and Province */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">
                    City <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff7600] focus:border-transparent"
                    placeholder="e.g., Colombo"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">
                    Province <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff7600] focus:border-transparent"
                    placeholder="e.g., Western Province"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Contact Phone <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff7600] focus:border-transparent"
                    placeholder="e.g., 0112435678"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">
                    Contact Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff7600] focus:border-transparent"
                    placeholder="e.g., spark.point@gmail.com"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#ff7600] hover:bg-orange-600 disabled:bg-gray-600 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 flex-1"
                >
                  {loading && (
                    <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />
                  )}
                  {loading ? "Updating..." : "Update Station"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditStation;
