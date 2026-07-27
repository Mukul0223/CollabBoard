import { Link } from "react-router-dom";

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Sign in to CollabBoard
        </h2>
        <div className="space-y-4">
          <p className="text-sm text-gray-500 text-center">
            [Login Form Placeholder]
          </p>
          <div className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-600 hover:underline">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
