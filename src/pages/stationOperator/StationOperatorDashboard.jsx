import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { getStationById } from "../../services/chargingstations.service";
import { getAllBookings } from "../../services/booking.service";
import {
  HiLightningBolt,
  HiLocationMarker,
  HiCalendar,
  HiClock,
  HiCheckCircle,
  HiXCircle,
  HiInformationCircle,
} from "react-icons/hi";

export default function StationOperatorDashboard() {
  const [stationData, setStationData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedToday: 0,
    pendingBookings: 0,
  });

  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        if (!user?.chargingStationId) {
          return;
        }

        // Fetch station data
        const stationResponse = await getStationById(user.chargingStationId);
        setStationData(stationResponse);

        // Fetch bookings for this station
        const bookingsResponse = await getAllBookings({
          stationId: user.chargingStationId,
        });
        setBookings(bookingsResponse);

        // Calculate statistics
        const today = new Date().toISOString().split("T")[0];
        const activeStatuses = ["Pending", "Confirmed", "In-Progress"];
        
        const activeBookings = bookingsResponse.filter((b) =>
          activeStatuses.includes(b.status)
        );
        
        const completedToday = bookingsResponse.filter((b) => {
          if (b.status !== "Completed" || !b.bookingDate) return false;
          const bookingDate = new Date(b.bookingDate);
          if (isNaN(bookingDate.getTime())) return false;
          return bookingDate.toISOString().split("T")[0] === today;
        });
        
        const pendingBookings = bookingsResponse.filter(
          (b) => b.status === "Pending"
        );

        setStats({
          totalBookings: bookingsResponse.length,
          activeBookings: activeBookings.length,
          completedToday: completedToday.length,
          pendingBookings: pendingBookings.length,
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.chargingStationId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#051238]">
        <Sidebar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg text-white">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#051238]">
      <Sidebar />

      <main className="pt-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome, {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-gray-300 text-lg">
              Station Operator Dashboard - Manage your charging station
              operations
            </p>
          </div>

          {/* Station Info Card */}
          {stationData?.station && (
            <div
              className="bg-gradient-to-r from-[#ff7600] to-[#ff9933] rounded-xl shadow-lg p-6 mb-8 cursor-pointer hover:shadow-2xl transition-shadow"
              onClick={() => navigate("/station-operator/my-station")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <HiLightningBolt className="w-6 h-6 text-white mr-2" />
                    <h2 className="text-2xl font-bold text-white">
                      {stationData.station.name}
                    </h2>
                  </div>
                  <div className="flex items-center text-white/90 mb-1">
                    <HiLocationMarker className="w-4 h-4 mr-1" />
                    <span className="text-sm">
                      {stationData.station.address}, {stationData.station.city}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-3">
                    <div className="bg-white/20 rounded-lg px-3 py-1">
                      <span className="text-white text-sm font-medium">
                        {stationData.station.type}
                      </span>
                    </div>
                    <div className="text-white text-sm">
                      <span className="font-semibold">
                        {stationData.station.availableSlots}
                      </span>{" "}
                      / {stationData.station.totalSlots} slots available
                    </div>
                  </div>
                </div>
                <div
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    stationData.station.isActive
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {stationData.station.isActive ? "Active" : "Inactive"}
                </div>
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-400 text-sm font-medium">
                  Total Bookings
                </h3>
                <HiCalendar className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-white">
                {stats.totalBookings}
              </p>
              <p className="text-xs text-gray-500 mt-2">All time bookings</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-green-500 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-400 text-sm font-medium">
                  Active Bookings
                </h3>
                <HiCheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-green-400">
                {stats.activeBookings}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Pending, confirmed & in-progress
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-400 text-sm font-medium">
                  Completed Today
                </h3>
                <HiCheckCircle className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-purple-400">
                {stats.completedToday}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Successfully completed
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-yellow-500 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-400 text-sm font-medium">
                  Pending Approvals
                </h3>
                <HiClock className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-3xl font-bold text-yellow-400">
                {stats.pendingBookings}
              </p>
              <p className="text-xs text-gray-500 mt-2">Awaiting confirmation</p>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Recent Bookings</h2>
              <button
                onClick={() => navigate("/bookings")}
                className="px-4 py-2 bg-[#ff7600] text-white rounded-lg hover:bg-[#e66a00] transition-colors text-sm font-medium"
              >
                View All
              </button>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <HiInformationCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No bookings yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-white font-semibold">
                            Booking #{booking.id.slice(-6)}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              booking.status === "Completed"
                                ? "bg-green-900/50 text-green-300 border border-green-700"
                                : booking.status === "Cancelled"
                                ? "bg-red-900/50 text-red-300 border border-red-700"
                                : booking.status === "In-Progress"
                                ? "bg-blue-900/50 text-blue-300 border border-blue-700"
                                : "bg-yellow-900/50 text-yellow-300 border border-yellow-700"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center text-gray-300">
                            <HiCalendar className="w-4 h-4 mr-2 text-gray-500" />
                            {new Date(booking.bookingDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-gray-300">
                            <HiClock className="w-4 h-4 mr-2 text-gray-500" />
                            {booking.timeSlot}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <button
                          onClick={() => navigate("/bookings")}
                          className="text-[#ff7600] hover:text-[#e66a00] text-sm font-medium"
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <button
              onClick={() => navigate("/station-operator/my-station")}
              className="bg-gray-800 p-6 rounded-lg border-2 border-gray-700 hover:border-[#ff7600] transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-white text-xl font-semibold mb-2 group-hover:text-[#ff7600] transition-colors">
                    Manage My Station
                  </h3>
                  <p className="text-gray-400 text-sm">
                    View station details and update available slots
                  </p>
                </div>
                <HiLightningBolt className="w-12 h-12 text-gray-600 group-hover:text-[#ff7600] transition-colors" />
              </div>
            </button>

            <button
              onClick={() => navigate("/bookings")}
              className="bg-gray-800 p-6 rounded-lg border-2 border-gray-700 hover:border-[#ff7600] transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-white text-xl font-semibold mb-2 group-hover:text-[#ff7600] transition-colors">
                    View All Bookings
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Manage and track all station bookings
                  </p>
                </div>
                <HiCalendar className="w-12 h-12 text-gray-600 group-hover:text-[#ff7600] transition-colors" />
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
