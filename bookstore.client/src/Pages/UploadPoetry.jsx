import React, { useState } from "react";
import {
  Home,
  ChevronRight,
  Leaf,
  BookOpen,
  Sparkles,
  Save,
  ArrowRight,
  Lock,
  User,
  MapPin,
  Mail,
  Phone,
  Loader2,
  CheckCircle,
} from "lucide-react";

import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

import { Link, useNavigate } from "react-router-dom";

import { addStoryPoetry } from "../services/storyPoetryService";

import {
  createStoryPoetryPayment,
  verifyStoryPoetryPayment,
} from "../services/paymentService";

export default function UploadPoetry() {
  const navigate = useNavigate();

  // =========================================================
  // AUTH
  // =========================================================

  const [isLoggedIn] = useState(!!localStorage.getItem("token"));

  // =========================================================
  // FORM STATES
  // =========================================================

  const [contentType, setContentType] = useState("Poetry");

  const [title, setTitle] = useState("");

  const [content, setContent] = useState("");

  // =========================================================
  // CONTRIBUTOR DETAILS
  // =========================================================

  const [contributorNameMalayalam, setContributorNameMalayalam] = useState("");

  const [contributorAddressMalayalam, setContributorAddressMalayalam] =
    useState("");

  const [contributorDistrictMalayalam, setContributorDistrictMalayalam] =
    useState("");

  const [contributorCityMalayalam, setContributorCityMalayalam] = useState("");

  const [contributorEmail, setContributorEmail] = useState("");

  const [contributorPhone, setContributorPhone] = useState("");

  // =========================================================
  // PROFILE IMAGE
  // =========================================================

  const [contributorProfileImage, setContributorProfileImage] = useState(null);

  const [profileImagePreview, setProfileImagePreview] = useState("");

  // =========================================================
  // UI STATES
  // =========================================================

  const [loading, setLoading] = useState(false);

  const [paymentLoading, setPaymentLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // =========================================================
  // PAYMENT SUCCESS
  // =========================================================

  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // =========================================================
  // CONTENT LIMITS
  // =========================================================

  const MAX_CONTENT_LINES = 30;

  const contentLineCount = content ? content.split(/\r?\n/).length : 0;

  const isContentOverLimit = contentLineCount > MAX_CONTENT_LINES;

  // =========================================================
  // WORD COUNT
  // =========================================================

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  // =========================================================
  // HANDLE TITLE
  // =========================================================

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  // =========================================================
  // HANDLE CONTENT
  // =========================================================

  const handleContentChange = (e) => {
    const value = e.target.value;

    setContent(value);
  };

  // =========================================================
  // HANDLE IMAGE
  // =========================================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");

    // -------------------------------------------------------
    // FILE TYPE
    // -------------------------------------------------------

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");

      e.target.value = "";

      return;
    }

    // -------------------------------------------------------
    // FILE SIZE
    // -------------------------------------------------------

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile image must be less than 5 MB.");

      e.target.value = "";

      return;
    }

    // -------------------------------------------------------
    // SET IMAGE
    // -------------------------------------------------------

    setContributorProfileImage(file);

    setProfileImagePreview(URL.createObjectURL(file));
  };

  // =========================================================
  // OPEN RAZORPAY
  // =========================================================

  const openRazorpayCheckout = async (paymentData) => {
    return new Promise((resolve, reject) => {
      // -------------------------------------------------------
      // CHECK RAZORPAY SCRIPT
      // -------------------------------------------------------

      if (!window.Razorpay) {
        reject(
          new Error(
            "Razorpay Checkout is not loaded. Please refresh the page and try again.",
          ),
        );

        return;
      }

      // -------------------------------------------------------
      // RAZORPAY KEY
      // -------------------------------------------------------

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!razorpayKey) {
        reject(new Error("Razorpay Key ID is not configured."));

        return;
      }

      // -------------------------------------------------------
      // PAYMENT DATA
      // -------------------------------------------------------

      const payment = paymentData?.data || paymentData;

      if (!payment) {
        reject(new Error("Invalid payment response from server."));

        return;
      }

      const razorpayOrderId =
        payment.razorpayOrderId || payment.RazorpayOrderId;

      const amount = payment.amount || payment.Amount;

      const paymentId = payment.paymentId || payment.PaymentId;

      if (!razorpayOrderId) {
        reject(new Error("Razorpay Order ID was not received."));

        return;
      }

      if (!amount) {
        reject(new Error("Payment amount was not received."));

        return;
      }

      if (!paymentId) {
        reject(new Error("Payment ID was not received."));

        return;
      }

      // -------------------------------------------------------
      // RAZORPAY OPTIONS
      // -------------------------------------------------------

      const options = {
        key: razorpayKey,

        amount: Math.round(Number(amount) * 100),

        currency: "INR",

        name: "BookStore",

        description: `${contentType} Submission Payment`,

        order_id: razorpayOrderId,

        handler: async function (response) {
          try {
            setPaymentLoading(true);

            setError("");

            // -------------------------------------------------
            // VERIFY PAYMENT
            // -------------------------------------------------

            const verificationResponse = await verifyStoryPoetryPayment({
              paymentId: paymentId,

              razorpayOrderId: response.razorpay_order_id,

              razorpayPaymentId: response.razorpay_payment_id,

              razorpaySignature: response.razorpay_signature,
            });

            console.log("Story/Poetry payment verified:", verificationResponse);

            // -------------------------------------------------
            // PAYMENT SUCCESS
            // -------------------------------------------------

            setPaymentCompleted(true);
            resolve(verificationResponse);
          } catch (error) {
            console.error("Story/Poetry payment verification failed:", error);

            setError(error.message || "Payment verification failed.");

            reject(error);
          } finally {
            setPaymentLoading(false);
          }
        },

        // -----------------------------------------------------
        // PREFILL
        // -----------------------------------------------------

        prefill: {
          name: contributorNameMalayalam,

          email: contributorEmail,

          contact: contributorPhone,
        },

        // -----------------------------------------------------
        // THEME
        // -----------------------------------------------------

        theme: {
          color: "#1b3b2b",
        },

        // -----------------------------------------------------
        // MODAL
        // -----------------------------------------------------

        modal: {
          ondismiss: function () {
            setPaymentLoading(false);

            setError(
              "Payment was cancelled. Your submission is saved, but payment is still pending.",
            );

            resolve(null);
          },
        },
      };

      // -------------------------------------------------------
      // CREATE RAZORPAY INSTANCE
      // -------------------------------------------------------

      const razorpay = new window.Razorpay(options);

      // -------------------------------------------------------
      // PAYMENT FAILED
      // -------------------------------------------------------

      razorpay.on("payment.failed", function (response) {
        console.error("Razorpay payment failed:", response);

        const description = response?.error?.description;

        setPaymentLoading(false);

        setError(description || "Payment failed. Please try again.");

        reject(new Error(description || "Payment failed."));
      });

      // -------------------------------------------------------
      // OPEN CHECKOUT
      // -------------------------------------------------------

      razorpay.open();
    });
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async () => {
    setError("");

    setSuccess("");

    setPaymentCompleted(false);

    // =======================================================
    // LOGIN
    // =======================================================

    if (!isLoggedIn) {
      setError("Please login to submit your contribution.");

      return;
    }

    // =======================================================
    // TITLE
    // =======================================================

    if (!title.trim()) {
      setError("Please enter a title.");

      return;
    }

    // =======================================================
    // CONTENT
    // =======================================================

    if (!content.trim()) {
      setError("Please write your content.");

      return;
    }

    // =======================================================
    // LINE LIMIT
    // =======================================================

    if (isContentOverLimit) {
      setError("Maximum 30 lines are allowed.");

      return;
    }

    // =======================================================
    // CONTRIBUTOR NAME
    // =======================================================

    if (!contributorNameMalayalam.trim()) {
      setError("Please enter contributor name.");

      return;
    }

    // =======================================================
    // ADDRESS
    // =======================================================

    if (!contributorAddressMalayalam.trim()) {
      setError("Please enter contributor address.");

      return;
    }

    // =======================================================
    // DISTRICT
    // =======================================================

    if (!contributorDistrictMalayalam.trim()) {
      setError("Please enter contributor district.");

      return;
    }

    // =======================================================
    // CITY
    // =======================================================

    if (!contributorCityMalayalam.trim()) {
      setError("Please enter contributor city.");

      return;
    }

    // =======================================================
    // EMAIL
    // =======================================================

    if (!contributorEmail.trim()) {
      setError("Please enter contributor email.");

      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(contributorEmail.trim())) {
      setError("Please enter a valid email address.");

      return;
    }

    // =======================================================
    // PHONE
    // =======================================================

    const phoneRegex = /^[6-9]\d{9}$/;

    if (!phoneRegex.test(contributorPhone)) {
      setError("Phone number must be 10 digits and start with 6, 7, 8, or 9.");

      return;
    }

    // =======================================================
    // PROFILE IMAGE
    // =======================================================

    if (!contributorProfileImage) {
      setError("Please upload your profile image.");

      return;
    }

    // =======================================================
    // SUBMIT STORY / POETRY
    // =======================================================

    try {
      setLoading(true);

      // -----------------------------------------------------
      // FORM DATA
      // -----------------------------------------------------

      const storyPoetryData = {
        title: title.trim(),

        type: contentType,

        content: content.trim(),

        contributorNameMalayalam: contributorNameMalayalam.trim(),

        contributorAddressMalayalam: contributorAddressMalayalam.trim(),

        contributorDistrictMalayalam: contributorDistrictMalayalam.trim(),

        contributorCityMalayalam: contributorCityMalayalam.trim(),

        contributorEmail: contributorEmail.trim(),

        contributorPhone: contributorPhone,

        contributorProfileImage: contributorProfileImage,
      };

      console.log("Submitting Story/Poetry:", storyPoetryData);

      // -----------------------------------------------------
      // 1. CREATE STORY / POETRY
      // -----------------------------------------------------

      const submissionResponse = await addStoryPoetry(storyPoetryData);

      console.log("Story/Poetry submission response:", submissionResponse);

      // -----------------------------------------------------
      // GET CREATED STORYPOETRY ID
      // -----------------------------------------------------

      const submission = submissionResponse?.data || submissionResponse;

      const storyPoetryId =
        submission?.storyPoetryId || submission?.StoryPoetryId;

      if (!storyPoetryId) {
        throw new Error(
          "Story/Poetry was submitted, but submission ID was not received.",
        );
      }

      console.log("Created StoryPoetryId:", storyPoetryId);

      // -----------------------------------------------------
      // STORY CREATED
      // PAYMENT NOW REQUIRED
      // -----------------------------------------------------

      setSuccess(`${contentType} submitted successfully. Opening payment...`);

      // -----------------------------------------------------
      // 2. CREATE RAZORPAY ORDER
      // -----------------------------------------------------

      setPaymentLoading(true);

      const paymentResponse = await createStoryPoetryPayment(storyPoetryId);

      console.log("Story/Poetry payment order:", paymentResponse);

      // -----------------------------------------------------
      // STOP SUBMISSION LOADING
      // -----------------------------------------------------

      setLoading(false);

      // -----------------------------------------------------
      // 3. OPEN RAZORPAY CHECKOUT
      // -----------------------------------------------------

      const verificationResult = await openRazorpayCheckout(paymentResponse);

      console.log(
        "Final Story/Poetry payment verification:",
        verificationResult,
      );

      // -----------------------------------------------------
      // PAYMENT VERIFIED SUCCESSFULLY
      // -----------------------------------------------------

      if (verificationResult) {
        const contributionName =
          contentType === "Poetry"
            ? "Poetry"
            : contentType === "Story"
              ? "Story"
              : "Special contribution";

        localStorage.setItem(
          "storyPoetrySuccessMessage",
          `${contributionName} submitted successfully!`,
        );

        navigate("/");
      }
    } catch (error) {
      console.error("Story/Poetry submission/payment failed:", error);

      setError(error.message || "Failed to submit Story/Poetry.");

      setLoading(false);

      setPaymentLoading(false);
    }
  };

  // =========================================================
  // SAVE DRAFT
  // =========================================================

  const handleSaveDraft = () => {
    if (!isLoggedIn) {
      setError("Please login to save a draft.");

      return;
    }

    const draft = {
      title,

      type: contentType,

      content,

      contributorNameMalayalam,

      contributorAddressMalayalam,

      contributorDistrictMalayalam,

      contributorCityMalayalam,

      contributorEmail,

      contributorPhone,
    };

    localStorage.setItem("storyPoetryDraft", JSON.stringify(draft));

    setSuccess("Draft saved successfully.");
  };

  // =========================================================
  // LOGIN / REGISTER
  // =========================================================

  const handleLogin = () => {
    navigate("/register");
  };

  // =========================================================
  // TYPE OPTIONS
  // =========================================================

  const typeOptions = [
    {
      value: "Poetry",

      title: "Poetry",

      description: "Poems, verses, and creative expressions",

      icon: Leaf,
    },

    {
      value: "Story",

      title: "Story",

      description: "Short stories, articles, and write-ups",

      icon: BookOpen,
    },

    {
      value: "Special",

      title: "Special",

      description: "Special contributions and featured content",

      icon: Sparkles,
    },
  ];

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <>
      <Navbar />

      {/* =====================================================
          PAGE
      ===================================================== */}

      <div className="min-h-screen bg-stone-50/60 pb-16">
        {/* ===================================================
            HERO
        =================================================== */}

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
          <div className="bg-[#1b3b2b] border border-emerald-100/80 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-sm">
            <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-xl z-10 mb-6 md:mb-0">
              {/* Breadcrumb */}

              <div className="flex items-center space-x-2 text-xs sm:text-sm text-emerald-200/80 font-medium mb-3">
                <Link
                  to="/"
                  className="hover:text-white flex items-center transition-colors"
                >
                  <Home className="h-4 w-4 mr-1" />
                  Home
                </Link>

                <ChevronRight className="h-3.5 w-3.5 text-stone-400" />

                <span className="text-white font-semibold">
                  Upload Poetry / Story
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
                Share Your Creativity
              </h1>

              <p className="text-white text-xs sm:text-base leading-relaxed max-w-md font-medium">
                Submit your original poetry, stories, and special contributions
                to our community.
              </p>
            </div>

            {/* Hero image */}

            <div className="relative z-10 w-full md:w-[36%] flex justify-center">
              <div className="relative group w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-[#1b3b2b] rounded-2xl blur opacity-15" />

                <img
                  src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80"
                  alt="Writing poetry and stories"
                  className="relative rounded-xl sm:rounded-2xl object-cover w-full h-[120px] sm:h-[160px] md:h-[190px] shadow-md border border-white/80"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            MAIN
        =================================================== */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* =================================================
              MESSAGES
          ================================================= */}

          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-semibold flex items-center gap-2">
              {paymentCompleted && <CheckCircle className="w-5 h-5" />}

              <span>{success}</span>
            </div>
          )}

          {/* =================================================
              PAYMENT PROCESSING
          ================================================= */}

          {paymentLoading && (
            <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-semibold flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />

              <span>
                Processing payment. Please complete the Razorpay checkout...
              </span>
            </div>
          )}

          {/* =================================================
              FORM WRAPPER
          ================================================= */}

          <div className="relative">
            {/* =================================================
                FORM
            ================================================= */}

            <div
              className={
                !isLoggedIn ? "blur-[1px] pointer-events-none select-none" : ""
              }
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* =================================================
                    COLUMN 1
                    TYPE
                ================================================= */}

                <div className="lg:col-span-3 bg-white border border-stone-200/80 rounded-3xl p-5 shadow-sm">
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-900 text-sm">
                      1. Choose Type
                    </h3>

                    <p className="text-[11px] text-stone-500">
                      Select your submission type
                    </p>
                  </div>

                  <div className="space-y-3">
                    {typeOptions.map((option) => {
                      const Icon = option.icon;

                      const selected = contentType === option.value;

                      return (
                        <div
                          key={option.value}
                          onClick={() => setContentType(option.value)}
                          className={`border-2 rounded-2xl p-3.5 cursor-pointer transition-all ${
                            selected
                              ? "border-[#1b3b2b] bg-emerald-50/30"
                              : "border-stone-200 hover:border-stone-300"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div
                                className={`p-2 rounded-xl ${
                                  selected
                                    ? "bg-[#1b3b2b] text-white"
                                    : "bg-emerald-100 text-emerald-900"
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                              </div>

                              <div>
                                <h4 className="font-bold text-gray-900 text-xs">
                                  {option.title}
                                </h4>

                                <p className="text-[10px] text-stone-500 mt-0.5 leading-relaxed">
                                  {option.description}
                                </p>
                              </div>
                            </div>

                            <input
                              type="radio"
                              name="contentType"
                              checked={selected}
                              onChange={() => setContentType(option.value)}
                              className="accent-[#1b3b2b] mt-1"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 bg-stone-50 rounded-2xl p-4 border border-stone-200">
                    <p className="text-[10px] text-stone-500 leading-relaxed">
                      Your submission will be reviewed by our administrators
                      before it is published.
                    </p>
                  </div>
                </div>

                {/* =================================================
                    COLUMN 2
                    CONTRIBUTOR
                ================================================= */}

                <div className="lg:col-span-4 bg-white border border-stone-200/80 rounded-3xl p-5 shadow-sm">
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-900 text-sm">
                      2. Contributor Details
                    </h3>

                    <p className="text-[11px] text-stone-500">
                      Enter your personal information in (malayalam)
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    {/* NAME */}

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                        പേര്
                        <span className="text-red-500"> *</span>
                      </label>

                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />

                        <input
                          type="text"
                          value={contributorNameMalayalam}
                          onChange={(e) =>
                            setContributorNameMalayalam(e.target.value)
                          }
                          placeholder="Enter your name"
                          maxLength={200}
                          className="w-full bg-stone-50/75 border border-stone-200 rounded-xl py-2.5 pl-9 pr-3 text-xs text-gray-800 focus:outline-none focus:border-emerald-800"
                        />
                      </div>
                    </div>

                    {/* ADDRESS */}

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                        വിലാസം
                        <span className="text-red-500"> *</span>
                      </label>

                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-stone-400" />

                        <textarea
                          value={contributorAddressMalayalam}
                          onChange={(e) =>
                            setContributorAddressMalayalam(e.target.value)
                          }
                          placeholder="Enter your address"
                          maxLength={500}
                          rows="2"
                          className="w-full bg-stone-50/75 h-32 border border-stone-200 rounded-xl py-2.5 pl-9 pr-3 text-xs text-gray-800 focus:outline-none focus:border-emerald-800 resize-none"
                        />
                      </div>
                    </div>

                    {/* DISTRICT + CITY */}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                          ജില്ല
                          <span className="text-red-500"> *</span>
                        </label>

                        <input
                          type="text"
                          value={contributorDistrictMalayalam}
                          onChange={(e) =>
                            setContributorDistrictMalayalam(e.target.value)
                          }
                          placeholder="District"
                          maxLength={100}
                          className="w-full bg-stone-50/75 border border-stone-200 rounded-xl py-2.5 px-3 text-xs text-gray-800 focus:outline-none focus:border-emerald-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                          നഗരം
                          <span className="text-red-500"> *</span>
                        </label>

                        <input
                          type="text"
                          value={contributorCityMalayalam}
                          onChange={(e) =>
                            setContributorCityMalayalam(e.target.value)
                          }
                          placeholder="City"
                          maxLength={100}
                          className="w-full bg-stone-50/75 border border-stone-200 rounded-xl py-2.5 px-3 text-xs text-gray-800 focus:outline-none focus:border-emerald-800"
                        />
                      </div>
                    </div>

                    {/* EMAIL */}

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                        Email
                        <span className="text-red-500"> *</span>
                      </label>

                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />

                        <input
                          type="email"
                          value={contributorEmail}
                          onChange={(e) => setContributorEmail(e.target.value)}
                          placeholder="Enter your email"
                          maxLength={150}
                          className="w-full bg-stone-50/75 border border-stone-200 rounded-xl py-2.5 pl-9 pr-3 text-xs text-gray-800 focus:outline-none focus:border-emerald-800"
                        />
                      </div>
                    </div>

                    {/* PHONE */}

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                        Phone Number
                        <span className="text-red-500"> *</span>
                      </label>

                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />

                        <input
                          type="text"
                          value={contributorPhone}
                          onChange={(e) =>
                            setContributorPhone(
                              e.target.value.replace(/\D/g, "").slice(0, 10),
                            )
                          }
                          placeholder="10 digit phone number"
                          maxLength={10}
                          className="w-full bg-stone-50/75 border border-stone-200 rounded-xl py-2.5 pl-9 pr-3 text-xs text-gray-800 focus:outline-none focus:border-emerald-800"
                        />
                      </div>
                    </div>

                    {/* PROFILE IMAGE */}

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                        പ്രൊഫൈൽ ചിത്രം
                        <span className="text-red-500"> *</span>
                      </label>

                      <div className="flex items-center gap-3">
                        {profileImagePreview && (
                          <img
                            src={profileImagePreview}
                            alt="Profile preview"
                            className="w-12 h-12 rounded-xl object-cover border border-stone-200"
                          />
                        )}

                        <label className="flex-1 cursor-pointer">
                          <div className="border border-dashed border-stone-300 rounded-xl px-3 py-2.5 hover:bg-stone-50 transition-colors">
                            <p className="text-[10px] font-semibold text-gray-700 truncate">
                              {contributorProfileImage
                                ? contributorProfileImage.name
                                : "Choose profile image"}
                            </p>

                            <p className="text-[9px] text-stone-400 mt-0.5">
                              JPG, PNG • Max 5 MB
                            </p>
                          </div>

                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    COLUMN 3
                    CONTENT
                ================================================= */}

                <div className="lg:col-span-5 bg-white border border-stone-200/80 rounded-3xl p-5 shadow-sm flex flex-col">
                  <div className="flex-1">
                    <div className="mb-4">
                      <h3 className="font-bold text-gray-900 text-sm">
                        3. Write Your {contentType}
                      </h3>

                      <p className="text-[11px] text-stone-500">
                        Write your title and original content in Malayalam.
                      </p>
                    </div>

                    {/* TITLE */}

                    <div className="mb-4">
                      <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                        Title (മലയാളം)
                        <span className="text-red-500"> *</span>
                      </label>

                      <input
                        type="text"
                        placeholder={`മലയാളത്തിൽ ${
                          contentType === "Poetry"
                            ? "കവിതയുടെ"
                            : contentType === "Story"
                              ? "കഥയുടെ"
                              : "രചനയുടെ"
                        } പേര് നൽകുക`}
                        value={title}
                        onChange={handleTitleChange}
                        maxLength={200}
                        lang="ml"
                        className="w-full bg-stone-50/75 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-emerald-800"
                      />

                      <p className="text-[9px] text-stone-400 mt-1">
                        {title.length}/200 characters
                      </p>
                    </div>

                    {/* CONTENT */}

                    <div
                      className={`border rounded-2xl overflow-hidden bg-stone-50/30 transition-colors ${
                        isContentOverLimit
                          ? "border-red-400"
                          : "border-stone-200"
                      }`}
                    >
                      <textarea
                        rows="14"
                        placeholder={
                          contentType === "Poetry"
                            ? "മലയാളത്തിൽ നിങ്ങളുടെ കവിത ഇവിടെ എഴുതുക..."
                            : contentType === "Story"
                              ? "മലയാളത്തിൽ നിങ്ങളുടെ കഥ ഇവിടെ എഴുതുക..."
                              : "മലയാളത്തിൽ നിങ്ങളുടെ രചന ഇവിടെ എഴുതുക..."
                        }
                        value={content}
                        onChange={handleContentChange}
                        lang="ml"
                        spellCheck={false}
                        className="w-full p-4 bg-transparent text-sm text-gray-800 focus:outline-none resize-none leading-relaxed"
                      />

                      <div
                        className={`border-t px-4 py-2 text-[10px] font-medium flex items-center justify-between ${
                          isContentOverLimit
                            ? "bg-red-50 border-red-200 text-red-600"
                            : "bg-stone-50 border-stone-200 text-stone-500"
                        }`}
                      >
                        <span>Words: {wordCount}</span>

                        <span>
                          Lines: {contentLineCount}/{MAX_CONTENT_LINES}
                        </span>
                      </div>
                    </div>

                    {/* LINE WARNING */}

                    {isContentOverLimit && (
                      <div className="mt-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                        <p className="text-[10px] font-semibold text-red-600">
                          ⚠️ Maximum 30 lines allowed.
                        </p>

                        <p className="text-[9px] text-red-500 mt-0.5">
                          Please remove {contentLineCount - MAX_CONTENT_LINES}{" "}
                          {contentLineCount - MAX_CONTENT_LINES === 1
                            ? "line"
                            : "lines"}{" "}
                          before submitting.
                        </p>
                      </div>
                    )}

                    {/* 30 LINE MESSAGE */}

                    {!isContentOverLimit &&
                      contentLineCount === MAX_CONTENT_LINES && (
                        <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                          <p className="text-[10px] font-semibold text-amber-700">
                            ⚠️ You have reached the maximum of 30 lines.
                          </p>

                          <p className="text-[9px] text-amber-600 mt-0.5">
                            You cannot add more lines.
                          </p>
                        </div>
                      )}
                  </div>

                  {/* ACTIONS */}

                  <div className="flex items-center space-x-3 pt-4">
                    {/* SAVE DRAFT */}

                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      disabled={loading || paymentLoading}
                      className="flex-1 bg-white border border-stone-300 hover:bg-stone-50 text-gray-800 font-bold py-3 px-4 rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="h-4 w-4 text-stone-600" />

                      <span>Save Draft</span>
                    </button>

                    {/* SUBMIT + PAYMENT */}

                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={
                        loading ||
                        paymentLoading ||
                        isContentOverLimit ||
                        paymentCompleted
                      }
                      className="flex-1 bg-[#1b3b2b] hover:bg-emerald-950 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2 text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />

                          <span>Submitting...</span>
                        </>
                      ) : paymentLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />

                          <span>Processing Payment...</span>
                        </>
                      ) : paymentCompleted ? (
                        <>
                          <CheckCircle className="h-4 w-4" />

                          <span>Payment Completed</span>
                        </>
                      ) : isContentOverLimit ? (
                        <span>30 Lines Maximum</span>
                      ) : (
                        <>
                          <span>Submit & Pay</span>

                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                LOGIN OVERLAY
            ================================================= */}

            {!isLoggedIn && (
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className="bg-white/95 backdrop-blur-md border border-stone-200 shadow-2xl rounded-3xl px-8 py-9 text-center max-w-sm w-full mx-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center mb-5">
                    <Lock className="w-7 h-7 text-[#1b3b2b]" />
                  </div>

                  <h2 className="text-xl font-extrabold text-gray-900">
                    Login Required
                  </h2>

                  <p className="text-sm text-stone-500 mt-2 leading-relaxed">
                    Please login to upload your story or poetry and share your
                    creativity with our community.
                  </p>

                  <button
                    onClick={handleLogin}
                    className="mt-6 w-full bg-[#1b3b2b] hover:bg-emerald-950 text-white font-bold py-3 px-5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Register to Continue</span>

                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <p className="text-xs text-stone-400 mt-4">
                    Already a user?{" "}
                    <button
                      onClick={() => navigate("/login")}
                      className="text-[#1b3b2b] font-bold hover:underline cursor-pointer"
                    >
                      login here
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
