import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getUserProfile } from "../../services/users.service";
import Sidebar from "../../components/Sidebar";

const Profile = () => {
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const data = await getUserProfile();
      setProfile(data);
    } catch (err) {
      setError(err.message || "Failed to load profile");
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
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

      <main className="pt-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
              <p className="text-gray-300">Manage your account information</p>
            </div>

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
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
