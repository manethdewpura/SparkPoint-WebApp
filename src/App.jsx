import { Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import AdminSignupPage from "./pages/admin/AdminSignupPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminManagementPage from "./pages/admin/AdminManagementPage";
import StationOperatorDashboard from "./pages/stationOperator/StationOperatorDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

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
          path="/admin/management"
          element={
            <ProtectedRoute allowedRoles={[1]}>
              <AdminManagementPage />
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
      </Routes>
  );
}

export default App;
