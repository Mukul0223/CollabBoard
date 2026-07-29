import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginApi } from "../services/authService";
import { useAuthStore } from "../store/authStore";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    try {
      setLoading(true);
      const data = await loginApi(formData);

      // Debug log to check exact backend structure in browser console
      console.log("Login API Response:", data);

      // Safely extract token and user whether they are top-level or nested under `data`
      const user = data.user || data.data?.user;
      const token = data.token || data.accessToken || data.data?.token;

      if (!token) {
        setServerError("Authentication token missing from server response.");
        return;
      }

      setAuth(user, token);
      navigate("/dashboard");
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Invalid credentials. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Sign in to CollabBoard
        </h2>

        {serverError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={`w-full p-2.5 text-sm border rounded-md focus:outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-indigo-200"
              }`}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className={`w-full p-2.5 text-sm border rounded-md focus:outline-none focus:ring-2 ${
                errors.password
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-indigo-200"
              }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white p-2.5 rounded-md font-medium text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-indigo-600 hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
