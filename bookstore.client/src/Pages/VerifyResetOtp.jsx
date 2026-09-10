import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { verifyPasswordResetOtp } from "../services/authService";

function VerifyResetOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const trimmedOtp = otp.trim();

    if (!email) {
      setError("Email information is missing. Please request a new OTP.");
      return;
    }

    if (!trimmedOtp) {
      setError("Please enter the OTP.");
      return;
    }

    if (!/^\d{6}$/.test(trimmedOtp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const result = await verifyPasswordResetOtp({
        email,
        otp: trimmedOtp,
      });

      setSuccess(
        result.message || "OTP verified successfully."
      );

      setTimeout(() => {
        navigate("/reset-password", {
          state: {
            email,
            otp: trimmedOtp,
          },
        });
      }, 1000);
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
                <ShieldCheck className="h-6 w-6 text-emerald-800" />
              </div>
            </div>

            <h3 className="text-xl font-extrabold text-gray-900 mb-1">
              Verify OTP
            </h3>

            <p className="text-xs text-stone-500 font-medium">
              Enter the 6-digit OTP sent to your email address.
            </p>

            {email && (
              <p className="text-xs text-emerald-900 font-bold mt-2 break-all">
                {email}
              </p>
            )}
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

            {/* OTP */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Enter OTP <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                className="w-full bg-stone-50/75 border border-stone-200 rounded-xl py-3 px-4 text-center text-lg tracking-[0.4em] font-bold text-gray-800 focus:outline-none focus:border-emerald-800"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6);

                  setOtp(value);
                }}
                disabled={loading}
              />
            </div>

            {/* Verify OTP */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1b3b2b] hover:bg-emerald-950 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-colors cursor-pointer text-sm disabled:opacity-50"
            >
              {loading ? "Verifying OTP..." : "Verify OTP"}
            </button>
          </form>

          {/* Back to Forgot Password */}
          <div className="text-center text-xs text-stone-500 pt-6 font-medium border-t border-stone-100 mt-6">
            Didn't receive the OTP?{" "}
            <Link
              to="/forgot-password"
              className="text-emerald-900 font-bold hover:underline"
            >
              Try Again
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default VerifyResetOtp;