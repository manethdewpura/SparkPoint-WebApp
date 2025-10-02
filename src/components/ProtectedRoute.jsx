import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If authenticated but no role restrictions, allow access
  if (allowedRoles.length === 0) {
    return children;
  }

  // Check if user's role is in allowed roles
  const userRoleId = user?.roleId;
  if (allowedRoles.includes(userRoleId)) {
    return children;
  }

  // If user doesn't have required role, redirect to appropriate dashboard
  if (userRoleId === 1) {
    return <Navigate to="/admin" replace />;
  } else if (userRoleId === 2) {
    return <Navigate to="/operator" replace />;
  }

  // Fallback to login if no valid role
  return <Navigate to="/" replace />;
};

export default ProtectedRoute;
