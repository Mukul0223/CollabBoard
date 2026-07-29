import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const ProtectedRoute = () => {
  const token =
    useAuthStore((state) => state.token) || localStorage.getItem("token");

  // If no token exists in state OR localStorage, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
