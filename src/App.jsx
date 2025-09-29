import { Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StationOperatorDashboard from "./pages/stationOperator/StationOperatorDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/operator" element={<StationOperatorDashboard />} />
    </Routes>
  );
}

export default App;
