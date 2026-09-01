import React, { useEffect, useRef, useState } from "react";
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
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import Navbar from "../Components/Navbar";
import { Link, useNavigate } from "react-router-dom";

import {
  registerUser,
  verifyEmailOtp,
  resendOtp,
} from "../services/authService";

export default function Register() {
  const navigate = useNavigate();

  // =========================================================
  // FORM STATE
  // =========================================================

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // =========================================================
  // UI STATE
  // =========================================================

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // OTP STATE
  // =========================================================

  const [showOtpScreen, setShowOtpScreen] = useState(false);

  const [otp, setOtp] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [otpLoading, setOtpLoading] = useState(false);

  const [otpError, setOtpError] = useState("");

  const [otpSuccess, setOtpSuccess] = useState("");

  // 5 minute OTP countdown
  const [otpTimeLeft, setOtpTimeLeft] = useState(300);

  // Resend button countdown
  const [resendTimeLeft, setResendTimeLeft] = useState(0);

  const otpInputRefs = useRef([]);

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // =========================================================
  // OTP COUNTDOWN
  // =========================================================

  useEffect(() => {
    if (!showOtpScreen) {
      return;
    }

    if (otpTimeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setOtpTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showOtpScreen, otpTimeLeft]);

  // =========================================================
  // RESEND COUNTDOWN
  // =========================================================

  useEffect(() => {
    if (resendTimeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendTimeLeft]);

  // =========================================================
  // FORMAT OTP TIME
  // =========================================================

  const formatOtpTime = () => {
    const minutes = Math.floor(otpTimeLeft / 60);
    const seconds = otpTimeLeft % 60;

    return `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // =========================================================
  // REGISTER
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // ---------------------------------------------------------
    // REQUIRED FIELDS
    // ---------------------------------------------------------

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

    // ---------------------------------------------------------
    // PASSWORD MATCH
    // ---------------------------------------------------------

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // ---------------------------------------------------------
    // PASSWORD LENGTH
    // ---------------------------------------------------------

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // ---------------------------------------------------------
    // PHONE VALIDATION
    // ---------------------------------------------------------

    const phoneRegex = /^[6-9]\d{9}$/;

    if (!phoneRegex.test(formData.phone)) {
      setError(
        "Phone number must be 10 digits and start with 6, 7, 8, or 9."
      );
      return;
    }

    // ---------------------------------------------------------
    // TERMS
    // ---------------------------------------------------------

    if (!agreed) {
      setError(
        "Please agree to the Terms & Conditions and Privacy Policy."
      );
      return;
    }

    // ---------------------------------------------------------
    // REGISTER
    // ---------------------------------------------------------

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

      // -------------------------------------------------------
      // REGISTRATION SUCCESS
      // -------------------------------------------------------

      setSuccess(
        "Account created successfully. Please check your email for the OTP."
      );

      // Reset OTP
      setOtp([
        "",
        "",
        "",
        "",
        "",
        "",
      ]);

      // Start 5 minute OTP timer
      setOtpTimeLeft(300);

      // Enable resend after 30 seconds
      setResendTimeLeft(30);

      setOtpError("");
      setOtpSuccess("");

      // Show OTP screen
      setShowOtpScreen(true);

      // Focus first OTP box
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (error) {
      console.error("Registration failed:", error);

      setError(
        error.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // HANDLE OTP CHANGE
  // =========================================================

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, "");

    // ---------------------------------------------------------
    // EMPTY VALUE
    // ---------------------------------------------------------

    if (!numericValue) {
      setOtp((prev) => {
        const updated = [...prev];
        updated[index] = "";
        return updated;
      });

      return;
    }

    // ---------------------------------------------------------
    // TAKE LAST DIGIT
    // ---------------------------------------------------------

    const digit = numericValue.slice(-1);

    setOtp((prev) => {
      const updated = [...prev];
      updated[index] = digit;
      return updated;
    });

    setOtpError("");

    // ---------------------------------------------------------
    // MOVE TO NEXT INPUT
    // ---------------------------------------------------------

    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // =========================================================
  // HANDLE OTP KEY DOWN
  // =========================================================

  const handleOtpKeyDown = (e, index) => {
    // ---------------------------------------------------------
    // BACKSPACE
    // ---------------------------------------------------------

    if (e.key === "Backspace") {
      if (otp[index]) {
        setOtp((prev) => {
          const updated = [...prev];
          updated[index] = "";
          return updated;
        });

        return;
      }

      if (index > 0) {
        otpInputRefs.current[index - 1]?.focus();

        setOtp((prev) => {
          const updated = [...prev];
          updated[index - 1] = "";
          return updated;
        });
      }
    }

    // ---------------------------------------------------------
    // LEFT ARROW
    // ---------------------------------------------------------

    if (e.key === "ArrowLeft" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }

    // ---------------------------------------------------------
    // RIGHT ARROW
    // ---------------------------------------------------------

    if (e.key === "ArrowRight" && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // =========================================================
  // HANDLE OTP PASTE
  // =========================================================

  const handleOtpPaste = (e) => {
    e.preventDefault();

    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedData) {
      return;
    }

    const newOtp = [
      "",
      "",
      "",
      "",
      "",
      "",
    ];

    pastedData.split("").forEach((digit, index) => {
      newOtp[index] = digit;
    });

    setOtp(newOtp);
    setOtpError("");

    const nextIndex = Math.min(
      pastedData.length,
      5
    );

    otpInputRefs.current[nextIndex]?.focus();
  };

  // =========================================================
  // VERIFY OTP
  // =========================================================

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    setOtpError("");
    setOtpSuccess("");

    const enteredOtp = otp.join("");

    // ---------------------------------------------------------
    // CHECK OTP LENGTH
    // ---------------------------------------------------------

    if (enteredOtp.length !== 6) {
      setOtpError("Please enter the complete 6-digit OTP.");
      return;
    }

    // ---------------------------------------------------------
    // CHECK EXPIRY
    // ---------------------------------------------------------

    if (otpTimeLeft <= 0) {
      setOtpError(
        "This OTP has expired. Please request a new OTP."
      );
      return;
    }

    try {
      setOtpLoading(true);

      const verifyData = {
        email: formData.email,
        otp: enteredOtp,
      };

      console.log("OTP verification data:", {
        email: formData.email,
        otp: "******",
      });

      const response = await verifyEmailOtp(verifyData);

      console.log("OTP verification response:", response);

      // -------------------------------------------------------
      // SUCCESS
      // -------------------------------------------------------

      setOtpSuccess(
        "Email verified successfully! Redirecting to login..."
      );

      setOtpError("");

      // Redirect after short delay
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("OTP verification failed:", error);

      setOtpError(
        error.message ||
          "OTP verification failed. Please try again."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  // =========================================================
  // RESEND OTP
  // =========================================================

  const handleResendOtp = async () => {
    if (resendTimeLeft > 0) {
      return;
    }

    setOtpError("");
    setOtpSuccess("");

    try {
      setOtpLoading(true);

      const response = await resendOtp(formData.email);

      console.log("Resend OTP response:", response);

      // -------------------------------------------------------
      // RESET OTP
      // -------------------------------------------------------

      setOtp([
        "",
        "",
        "",
        "",
        "",
        "",
      ]);

      // New OTP gets 5 minutes
      setOtpTimeLeft(300);

      // Prevent immediate repeated requests
      setResendTimeLeft(30);

      setOtpSuccess(
        "A new OTP has been sent to your email."
      );

      // Focus first OTP box
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (error) {
      console.error("Resend OTP failed:", error);

      setOtpError(
        error.message ||
          "Failed to resend OTP. Please try again."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  // =========================================================
  // GO BACK TO REGISTER FORM
  // =========================================================

  const handleBackToRegister = () => {
    setShowOtpScreen(false);

    setOtp([
      "",
      "",
      "",
      "",
      "",
      "",
    ]);

    setOtpError("");
    setOtpSuccess("");
  };

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <>
      <Navbar />

      <div className="min-h-[calc(100vh-80px)] bg-stone-100/60 px-4 sm:px-6 lg:px-8 flex items-center justify-center py-4 lg:py-5">

        <div className="max-w-6xl w-full bg-white border border-stone-200/80 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">

          {/* =====================================================
              LEFT COLUMN
          ===================================================== */}

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

              {/* =================================================
                  FEATURE 1
              ================================================= */}

              <div className="space-y-3">

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

                {/* =================================================
                    FEATURE 2
                ================================================= */}

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

                {/* =================================================
                    FEATURE 3
                ================================================= */}

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

                {/* =================================================
                    FEATURE 4
                ================================================= */}

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

          {/* =====================================================
              RIGHT COLUMN
          ===================================================== */}

          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center">

            {/* =================================================
                OTP SCREEN
            ================================================= */}

            {showOtpScreen ? (

              <div>

                {/* Back */}

                <button
                  type="button"
                  onClick={handleBackToRegister}
                  disabled={otpLoading}
                  className="flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-emerald-900 transition-colors mb-5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="h-4 w-4" />

                  Back to registration
                </button>

                {/* Header */}

                <div className="mb-6">

                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                    <Mail className="h-6 w-6 text-emerald-900" />
                  </div>

                  <h3 className="text-2xl font-extrabold text-gray-900">
                    Verify Your Email
                  </h3>

                  <p className="text-xs text-stone-500 font-medium mt-2 leading-relaxed">
                    We have sent a 6-digit verification code
                    to
                    <br />

                    <span className="font-bold text-emerald-900">
                      {formData.email}
                    </span>
                  </p>

                </div>

                {/* =================================================
                    OTP FORM
                ================================================= */}

                <form
                  onSubmit={handleVerifyOtp}
                  className="space-y-5"
                >

                  {/* OTP INPUTS */}

                  <div>

                    <label className="block text-xs font-bold text-gray-700 mb-3">
                      Enter OTP
                    </label>

                    <div className="flex gap-2 sm:gap-3">

                      {otp.map((digit, index) => (

                        <input
                          key={index}
                          ref={(element) => {
                            otpInputRefs.current[index] =
                              element;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) =>
                            handleOtpChange(
                              index,
                              e.target.value
                            )
                          }
                          onKeyDown={(e) =>
                            handleOtpKeyDown(
                              e,
                              index
                            )
                          }
                          onPaste={handleOtpPaste}
                          autoComplete={
                            index === 0
                              ? "one-time-code"
                              : "off"
                          }
                          className="
                            w-full
                            h-12
                            sm:h-14
                            text-center
                            text-lg
                            sm:text-xl
                            font-extrabold
                            text-gray-900
                            bg-stone-50
                            border
                            border-stone-200
                            rounded-xl
                            outline-none
                            transition
                            focus:bg-white
                            focus:border-emerald-900
                            focus:ring-2
                            focus:ring-emerald-900/10
                          "
                        />

                      ))}

                    </div>

                  </div>

                  {/* TIMER */}

                  <div className="flex items-center justify-between">

                    <div className="text-xs font-medium">

                      {otpTimeLeft > 0 ? (

                        <span className="text-stone-500">
                          OTP expires in{" "}

                          <span className="font-bold text-emerald-900">
                            {formatOtpTime()}
                          </span>
                        </span>

                      ) : (

                        <span className="text-red-600 font-bold">
                          OTP expired
                        </span>

                      )}

                    </div>

                    {/* RESEND */}

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={
                        otpLoading ||
                        resendTimeLeft > 0
                      }
                      className="
                        flex
                        items-center
                        gap-1.5
                        text-xs
                        font-bold
                        text-emerald-900
                        hover:text-emerald-950
                        disabled:text-stone-400
                        disabled:cursor-not-allowed
                        cursor-pointer
                        transition-colors
                      "
                    >

                      <RefreshCw
                        className={`h-3.5 w-3.5 ${
                          otpLoading
                            ? "animate-spin"
                            : ""
                        }`}
                      />

                      {resendTimeLeft > 0
                        ? `Resend in ${resendTimeLeft}s`
                        : "Resend OTP"}

                    </button>

                  </div>

                  {/* ERROR */}

                  {otpError && (

                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-3 py-2.5 rounded-lg">
                      {otpError}
                    </div>

                  )}

                  {/* SUCCESS */}

                  {otpSuccess && (

                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium px-3 py-2.5 rounded-lg">
                      {otpSuccess}
                    </div>

                  )}

                  {/* VERIFY BUTTON */}

                  <button
                    type="submit"
                    disabled={
                      otpLoading ||
                      otpTimeLeft <= 0
                    }
                    className={`
                      w-full
                      bg-[#1b3b2b]
                      hover:bg-emerald-950
                      disabled:bg-stone-300
                      text-white
                      font-bold
                      py-3
                      px-6
                      rounded-lg
                      shadow-md
                      transition-colors
                      text-sm
                      ${
                        otpLoading ||
                        otpTimeLeft <= 0
                          ? "cursor-not-allowed"
                          : "cursor-pointer"
                      }
                    `}
                  >

                    {otpLoading
                      ? "Verifying..."
                      : "Verify Email"}

                  </button>

                  {/* LOGIN */}

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

            ) : (

              /* =================================================
                 REGISTRATION SCREEN
              ================================================= */

              <>

                {/* Header */}

                <div className="mb-5">

                  <h3 className="text-2xl font-extrabold text-gray-900">
                    Create Your Account
                  </h3>

                  <p className="text-xs text-stone-500 font-medium mt-1">
                    Fill in your details to get started
                  </p>

                </div>

                {/* =================================================
                    FORM
                ================================================= */}

                <form
                  onSubmit={handleSubmit}
                  className="space-y-3.5"
                >

                  {/* =================================================
                      USERNAME + EMAIL
                  ================================================= */}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    {/* USERNAME */}

                    <div>

                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Username{" "}
                        <span className="text-red-500">
                          *
                        </span>
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

                    {/* EMAIL */}

                    <div>

                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Email Address{" "}
                        <span className="text-red-500">
                          *
                        </span>
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

                  {/* =================================================
                      PHONE + PASSWORD
                  ================================================= */}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    {/* PHONE */}

                    <div>

                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Phone Number{" "}
                        <span className="text-red-500">
                          *
                        </span>
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

                    {/* PASSWORD */}

                    <div>

                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Password{" "}
                        <span className="text-red-500">
                          *
                        </span>
                      </label>

                      <div className="relative">

                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                          <Lock className="h-4 w-4" />
                        </span>

                        <input
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Create a password"
                          className="w-full bg-stone-50/75 border border-stone-200 rounded-lg py-2.5 pl-9 pr-9 text-xs text-gray-800 focus:outline-none focus:border-emerald-800"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(
                              !showPassword
                            )
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

                  {/* =================================================
                      CONFIRM PASSWORD
                  ================================================= */}

                  <div>

                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Confirm Password{" "}
                      <span className="text-red-500">
                        *
                      </span>
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

                  {/* =================================================
                      ERROR
                  ================================================= */}

                  {error && (

                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-3 py-2.5 rounded-lg">
                      {error}
                    </div>

                  )}

                  {/* =================================================
                      SUCCESS
                  ================================================= */}

                  {success && (

                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium px-3 py-2.5 rounded-lg">
                      {success}
                    </div>

                  )}

                  {/* =================================================
                      TERMS
                  ================================================= */}

                  <div className="flex items-start gap-2 pt-1">

                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreed}
                      onChange={(e) =>
                        setAgreed(
                          e.target.checked
                        )
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

                  {/* =================================================
                      SUBMIT
                  ================================================= */}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`
                      w-full
                      bg-[#1b3b2b]
                      hover:bg-emerald-950
                      text-white
                      font-bold
                      py-3
                      px-6
                      rounded-lg
                      shadow-md
                      transition-colors
                      text-sm
                      ${
                        loading
                          ? "opacity-60 cursor-not-allowed"
                          : "cursor-pointer"
                      }
                    `}
                  >

                    {loading
                      ? "Creating Account..."
                      : "Create Account"}

                  </button>

                  {/* =================================================
                      LOGIN
                  ================================================= */}

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

              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
}