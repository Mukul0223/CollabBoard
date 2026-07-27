import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  // Placeholder check until Zustand state is connected in Milestone 7
  const isAuthenticated = true;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
