import React, { useState, useEffect, useCallback } from "react";
import {
  FaEye,
  FaEdit,
  FaUser,
  FaSpinner,
  FaTimes,
  FaSearch,
  FaTimes as FaClear,
  FaUserCheck,
  FaUserSlash,
} from "react-icons/fa";
import {
  getAllEVOwners,
  getEVOwnerByNIC,
  updateEVOwner,
  deactivateEVOwner,
  reactivateEVOwner,
} from "../../../services/evowner.service";
import Sidebar from "../../../components/Sidebar";
import ConfirmationModal from "../../../components/ConfirmationModal";

const EVOwners = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [reactivateLoading, setReactivateLoading] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [ownerToReactivate, setOwnerToReactivate] = useState(null);
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [ownerToDeactivate, setOwnerToDeactivate] = useState(null);

  const fetchOwners = useCallback(async (search = "") => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllEVOwners(search);
      setOwners(data);
      setCurrentPage(1); // Reset to first page when searching
    } catch (error) {
      setError(error.message || "Failed to fetch EV owners");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (searchTerm.trim() === "") {
      await fetchOwners();
      return;
    }

    try {
      setSearchLoading(true);
      await fetchOwners(searchTerm);
    } catch (error) {
      setError(error.message || "Search failed");
    } finally {
      setSearchLoading(false);
    }
  }, [searchTerm, fetchOwners]);

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    fetchOwners();
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    fetchOwners();
  }, [fetchOwners]);

  const handleView = async (nic) => {
    try {
      setModalLoading(true);
      setShowModal(true);
      const ownerData = await getEVOwnerByNIC(nic);
      setSelectedOwner(ownerData);
    } catch (error) {
      setError(error.message || "Failed to fetch owner details");
      setShowModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleEdit = async (nic) => {
    try {
      setModalLoading(true);
      setShowEditModal(true);
      const ownerData = await getEVOwnerByNIC(nic);
      setSelectedOwner(ownerData);
      setEditFormData({
        FirstName: ownerData.firstName,
        LastName: ownerData.lastName,
        Email: ownerData.email,
        Phone: ownerData.phone,
        Password: "",
      });
    } catch (error) {
      setError(error.message || "Failed to fetch owner details for editing");
      setShowEditModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateOwner = async (e) => {
    e.preventDefault();
    try {
      setUpdateLoading(true);
      await updateEVOwner(selectedOwner.nic, editFormData);
      setShowEditModal(false);
      setSelectedOwner(null);
      setEditFormData({});
      // Refresh the owners list
      await fetchOwners();
      setError(""); // Clear any previous errors
    } catch (error) {
      setError(error.message || "Failed to update EV owner");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleReactivate = async (nic) => {
    setOwnerToReactivate(nic);
    setShowReactivateModal(true);
  };

  const confirmReactivate = async () => {
    try {
      setReactivateLoading(true);
      await reactivateEVOwner(ownerToReactivate);
      await fetchOwners();
      setError(""); // Clear any previous errors
      setShowReactivateModal(false);
      setOwnerToReactivate(null);
    } catch (error) {
      setError(error.message || "Failed to reactivate EV owner");
      setShowReactivateModal(false);
    } finally {
      setReactivateLoading(false);
    }
  };

  const cancelReactivate = () => {
    setShowReactivateModal(false);
    setOwnerToReactivate(null);
  };

  const handleDeactivate = async (nic) => {
    setOwnerToDeactivate(nic);
    setShowDeactivateModal(true);
  };

  const confirmDeactivate = async () => {
    try {
      setDeactivateLoading(true);
      await deactivateEVOwner(ownerToDeactivate);
      await fetchOwners();
      setError(""); // Clear any previous errors
      setShowDeactivateModal(false);
      setOwnerToDeactivate(null);
    } catch (error) {
      setError(error.message || "Failed to deactivate EV owner");
      setShowDeactivateModal(false);
    } finally {
      setDeactivateLoading(false);
    }
  };

  const cancelDeactivate = () => {
    setShowDeactivateModal(false);
    setOwnerToDeactivate(null);
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
    setSelectedOwner(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedOwner(null);
    setEditFormData({});
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOwners = owners.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(owners.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-[#1a2955]">
      <Sidebar />

      <main className="pt-16 pb-8 px-4">
        <div className="max-w-[1320px] mx-auto">
          <div className="text-center text-white py-8">
            <h1 className="text-4xl font-bold mb-4">EV Owners</h1>
            <p className="text-gray-300 text-lg">
              Manage and view all registered EV owners
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, username, email, NIC, or phone..."
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
                  {owners.length === 0 && !loading && (
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
                  Loading EV owners...
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
                          NIC
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Phone
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
                      {currentOwners.map((owner) => (
                        <tr
                          key={owner.nic}
                          className="hover:bg-gray-700 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <FaUser className="text-gray-400 mr-2" />
                              <span className="text-sm font-medium text-white">
                                {owner.username}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-300">
                              {owner.firstName} {owner.lastName}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-300">
                              {owner.email}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-300 font-mono">
                              {owner.nic}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-300">
                              {owner.phone}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                owner.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {owner.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-300">
                              {new Date(owner.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleView(owner.nic)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                              >
                                <FaEye className="mr-1" />
                                View
                              </button>
                              <button
                                onClick={() => handleEdit(owner.nic)}
                                className="inline-flex items-center px-3 py-1 border border-gray-500 text-xs font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                              >
                                <FaEdit className="mr-1" />
                                Edit
                              </button>
                              {owner.isActive ? (
                                <button
                                  onClick={() => handleDeactivate(owner.nic)}
                                  disabled={deactivateLoading}
                                  className="inline-flex items-center px-3 py-1 border border-red-500 text-xs font-medium rounded-md text-red-300 bg-red-900 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <FaUserSlash className="mr-1" />
                                  Deactivate
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleReactivate(owner.nic)}
                                  disabled={reactivateLoading}
                                  className="inline-flex items-center px-3 py-1 border border-green-500 text-xs font-medium rounded-md text-green-300 bg-green-900 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <FaUserCheck className="mr-1" />
                                  Reactivate
                                </button>
                              )}
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
                        {Math.min(indexOfLastItem, owners.length)} of{" "}
                        {owners.length} EV owners
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

      {/* Modal for viewing owner details */}
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
                EV Owner Details
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
              ) : selectedOwner ? (
                <div className="space-y-6">
                  {/* Profile Header */}
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                      <FaUser className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {selectedOwner.firstName} {selectedOwner.lastName}
                      </h3>
                      <p className="text-gray-600">@{selectedOwner.username}</p>
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
                          {selectedOwner.email}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Phone Number
                        </label>
                        <p className="mt-1 text-gray-900">
                          {selectedOwner.phone}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </label>
                        <p className="mt-1">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {selectedOwner.roleName}
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
                              selectedOwner.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {selectedOwner.isActive ? "Active" : "Inactive"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                          NIC
                        </label>
                        <p className="mt-1 text-gray-900 font-mono text-sm">
                          {selectedOwner.nic}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Registered At
                        </label>
                        <p className="mt-1 text-gray-900">
                          {new Date(
                            selectedOwner.createdAt
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

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
                        handleEdit(selectedOwner.nic);
                      }}
                      className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Edit Owner
                    </button>
                    {selectedOwner.isActive ? (
                      <button
                        onClick={() => {
                          closeModal();
                          handleDeactivate(selectedOwner.nic);
                        }}
                        className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      >
                        Deactivate Account
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          closeModal();
                          handleReactivate(selectedOwner.nic);
                        }}
                        className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                      >
                        Reactivate Account
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Failed to load owner details</p>
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
                Edit EV Owner
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
                    Loading owner details...
                  </span>
                </div>
              ) : selectedOwner ? (
                <form onSubmit={handleUpdateOwner} className="space-y-6">
                  {/* Profile Header */}
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                      <FaUser className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Edit Owner Profile
                      </h3>
                      <p className="text-gray-600">Update owner information</p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="Phone"
                        value={editFormData.Phone || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
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
                        "Update Owner"
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Failed to load owner details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeactivateModal}
        onClose={cancelDeactivate}
        onConfirm={confirmDeactivate}
        title="Deactivate EV Owner"
        message="Are you sure you want to deactivate this EV owner? This will revoke their access to the system."
        confirmText="Deactivate"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        isLoading={deactivateLoading}
      />

      {/* Reactivate Confirmation Modal */}
      <ConfirmationModal
        isOpen={showReactivateModal}
        onClose={cancelReactivate}
        onConfirm={confirmReactivate}
        title="Reactivate EV Owner"
        message="Are you sure you want to reactivate this EV owner? This will restore their access to the system."
        confirmText="Reactivate"
        cancelText="Cancel"
        confirmButtonClass="bg-green-600 hover:bg-green-700"
        isLoading={reactivateLoading}
      />
    </div>
  );
};

export default EVOwners;

