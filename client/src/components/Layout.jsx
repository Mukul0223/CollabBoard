import { Outlet, Link } from "react-router-dom";

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navigation Header */}
      <header className="bg-indigo-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-xl font-bold tracking-tight">
              CollabBoard
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium opacity-90">
              Welcome, User
            </span>
            <button
              onClick={() => console.log("Logout clicked")}
              className="bg-indigo-700 hover:bg-indigo-800 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
