import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Sidebar from "../../components/Sidebar";
import { getAllStations } from "../../services/chargingstations.service";
import { getAllBookings } from "../../services/booking.service";
import { getAllEVOwners } from "../../services/evowner.service";
import BookingDetails from "../bookings/BookingDetails";
import api from "../../services/auth.service";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeStations: 0,
    totalBookings: 0,
    totalEVOwners: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [healthStatus, setHealthStatus] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [stationsData, bookingsData, evOwnersData, healthData] =
          await Promise.all([
            getAllStations().catch((err) => {
              console.error("Error fetching stations:", err);
              return [];
            }),
            getAllBookings().catch((err) => {
              console.error("Error fetching bookings:", err);
              return [];
            }),
            getAllEVOwners().catch((err) => {
              console.error("Error fetching EV owners:", err);
              return [];
            }),
            api.get("/health/detailed").catch((err) => {
              console.error("Error fetching health:", err);
              return null;
            }),
          ]);

        console.log("Sample station object:", stationsData[0]);
        const activeStations = Array.isArray(stationsData)
          ? stationsData.filter((s) => {
              return s.isActive === true;
            }).length
          : 0;

        setStats({
          totalUsers: Array.isArray(evOwnersData) ? evOwnersData.length : 0,
          activeStations: activeStations,
          totalBookings: Array.isArray(bookingsData) ? bookingsData.length : 0,
          totalEVOwners: Array.isArray(evOwnersData) ? evOwnersData.length : 0,
        });

        // Get recent bookings (last 5)
        if (Array.isArray(bookingsData) && bookingsData.length > 0) {
          const sortedBookings = [...bookingsData]
            .sort((a, b) => {
              const dateA = new Date(a.createdAt || a.updatedAt || 0);
              const dateB = new Date(b.createdAt || b.updatedAt || 0);
              return dateB - dateA;
            })
            .slice(0, 5);
          setRecentBookings(sortedBookings);
        }

        // Set health status
        if (healthData?.data) {
          setHealthStatus(healthData.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format time ago
  const getTimeAgo = (dateString) => {
    if (!dateString) return "Recently";

    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  // Get booking status color class
  const getBookingStatusColor = (status) => {
    if (!status) return "text-gray-400";

    const statusLower = status.toLowerCase();
    if (statusLower === "confirmed") return "text-green-400";
    if (statusLower === "cancelled") return "text-red-400";
    if (statusLower === "completed") return "text-blue-400";
    if (statusLower === "in progress") return "text-yellow-400";
    if (statusLower === "pending") return "text-orange-400";
    if (statusLower === "no show") return "text-gray-400";
    return "text-gray-400";
  };

  // Handle booking details view
  const handleViewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  // Handle closing booking details modal
  const handleCloseBookingDetails = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a2955]">
        <Sidebar />
        <main className="pt-16 px-6 pb-12">
          <div className="max-w-7xl mx-auto flex items-center justify-center h-96">
            <div className="text-white text-xl">Loading dashboard data...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a2955]">
      <Sidebar />

      <main className="pt-16 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome, {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-gray-300 text-2xl font-medium">
              Admin Dashboard
            </p>
            <p className="text-gray-400 text-lg">
              Manage the entire SparkPoint system
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors">
              <h3 className="text-white text-xl font-semibold mb-2">
                Total EV Owners
              </h3>
              <p className="text-3xl font-bold text-blue-400">
                {stats.totalEVOwners}
              </p>
              <p className="text-gray-400 text-sm mt-2">Registered users</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-green-500 transition-colors">
              <h3 className="text-white text-xl font-semibold mb-2">
                Active Stations
              </h3>
              <p className="text-3xl font-bold text-green-400">
                {stats.activeStations}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Currently operational
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-[#ff7600] transition-colors">
              <h3 className="text-white text-xl font-semibold mb-2">
                Total Bookings
              </h3>
              <p className="text-3xl font-bold text-[#ff7600]">
                {stats.totalBookings}
              </p>
              <p className="text-gray-400 text-sm mt-2">All time bookings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Bookings */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-4">
                Recent Bookings
              </h2>
              {recentBookings.length > 0 ? (
                <div className="space-y-3">
                  {recentBookings.map((booking, index) => (
                    <div
                      key={booking.id || index}
                      className="flex items-start gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                      onClick={() => handleViewBookingDetails(booking)}
                    >
                      <span className="text-2xl">📅</span>
                      <div className="flex-1">
                        <p className="text-white font-medium">
                          Booking #{booking.id?.substring(0, 8) || "N/A"}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Station:{" "}
                          {booking.station?.name ||
                            booking.stationName ||
                            booking.stationId?.substring(0, 8) ||
                            "N/A"}
                        </p>
                        <p className="text-gray-500 text-xs">
                          Status:{" "}
                          <span
                            className={getBookingStatusColor(booking.status)}
                          >
                            {booking.status || "Unknown"}
                          </span>
                        </p>
                      </div>
                      <span className="text-gray-500 text-xs whitespace-nowrap">
                        {getTimeAgo(booking.CreatedAt || booking.UpdatedAt)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-center py-8">
                  No recent bookings found
                </div>
              )}
              <button
                onClick={() => navigate("/bookings")}
                className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                View All Bookings
              </button>
            </div>

            {/* System Health */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-4">
                System Health
              </h2>
              {healthStatus ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Overall Status</span>
                      <span
                        className={`text-xl font-bold ${
                          healthStatus.status === "Healthy"
                            ? "text-green-400"
                            : healthStatus.status === "Degraded"
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        {healthStatus.status}
                      </span>
                    </div>
                  </div>

                  {healthStatus.checks?.application && (
                    <div className="p-4 bg-gray-700/50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300">Application</span>
                        <span
                          className={`text-lg font-bold ${
                            healthStatus.checks.application.status === "Healthy"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {healthStatus.checks.application.status}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs">
                        Version:{" "}
                        {healthStatus.checks.application.version || "N/A"}
                      </p>
                    </div>
                  )}

                  {healthStatus.checks?.database && (
                    <div className="p-4 bg-gray-700/50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300">Database</span>
                        <span
                          className={`text-lg font-bold ${
                            healthStatus.checks.database.status === "Healthy"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {healthStatus.checks.database.status}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs">
                        Type: {healthStatus.checks.database.type || "MongoDB"}
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-gray-700/50 rounded-lg">
                    <p className="text-gray-400 text-xs">
                      Last checked:{" "}
                      {new Date(healthStatus.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-center py-8">
                  Health status unavailable
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Booking Details Modal */}
      <BookingDetails
        booking={selectedBooking}
        isOpen={isModalOpen}
        onClose={handleCloseBookingDetails}
        user={user}
        onUpdate={() => window.location.reload()}
      />
    </div>
  );
}
