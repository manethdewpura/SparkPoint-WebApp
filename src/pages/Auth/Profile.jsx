import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  getUserProfile,
  updateUserProfile,
} from "../../services/users.service";
import Sidebar from "../../components/Sidebar";
import Toast from "../../components/Toast";

const Profile = () => {
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    Username: "",
    Email: "",
    FirstName: "",
    LastName: "",
    Password: "",
    ConfirmPassword: "",
  });
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const data = await getUserProfile();
      setProfile(data);
      setFormData({
        Username: data.username || "",
        Email: data.email || "",
        FirstName: data.firstName || "",
        LastName: data.lastName || "",
        Password: "",
        ConfirmPassword: "",
      });
    } catch (err) {
      setError(err.message || "Failed to load profile");
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      Username: profile.username || "",
      Email: profile.email || "",
      FirstName: profile.firstName || "",
      LastName: profile.lastName || "",
      Password: "",
      ConfirmPassword: "",
    });
    setError(null);
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.Username.trim()) {
      setError("Username is required");
      return;
    }
    if (!formData.Email.trim()) {
      setError("Email is required");
      return;
    }
    if (!formData.FirstName.trim()) {
      setError("First name is required");
      return;
    }
    if (!formData.LastName.trim()) {
      setError("Last name is required");
      return;
    }

    // Password validation if changing password
    if (formData.Password || formData.ConfirmPassword) {
      if (formData.Password !== formData.ConfirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (formData.Password.length < 6) {
        setError("Password must be at least 6 characters long");
        return;
      }
    }

    setIsSaving(true);

    try {
      const updateData = {
        Username: formData.Username,
        Email: formData.Email,
        FirstName: formData.FirstName,
        LastName: formData.LastName,
      };

      // Only include password if it's being changed
      if (formData.Password) {
        updateData.Password = formData.Password;
      }

      await updateUserProfile(updateData);

      // Refresh profile data
      await fetchProfile();
      setIsEditing(false);
      showToast("Profile updated successfully!", "success");
    } catch (err) {
      setError(err.message || "Failed to update profile");
      showToast(err.message || "Failed to update profile", "error");
      console.error("Error updating profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#1a2955]">
        <Sidebar />
        <div className="flex justify-center items-center min-h-screen pt-16">
          <div className="text-center p-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-300">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a2955]">
        <Sidebar />
        <main className="pt-16 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
              <p className="text-red-300 text-center">{error}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#1a2955]">
        <Sidebar />
        <main className="pt-16 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <p className="text-gray-300 text-center">
                No profile data available
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a2955]">
      <Sidebar />
      <Toast toast={toast} onClose={() => setToast({ ...toast, show: false })} />

      <main className="pt-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
                <p className="text-gray-300">Manage your account information</p>
              </div>
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Profile
                </button>
              )}
            </div>

            {error && (
              <div className="mb-6 bg-red-900/50 border border-red-700 rounded-lg p-4">
                <p className="text-red-300 text-center">{error}</p>
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Username <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="Username"
                        value={formData.Username}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        name="Email"
                        value={formData.Email}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        First Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="FirstName"
                        value={formData.FirstName}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Last Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="LastName"
                        value={formData.LastName}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        New Password (leave blank to keep current)
                      </label>
                      <input
                        type="password"
                        name="Password"
                        value={formData.Password}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        placeholder="Enter new password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="ConfirmPassword"
                        value={formData.ConfirmPassword}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        placeholder="Confirm new password"
                      />
                    </div>

                    <div className="pt-4">
                      <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Role:</span>
                          <span className="text-sm font-semibold text-blue-300">
                            {profile.roleName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Status:</span>
                          <span
                            className={`text-sm font-semibold ${
                              profile.isActive
                                ? "text-green-300"
                                : "text-red-300"
                            }`}
                          >
                            {profile.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">
                            Member Since:
                          </span>
                          <span className="text-sm text-gray-300">
                            {new Date(profile.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-4 justify-end">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors duration-200"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Username
                    </label>
                    <p className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-white">
                      {profile.username}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <p className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-white">
                      {profile.email}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name
                    </label>
                    <p className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-white">
                      {profile.firstName}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name
                    </label>
                    <p className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-white">
                      {profile.lastName}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Role
                    </label>
                    <p className="p-3 bg-blue-900/50 border border-blue-700 rounded-lg font-semibold text-blue-300">
                      {profile.roleName}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Status
                    </label>
                    <p
                      className={`p-3 rounded-lg font-semibold border ${
                        profile.isActive
                          ? "bg-green-900/50 border-green-700 text-green-300"
                          : "bg-red-900/50 border-red-700 text-red-300"
                      }`}
                    >
                      {profile.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Member Since
                    </label>
                    <p className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-white">
                      {new Date(profile.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Updated
                    </label>
                    <p className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-white">
                      {new Date(profile.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
