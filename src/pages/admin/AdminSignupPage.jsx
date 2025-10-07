import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { registerAdmin } from "../../services/users.service";
import Sidebar from "../../components/Sidebar";

const AdminSignupPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    Username: "",
    Email: "",
    FirstName: "",
    LastName: "",
    Password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Handle success navigation with cleanup
  useEffect(() => {
    if (success) {
      const timeoutId = setTimeout(() => {
        navigate("/admin");
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [success, navigate]);

  // Check if user is authenticated as admin on component mount
  useEffect(() => {
    // Check if user exists and has admin role
    if (!isAuthenticated || !user?.id) {
      setError("You must be logged in to register new admins.");
      navigate("/");
      return;
    } else if (user.roleId !== 1 && user.role !== 1 && user.Role !== 1) {
      setError("Only administrators can register new admins.");
      navigate("/admin");
      return;
    }
  }, [navigate, isAuthenticated, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await registerAdmin(formData);
      setSuccess("Admin registered successfully!");

      // Reset form
      setFormData({
        Username: "",
        Email: "",
        FirstName: "",
        LastName: "",
        Password: "",
      });

      // Navigation will be handled by useEffect with proper cleanup
    } catch (error) {
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-[#1a2955]">
      <Sidebar userType="Admin" />

      <div className="flex-1 ml-0">
        <main className="pt-16 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Register New Administrator
                </h1>
                <p className="text-gray-300">
                  Add a new administrator to the SparkPoint system
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-900/50 border border-green-700 rounded-lg">
                  <p className="text-green-300 text-sm">{success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="FirstName"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      id="FirstName"
                      name="FirstName"
                      placeholder="Enter first name"
                      value={formData.FirstName}
                      onChange={handleChange}
                      required
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff7600] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="LastName"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="LastName"
                      name="LastName"
                      placeholder="Enter last name"
                      value={formData.LastName}
                      onChange={handleChange}
                      required
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff7600] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="Username"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    id="Username"
                    name="Username"
                    placeholder="Enter username"
                    value={formData.Username}
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff7600] focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="Email"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="Email"
                    name="Email"
                    placeholder="Enter email address"
                    value={formData.Email}
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff7600] focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="Password"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="Password"
                      name="Password"
                      placeholder="Enter password"
                      value={formData.Password}
                      onChange={handleChange}
                      required
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff7600] focus:border-transparent pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                    >
                      {showPassword ? (
                        <AiOutlineEyeInvisible className="h-5 w-5" />
                      ) : (
                        <AiOutlineEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-[#ff7600] text-white font-semibold py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Registering...
                      </div>
                    ) : (
                      "Register Admin"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-gray-500 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSignupPage;
