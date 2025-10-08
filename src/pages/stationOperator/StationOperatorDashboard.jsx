import Sidebar from "../../components/Sidebar";

export default function StationOperatorDashboard() {
  return (
    <div className="min-h-screen bg-[#051238]">
      <Sidebar />

      <main className="pt-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white py-20">
            <h1 className="text-4xl font-bold mb-4">
              ⚡ Welcome to SparkPoint Station Operator Dashboard
            </h1>
            <p className="text-gray-300 text-lg">
              Manage your charging station operations from here
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-white text-xl font-semibold mb-2">
                Station Status
              </h3>
              <p className="text-3xl font-bold text-green-400">Online</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-white text-xl font-semibold mb-2">
                Today's Bookings
              </h3>
              <p className="text-3xl font-bold text-blue-400">18</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-white text-xl font-semibold mb-2">
                Revenue Today
              </h3>
              <p className="text-3xl font-bold text-purple-400">$245</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
