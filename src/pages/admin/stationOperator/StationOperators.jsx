import React, { useState, useEffect, useCallback } from "react";
import {
  FaEye,
  FaEdit,
  FaUser,
  FaSpinner,
  FaTimes,
  FaSearch,
  FaTimes as FaClear,
} from "react-icons/fa";
import {
  getAllStationOperators,
  getStationOperatorById,
  updateStationOperator,
} from "../../../services/stationoperator.service";
import Sidebar from "../../../components/Sidebar";

const StationOperators = () => {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchOperators = useCallback(async (search = "") => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllStationOperators(search);
      setOperators(data);
      setCurrentPage(1); // Reset to first page when searching
    } catch (error) {
      setError(error.message || "Failed to fetch station operators");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (searchTerm.trim() === "") {
      await fetchOperators();
      return;
    }

    try {
      setSearchLoading(true);
      await fetchOperators(searchTerm);
    } catch (error) {
      setError(error.message || "Search failed");
    } finally {
      setSearchLoading(false);
    }
  }, [searchTerm, fetchOperators]);

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    fetchOperators();
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    fetchOperators();
  }, [fetchOperators]);

  const handleView = async (operatorId) => {
    try {
      setModalLoading(true);
      setShowModal(true);
      const operatorData = await getStationOperatorById(operatorId);
      setSelectedOperator(operatorData);
    } catch (error) {
      setError(error.message || "Failed to fetch operator details");
      setShowModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleEdit = async (operatorId) => {
    try {
      setModalLoading(true);
      setShowEditModal(true);
      const operatorData = await getStationOperatorById(operatorId);
      setSelectedOperator(operatorData);
      setEditFormData({
        Username: operatorData.username,
        Email: operatorData.email,
        FirstName: operatorData.firstName,
        LastName: operatorData.lastName,
        ChargingStationId: operatorData.chargingStationId,
        Password: "",
      });
    } catch (error) {
      setError(error.message || "Failed to fetch operator details for editing");
      setShowEditModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateOperator = async (e) => {
    e.preventDefault();
    try {
      setUpdateLoading(true);
      await updateStationOperator(selectedOperator.id, editFormData);
      setShowEditModal(false);
      setSelectedOperator(null);
      setEditFormData({});
      // Refresh the operators list
      await fetchOperators();
      setError(""); // Clear any previous errors
    } catch (error) {
      setError(error.message || "Failed to update station operator");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOperator(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedOperator(null);
    setEditFormData({});
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOperators = operators.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(operators.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-[#1a2955]">
      <Sidebar />

      <main className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white py-8">
            <h1 className="text-4xl font-bold mb-4">Station Operators Management</h1>
            <p className="text-gray-300 text-lg">
              Manage and view all registered station operators
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search operators by name, username, or email..."
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  onKeyPress={handleSearchKeyPress}
                  className="w-full px-4 py-3 pr-24 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  {searchTerm && (
                    <button
                      onClick={handleClearSearch}
                      className="px-2 py-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Clear search"
                    >
                      <FaClear className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={handleSearch}
                    disabled={searchLoading}
                    className="px-4 py-2 mr-1 text-white bg-blue-600 hover:bg-blue-700 rounded-r-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Search"
                  >
                    {searchLoading ? (
                      <FaSpinner className="w-4 h-4 animate-spin" />
                    ) : (
                      <FaSearch className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              {searchTerm && (
                <p className="mt-2 text-sm text-gray-300 text-center">
                  Searching for:{" "}
                  <span className="font-semibold">"{searchTerm}"</span>
                  {operators.length === 0 && !loading && (
                    <span className="text-yellow-300"> - No results found</span>
                  )}
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <FaSpinner className="animate-spin text-4xl text-blue-400" />
                <span className="ml-3 text-lg text-gray-300">
                  Loading operators...
                </span>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Registered At
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                      {currentOperators.map((operator) => (
                        <tr
                          key={operator.id}
                          className="hover:bg-gray-700 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <FaUser className="text-gray-400 mr-2" />
                              <span className="text-sm font-medium text-white">
                                {operator.username}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-300">
                              {operator.firstName} {operator.lastName}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-300">
                              {operator.email}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                operator.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {operator.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-300">
                              {new Date(
                                operator.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleView(operator.id)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                              >
                                <FaEye className="mr-1" />
                                View
                              </button>
                              <button
                                onClick={() => handleEdit(operator.id)}
                                className="inline-flex items-center px-3 py-1 border border-gray-500 text-xs font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                              >
                                <FaEdit className="mr-1" />
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-gray-700 rounded-b-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-300">
                        Showing {indexOfFirstItem + 1} to{" "}
                        {Math.min(indexOfLastItem, operators.length)} of{" "}
                        {operators.length} operators
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="border border-gray-600 bg-gray-800 text-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={5}>5 per page</option>
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                      </select>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 border border-gray-600 rounded-md text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </button>
                        {[...Array(totalPages)].map((_, index) => (
                          <button
                            key={index + 1}
                            onClick={() => paginate(index + 1)}
                            className={`px-3 py-1 border rounded-md text-sm font-medium transition-colors ${
                              currentPage === index + 1
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700"
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 border border-gray-600 rounded-md text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Modal for viewing operator details */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Station Operator Details
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {modalLoading ? (
                <div className="flex justify-center items-center py-8">
                  <FaSpinner className="animate-spin text-4xl text-blue-500" />
                  <span className="ml-3 text-lg text-gray-600">
                    Loading details...
                  </span>
                </div>
              ) : selectedOperator ? (
                <div className="space-y-6">
                  {/* Profile Header */}
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                      <FaUser className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {selectedOperator.firstName} {selectedOperator.lastName}
                      </h3>
                      <p className="text-gray-600">
                        @{selectedOperator.username}
                      </p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Email Address
                        </label>
                        <p className="mt-1 text-gray-900">
                          {selectedOperator.email}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </label>
                        <p className="mt-1">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {selectedOperator.roleName}
                          </span>
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </label>
                        <p className="mt-1">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              selectedOperator.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {selectedOperator.isActive ? "Active" : "Inactive"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Station ID
                        </label>
                        <p className="mt-1 text-gray-900 font-mono text-sm">
                          {selectedOperator.chargingStationId}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Registered At
                        </label>
                        <p className="mt-1 text-gray-900">
                          {new Date(
                            selectedOperator.createdAt
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Charging Station Details */}
                  {selectedOperator.chargingStation && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        Assigned Charging Station
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Station Name
                            </label>
                            <p className="mt-1 text-gray-900 font-semibold">
                              {selectedOperator.chargingStation.name}
                            </p>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Address
                            </label>
                            <p className="mt-1 text-gray-900">
                              {selectedOperator.chargingStation.address}
                            </p>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                              City & Province
                            </label>
                            <p className="mt-1 text-gray-900">
                              {selectedOperator.chargingStation.city},{" "}
                              {selectedOperator.chargingStation.province}{" "}
                              Province
                            </p>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Contact Phone
                            </label>
                            <p className="mt-1 text-gray-900">
                              {selectedOperator.chargingStation.contactPhone}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Station Type
                            </label>
                            <p className="mt-1 text-gray-900 text-lg font-semibold">
                              {selectedOperator.chargingStation.type}
                            </p>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Total Slots
                            </label>
                            <p className="mt-1 text-gray-900 text-lg font-semibold">
                              {selectedOperator.chargingStation.totalSlots}
                            </p>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Available Slots
                            </label>
                            <p className="mt-1 text-gray-900 text-lg font-semibold">
                              {selectedOperator.chargingStation.availableSlots}
                            </p>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Station Status
                            </label>
                            <p className="mt-1">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  selectedOperator.chargingStation.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {selectedOperator.chargingStation.isActive
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        closeModal();
                        handleEdit(selectedOperator.id);
                      }}
                      className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Edit Operator
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Failed to load operator details
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={closeEditModal}
        >
          <div
            className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Edit Station Operator
              </h2>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {modalLoading ? (
                <div className="flex justify-center items-center py-8">
                  <FaSpinner className="animate-spin text-4xl text-blue-500" />
                  <span className="ml-3 text-lg text-gray-600">
                    Loading operator details...
                  </span>
                </div>
              ) : selectedOperator ? (
                <form onSubmit={handleUpdateOperator} className="space-y-6">
                  {/* Profile Header */}
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                      <FaUser className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Edit Operator Profile
                      </h3>
                      <p className="text-gray-600">
                        Update operator information
                      </p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        name="Username"
                        value={editFormData.Username || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="Email"
                        value={editFormData.Email || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="FirstName"
                        value={editFormData.FirstName || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="LastName"
                        value={editFormData.LastName || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        name="Password"
                        value={editFormData.Password || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Leave empty to keep current password"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={closeEditModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateLoading}
                      className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {updateLoading ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" />
                          Updating...
                        </>
                      ) : (
                        "Update Operator"
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Failed to load operator details
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StationOperators;
