import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  BookOpen,
  Users,
  Award,
  ShieldCheck,
} from "lucide-react";
import Navbar from "../Components/Navbar";
import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "../services/authService";

export default function Register() {
  const navigate = useNavigate();

  // =========================
  // Form State
  // =========================

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // =========================
  // UI State
  // =========================

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // Handle Input
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // =========================
  // Register
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Required fields

    if (
      !formData.username ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    // Password match

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Password length

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // Phone validation

    const phoneRegex = /^[6-9]\d{9}$/;

    if (!phoneRegex.test(formData.phone)) {
      setError(
        "Phone number must be 10 digits and start with 6, 7, 8, or 9."
      );
      return;
    }

    // Terms

    if (!agreed) {
      setError(
        "Please agree to the Terms & Conditions and Privacy Policy."
      );
      return;
    }

    try {
      setLoading(true);

      const registerData = {
        name: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      };

      console.log("Register data:", registerData);

      const response = await registerUser(registerData);

      console.log("Registration response:", response);

      setSuccess("Account created successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Registration failed:", error);

      setError(
        error.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-[calc(100vh-80px)] bg-stone-100/60 px-4 sm:px-6 lg:px-8 flex items-center justify-center py-4 lg:py-5">

        <div className="max-w-6xl w-full bg-white border border-stone-200/80 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">

          {/* =========================================
              LEFT COLUMN
          ========================================= */}

          <div
            className="hidden lg:flex lg:col-span-5 p-8 flex-col justify-center relative overflow-hidden bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80')",
            }}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-white/55"></div>

            <div className="relative z-10">

              <h2 className="text-3xl font-extrabold text-green-900 tracking-tight mb-2">
                Join Our Community
              </h2>

              <p className="text-sm text-stone-900 font-medium leading-relaxed mb-6 max-w-md">
                Create your account and start exploring books,
                events, stories and more.
              </p>

              {/* Features */}

              <div className="space-y-3">

                {/* Feature 1 */}
                <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm p-3 rounded-xl border border-stone-200/50 shadow-sm">

                  <div className="bg-[#1b3b2b] text-white p-2 rounded-lg shrink-0">
                    <BookOpen className="h-4 w-4" />
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 text-xs">
                      Discover Great Books
                    </h4>

                    <p className="text-[11px] text-stone-600">
                      Explore our collection of Malayalam books
                    </p>
                  </div>

                </div>

                {/* Feature 2 */}
                <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm p-3 rounded-xl border border-stone-200/50 shadow-sm">

                  <div className="bg-[#1b3b2b] text-white p-2 rounded-lg shrink-0">
                    <Users className="h-4 w-4" />
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 text-xs">
                      Join Our Community
                    </h4>

                    <p className="text-[11px] text-stone-600">
                      Connect with fellow readers and writers
                    </p>
                  </div>

                </div>

                {/* Feature 3 */}
                <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm p-3 rounded-xl border border-stone-200/50 shadow-sm">

                  <div className="bg-[#1b3b2b] text-white p-2 rounded-lg shrink-0">
                    <Award className="h-4 w-4" />
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 text-xs">
                      Attend Events
                    </h4>

                    <p className="text-[11px] text-stone-600">
                      Register for upcoming literary events
                    </p>
                  </div>

                </div>

                {/* Feature 4 */}
                <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm p-3 rounded-xl border border-stone-200/50 shadow-sm">

                  <div className="bg-[#1b3b2b] text-white p-2 rounded-lg shrink-0">
                    <ShieldCheck className="h-4 w-4" />
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 text-xs">
                      Safe & Secure
                    </h4>

                    <p className="text-[11px] text-stone-600">
                      Your account and data are protected
                    </p>
                  </div>

                </div>

              </div>
            </div>
          </div>

          {/* =========================================
              RIGHT COLUMN
          ========================================= */}

          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center">

            {/* Header */}

            <div className="mb-5">
              <h3 className="text-2xl font-extrabold text-gray-900">
                Create Your Account
              </h3>

              <p className="text-xs text-stone-500 font-medium mt-1">
                Fill in your details to get started
              </p>
            </div>

            {/* =========================================
                FORM
            ========================================= */}

            <form
              onSubmit={handleSubmit}
              className="space-y-3.5"
            >

              {/* Username + Email */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* Username */}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Username{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">

                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                      <User className="h-4 w-4" />
                    </span>

                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter username"
                      className="w-full bg-stone-50/75 border border-stone-200 rounded-lg py-2.5 pl-9 pr-3 text-xs text-gray-800 focus:outline-none focus:border-emerald-800"
                    />

                  </div>
                </div>

                {/* Email */}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Email Address{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">

                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                      <Mail className="h-4 w-4" />
                    </span>

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      className="w-full bg-stone-50/75 border border-stone-200 rounded-lg py-2.5 pl-9 pr-3 text-xs text-gray-800 focus:outline-none focus:border-emerald-800"
                    />

                  </div>
                </div>

              </div>

              {/* Phone + Password */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* Phone */}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Phone Number{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">

                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                      <Phone className="h-4 w-4" />
                    </span>

                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      maxLength={10}
                      inputMode="numeric"
                      className="w-full bg-stone-50/75 border border-stone-200 rounded-lg py-2.5 pl-9 pr-3 text-xs text-gray-800 focus:outline-none focus:border-emerald-800"
                    />

                  </div>
                </div>

                {/* Password */}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Password{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">

                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                      <Lock className="h-4 w-4" />
                    </span>

                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      className="w-full bg-stone-50/75 border border-stone-200 rounded-lg py-2.5 pl-9 pr-9 text-xs text-gray-800 focus:outline-none focus:border-emerald-800"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>

                  </div>
                </div>

              </div>

              {/* Confirm Password */}

              <div>

                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Confirm Password{" "}
                  <span className="text-red-500">*</span>
                </label>

                <div className="relative">

                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                    <Lock className="h-4 w-4" />
                  </span>

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="w-full bg-stone-50/75 border border-stone-200 rounded-lg py-2.5 pl-9 pr-9 text-xs text-gray-800 focus:outline-none focus:border-emerald-800"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>

                </div>

              </div>

              {/* Error */}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-3 py-2.5 rounded-lg">
                  {error}
                </div>
              )}

              {/* Success */}

              {success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium px-3 py-2.5 rounded-lg">
                  {success}
                </div>
              )}

              {/* Terms */}

              <div className="flex items-start gap-2 pt-1">

                <input
                  type="checkbox"
                  id="terms"
                  checked={agreed}
                  onChange={(e) =>
                    setAgreed(e.target.checked)
                  }
                  className="accent-[#1b3b2b] h-4 w-4 rounded cursor-pointer mt-0.5 shrink-0"
                />

                <label
                  htmlFor="terms"
                  className="text-[11px] text-stone-600 cursor-pointer leading-relaxed"
                >
                  I agree to the{" "}
                  <span className="text-emerald-900 font-bold hover:underline">
                    Terms & Conditions
                  </span>{" "}
                  and{" "}
                  <span className="text-emerald-900 font-bold hover:underline">
                    Privacy Policy
                  </span>
                </label>

              </div>

              {/* Submit */}

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-[#1b3b2b] hover:bg-emerald-950 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors text-sm ${
                  loading
                    ? "opacity-60 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                {loading
                  ? "Creating Account..."
                  : "Create Account"}
              </button>

              {/* Login */}

              <p className="text-center text-xs text-stone-500 pt-1 font-medium">
                Already have an account?{" "}
                <Link
                  className="text-emerald-900 font-bold hover:underline"
                  to="/login"
                >
                  Login
                </Link>
              </p>

            </form>
          </div>
        </div>
      </div>
    </>
  );
}