import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";

const getTokenExpiry = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    if (!payload.exp) return null;

    return payload.exp * 1000;
  } catch (error) {
    console.error("Failed to read token expiry:", error);
    return null;
  }
};

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const loginData = {
        email: email,
        password: password,
      };

      const result = await loginUser(loginData);

      console.log("Login successful:", result);

      // Store authentication data
      localStorage.setItem("token", result.token);
      localStorage.setItem("userId", result.userId);
      localStorage.setItem("fullName", result.fullName);
      localStorage.setItem("email", result.email);
      localStorage.setItem("role", result.role);

      // Store token expiry time
      const expiryTime = getTokenExpiry(result.token);

      if (expiryTime) {
        localStorage.setItem("tokenExpiry", expiryTime.toString());
      }

      // Navigate based on user role
      if (result.role === "Admin") {
        navigate("/admin");
      }else if(result.role === "Editor"){
        navigate('/admin/story')
      } 
      else {
        navigate("/");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100/60 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      {/* Back Home Link */}
      <div className="max-w-md w-full mb-4">
        <Link
          to="/"
          className="inline-flex items-center text-xs font-bold text-stone-500 hover:text-emerald-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back To Home
        </Link>
      </div>

      <div className="max-w-md w-full space-y-6">
        {/* Brand / Header */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 mb-1">
            മലയാളം പുസ്തകശാല
          </h2>
          <p className="text-xs font-bold text-emerald-900 tracking-wider uppercase">
            Malayalam Book Store
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-stone-200/80 rounded-3xl shadow-xl p-8 sm:p-10">
          <div className="mb-6 text-center">
            <h3 className="text-xl font-extrabold text-gray-900 mb-1">
              Welcome Back
            </h3>
            <p className="text-xs text-stone-500 font-medium">
              Login to continue your reading journey
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold"
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-stone-50/75 border border-stone-200 rounded-xl py-3 pl-10 pr-4 text-xs text-gray-800 focus:outline-none focus:border-emerald-800"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full bg-stone-50/75 border border-stone-200 rounded-xl py-3 pl-10 pr-10 text-xs text-gray-800 focus:outline-none focus:border-emerald-800"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  className="accent-[#1b3b2b] h-4 w-4 rounded cursor-pointer"
                />
                <label
                  className="text-stone-600 font-medium cursor-pointer"
                  htmlFor="rememberMe"
                >
                  Remember Me
                </label>
              </div>

              {/* <Link
                to="/forgot-password"
                className="text-emerald-900 font-bold hover:underline"
              >
                Forgot Password?
              </Link> */}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1b3b2b] hover:bg-emerald-950 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-colors cursor-pointer text-sm disabled:opacity-50 mt-2"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Register Link */}
          <div className="text-center text-xs text-stone-500 pt-6 font-medium border-t border-stone-100 mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-emerald-900 font-bold hover:underline"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
