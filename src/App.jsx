import { Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import AdminSignupPage from "./pages/admin/AdminSignupPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StationOperatorDashboard from "./pages/stationOperator/StationOperatorDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ChargingStations from "./pages/admin/chargingStation/ChargingStations";
import StationDetails from "./pages/admin/chargingStation/StationDetails";
import RegisterStationOperator from "./pages/admin/stationOperator/RegisterStationOperator";
import StationOperators from "./pages/admin/stationOperator/StationOperators";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[1]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/register"
        element={
          <ProtectedRoute allowedRoles={[1]}>
            <AdminSignupPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/operator"
        element={
          <ProtectedRoute allowedRoles={[2]}>
            <StationOperatorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/stations"
        element={
          <ProtectedRoute allowedRoles={[1]}>
            <ChargingStations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/stations/:id"
        element={
          <ProtectedRoute allowedRoles={[1]}>
            <StationDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/stations/:id/register-operator"
        element={
          <ProtectedRoute allowedRoles={[1]}>
            <RegisterStationOperator />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/station-operators"
        element={
          <ProtectedRoute allowedRoles={[1]}>
            <StationOperators />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
