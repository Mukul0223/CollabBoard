import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-indigo-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard"
            className="text-xl font-bold tracking-tight hover:opacity-90"
          >
            CollabBoard
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium opacity-90">
            Welcome, {user?.name || "User"}
          </span>
          <button
            onClick={handleLogout}
            className="bg-indigo-700 hover:bg-indigo-800 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
