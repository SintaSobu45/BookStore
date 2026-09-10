import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { forgotPassword } from "../services/authService";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const result = await forgotPassword(trimmedEmail);

      setSuccess(
        result.message ||
          "Password reset OTP has been sent to your email."
      );

      // Keep email in route state.
      // OTP will NOT be stored in localStorage.
      setTimeout(() => {
        navigate("/verify-reset-otp", {
          state: {
            email: trimmedEmail,
          },
        });
      }, 1200);
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
            <h3 className="text-xl font-extrabold text-gray-900 mb-1">
              Forgot Password?
            </h3>

            <p className="text-xs text-stone-500 font-medium">
              Enter your email address and we'll send you a password reset OTP.
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
                  disabled={loading}
                />
              </div>
            </div>

            {/* Send OTP */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1b3b2b] hover:bg-emerald-950 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-colors cursor-pointer text-sm disabled:opacity-50"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
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

export default ForgotPassword;