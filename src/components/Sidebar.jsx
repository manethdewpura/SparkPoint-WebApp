import { useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import { HiMenu, HiX, HiLogout } from "react-icons/hi";
import Cookies from "js-cookie";

export default function Sidebar({ userType = "Admin" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get user data from cookies
  const getUserData = () => {
    try {
      const userData = Cookies.get("userData");
      return userData ? JSON.parse(userData) : {};
    } catch {
      return {};
    }
  };

  const user = getUserData();
  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  return (
    <>
      {/* Header with Hamburger Menu and Profile */}
      <header className="bg-[#051238] border-b border-gray-700 px-4 py-3 flex items-center justify-between relative z-20">
        <button
          onClick={toggleSidebar}
          className="text-white hover:text-gray-300 focus:outline-none"
        >
          <HiMenu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="SparkPoint Logo" className="w-8 h-8" />
          <h1 className="text-white text-xl font-semibold">
            SparkPoint {userType}
          </h1>
        </div>

        <button
          onClick={toggleProfileMenu}
          className="flex items-center gap-2 text-white hover:text-gray-300 focus:outline-none p-2 rounded hover:bg-gray-700 transition-colors"
        >
          <span className="flex w-8 h-8 rounded-full bg-[#ff7600] text-white items-center justify-center font-semibold">
            {firstName?.[0]?.toUpperCase() || "U"}
          </span>
          <span className="hidden sm:inline">Profile</span>
        </button>
      </header>

      {/* Profile Menu Overlay */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setShowProfileMenu(false)}
        />
      )}

      {/* Profile Dropdown */}
      {showProfileMenu && (
        <div className="fixed top-16 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 w-48">
          <div className="px-4 py-2 border-b border-gray-200">
            <p className="font-medium text-gray-900">{fullName || "User"}</p>
            <p className="text-sm text-gray-500">{userType}</p>
          </div>
          <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
            Profile Settings
          </button>
          <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
            Account
          </button>
          <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
            Preferences
          </button>
        </div>
      )}

      {/* Overlay (dims + blurs everything including header) */}
      <div
        className={`fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#051238] border-r border-gray-700 transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 relative h-full">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-white text-lg font-semibold">Menu</h2>
            <button
              onClick={toggleSidebar}
              className="text-white hover:text-gray-300 focus:outline-none"
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>

          <nav className="space-y-4">
            <div className="text-gray-400 text-sm uppercase tracking-wider">
              Navigation
            </div>

            <button
              onClick={() => navigate("/admin")}
              className="w-full text-left text-white hover:text-gray-300 py-2 px-3 rounded hover:bg-gray-700 transition-colors"
            >
              Dashboard
            </button>

            {userType === "Admin" && (
              <>
                <button className="w-full text-left text-white hover:text-gray-300 py-2 px-3 rounded hover:bg-gray-700 transition-colors">
                  Booking Management
                </button>
                <button className="w-full text-left text-white hover:text-gray-300 py-2 px-3 rounded hover:bg-gray-700 transition-colors">
                  EV Owner Management
                </button>
                <button
                  onClick={() => navigate("/admin/station-operators")}
                  className="w-full text-left text-white hover:text-gray-300 py-2 px-3 rounded hover:bg-gray-700 transition-colors"
                >
                  Station Operator Management
                </button>
                <button
                  onClick={() => navigate("/admin/stations")}
                  className="w-full text-left text-white hover:text-gray-300 py-2 px-3 rounded hover:bg-gray-700 transition-colors"
                >
                  Stations Management
                </button>
                <button
                  onClick={() => navigate("/admin/register")}
                  className="w-full text-left text-white hover:text-gray-300 py-2 px-3 rounded hover:bg-gray-700 transition-colors"
                >
                  Admin Registration
                </button>
              </>
            )}

            {userType === "Station Operator" && (
              <>
                <button className="w-full text-left text-white hover:text-gray-300 py-2 px-3 rounded hover:bg-gray-700 transition-colors">
                  My Station
                </button>
                <button className="w-full text-left text-white hover:text-gray-300 py-2 px-3 rounded hover:bg-gray-700 transition-colors">
                  Bookings
                </button>
              </>
            )}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={handleLogout}
              className="w-full bg-[#ff7600] hover:bg-[#8e490d] text-white py-2 px-4 rounded transition-colors flex items-center justify-center gap-2 mb-4"
            >
              <HiLogout className="w-5 h-5" />
              Logout
            </button>

            {/* Footer */}
            <div className="text-center text-gray-400 text-xs border-t border-gray-700 pt-3">
              <p>&copy; 2025 SparkPoint</p>
              <p className="mt-1">All rights reserved</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
