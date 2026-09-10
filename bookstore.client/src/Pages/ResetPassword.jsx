import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { resetPassword } from "../services/authService";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";
  const otp = location.state?.otp || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email || !otp) {
      setError(
        "Password reset information is missing. Please start the process again."
      );
      return;
    }

    if (!newPassword) {
      setError("Please enter your new password.");
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword({
        email,
        otp,
        newPassword,
      });

      setSuccess(
        result.message || "Password reset successfully."
      );

      setTimeout(() => {
        navigate("/login", {
          state: {
            email,
          },
        });
      }, 1500);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100/60 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">

      {/* Back Home */}
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

        {/* Card */}
        <div className="bg-white border border-stone-200/80 rounded-3xl shadow-xl p-8 sm:p-10">

          {/* Header */}
          <div className="mb-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                <Lock className="h-6 w-6 text-emerald-800" />
              </div>
            </div>

            <h3 className="text-xl font-extrabold text-gray-900 mb-1">
              Reset Password
            </h3>

            <p className="text-xs text-stone-500 font-medium">
              Enter your new password below.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div
              className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold"
              role="status"
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                New Password <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">
                  <Lock className="h-4 w-4" />
                </span>

                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="w-full bg-stone-50/75 border border-stone-200 rounded-xl py-3 pl-10 pr-11 text-xs text-gray-800 focus:outline-none focus:border-emerald-800"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword(!showNewPassword)
                  }
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-emerald-900 cursor-pointer"
                  tabIndex={-1}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Confirm Password <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">
                  <Lock className="h-4 w-4" />
                </span>

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="w-full bg-stone-50/75 border border-stone-200 rounded-xl py-3 pl-10 pr-11 text-xs text-gray-800 focus:outline-none focus:border-emerald-800"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-emerald-900 cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Reset Password */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1b3b2b] hover:bg-emerald-950 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-colors cursor-pointer text-sm disabled:opacity-50"
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>

          {/* Back to Login */}
          <div className="text-center text-xs text-stone-500 pt-6 font-medium border-t border-stone-100 mt-6">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-emerald-900 font-bold hover:underline"
            >
              Back to Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ResetPassword;