import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  ChevronRight,
  BookOpen,
  Clock3,
  CheckCircle2,
  CreditCard,
  Loader2,
  AlertCircle,
  Sparkles,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";

import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

import { getMyStoryPoetry } from "../services/storyPoetryService";
import {
  createStoryPoetryPayment,
  verifyStoryPoetryPayment,
} from "../services/paymentService";

// =========================================================
// YOUR UPLOADS
// =========================================================

const YourUploads = () => {
  const navigate = useNavigate();

  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoadingId, setPaymentLoadingId] = useState(null);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD USER UPLOADS
  // =========================================================

  useEffect(() => {
    const loadUploads = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyStoryPoetry();
        /* console.log("my poetry response",data); */ 
        setUploads(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load uploads:", err);

        setError(
          err?.message || "Failed to load your uploads. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadUploads();
  }, []);

  // =========================================================
  // TYPE ICON
  // =========================================================

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "story":
        return <BookOpen size={24} />;

      case "poetry":
        return <FileText size={24} />;

      case "special":
        return <Sparkles size={24} />;

      default:
        return <FileText size={24} />;
    }
  };

  // =========================================================
  // TYPE LABEL
  // =========================================================

  const getTypeLabel = (type) => {
    if (!type) return "Submission";

    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // CHECK WHETHER PAYMENT IS AVAILABLE
  // =========================================================

  const isPaymentAvailable = (upload) => {
    const paymentEnabledAt =
      upload?.paymentEnabledAt ?? upload?.PaymentEnabledAt;

    if (!paymentEnabledAt) {
      return false;
    }

    let paymentEnabledDate;

    // Backend sends UTC DateTime without "Z"
    // Example: 2026-09-03T06:27:28.4010859
    if (
      typeof paymentEnabledAt === "string" &&
      !paymentEnabledAt.endsWith("Z") &&
      !/[+-]\d{2}:\d{2}$/.test(paymentEnabledAt)
    ) {
      paymentEnabledDate = new Date(`${paymentEnabledAt}Z`);
    } else {
      paymentEnabledDate = new Date(paymentEnabledAt);
    }

    if (Number.isNaN(paymentEnabledDate.getTime())) {
      return false;
    }

    return paymentEnabledDate.getTime() <= Date.now();
  };
  // =========================================================
  // PAYMENT COMPLETED
  // =========================================================

  const isPaymentCompleted = (upload) => {
    const paymentStatus = upload?.paymentStatus ?? upload?.PaymentStatus;

    return paymentStatus?.toLowerCase() === "paid";
  };

  // =========================================================
  // LOAD RAZORPAY SCRIPT
  // =========================================================

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
      );

      if (existingScript) {
        existingScript.onload = () => resolve(true);
        existingScript.onerror = () => resolve(false);
        return;
      }

      const script = document.createElement("script");

      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.async = true;

      script.onload = () => resolve(true);

      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  // =========================================================
  // START PAYMENT
  // =========================================================

  const handlePayment = async (upload) => {
    if (!upload?.storyPoetryId) {
      alert("Invalid submission.");
      return;
    }

    try {
      setPaymentLoadingId(upload.storyPoetryId);
      setError("");

      // -----------------------------------------------------
      // LOAD RAZORPAY
      // -----------------------------------------------------

      const razorpayLoaded = await loadRazorpayScript();

      if (!razorpayLoaded) {
        throw new Error(
          "Unable to load Razorpay. Please check your internet connection and try again.",
        );
      }

      // -----------------------------------------------------
      // CREATE PAYMENT ORDER
      // -----------------------------------------------------

      const paymentData = await createStoryPoetryPayment(upload.storyPoetryId);

      console.log("Story/Poetry payment data:", paymentData);

      // -----------------------------------------------------
      // GET PAYMENT DETAILS
      // -----------------------------------------------------

      const paymentId =
        paymentData?.data?.paymentId ??
        paymentData?.data?.PaymentId ??
        paymentData?.paymentId ??
        paymentData?.PaymentId;

      const razorpayOrderId =
        paymentData?.data?.razorpayOrderId ??
        paymentData?.data?.RazorpayOrderId ??
        paymentData?.razorpayOrderId ??
        paymentData?.RazorpayOrderId;

      const amount =
        paymentData?.data?.amount ??
        paymentData?.data?.Amount ??
        paymentData?.amount ??
        paymentData?.Amount;

      const currency = paymentData?.currency ?? paymentData?.Currency ?? "INR";

      const razorpayKey =
        paymentData?.razorpayKey ??
        paymentData?.RazorpayKey ??
        import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!paymentId) {
        throw new Error("Payment ID was not returned by the server.");
      }

      if (!razorpayOrderId) {
        throw new Error("Razorpay order ID was not returned by the server.");
      }

      if (!amount) {
        throw new Error("Payment amount was not returned by the server.");
      }

      if (!razorpayKey) {
        throw new Error("Razorpay key is not configured.");
      }

      // -----------------------------------------------------
      // RAZORPAY OPTIONS
      // -----------------------------------------------------

      const options = {
        key: razorpayKey,

        amount: amount,

        currency: currency,

        name: "The Old Library",

        description: `${getTypeLabel(upload.type)} Submission - ${upload.title}`,

        order_id: razorpayOrderId,

        handler: async function (response) {
          try {
            // -----------------------------------------------
            // VERIFY PAYMENT
            // -----------------------------------------------

            await verifyStoryPoetryPayment({
              paymentId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            // -----------------------------------------------
            // UPDATE UI
            // -----------------------------------------------

            setUploads((previousUploads) =>
              previousUploads.map((item) =>
                item.storyPoetryId === upload.storyPoetryId
                  ? {
                      ...item,
                      paymentStatus: "Paid",
                    }
                  : item,
              ),
            );

            // -----------------------------------------------
            // SUCCESS TOAST
            // -----------------------------------------------

            toast.success("Payment completed successfully!");
          } catch (err) {
            console.error("Payment verification error:", err);

            // -----------------------------------------------
            // ERROR TOAST
            // -----------------------------------------------

            toast.error(
              err?.message ||
                "Payment verification failed. Please contact support if your amount was deducted.",
            );
          } finally {
            setPaymentLoadingId(null);
          }
        },

        modal: {
          ondismiss: function () {
            setPaymentLoadingId(null);
          },
        },

        theme: {
          color: "#1b3b2b",
        },
      };

      // -----------------------------------------------------
      // OPEN RAZORPAY
      // -----------------------------------------------------

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.error("Razorpay payment failed:", response);

        alert(
          response?.error?.description || "Payment failed. Please try again.",
        );

        setPaymentLoadingId(null);
      });

      razorpay.open();
    } catch (err) {
      console.error("Story/Poetry payment error:", err);

      alert(err?.message || "Unable to start payment. Please try again.");

      setPaymentLoadingId(null);
    }
  };

  // =========================================================
  // TOTAL COUNT
  // =========================================================

  const uploadCount = uploads.length;

  // =========================================================
  // RENDER
  // =========================================================

  return (
  <div className="min-h-screen bg-gray-50">
    {/* =====================================================
          NAVBAR
      ===================================================== */}
    <Navbar />

    {/* =====================================================
          HERO HEADER
      ===================================================== */}
    <section className="px-3 sm:px-6 lg:px-8  pt-3 sm:pt-8 pb-3 sm:pb-10">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-[28px] bg-[#173f2d] px-4 py-5 sm:px-10 sm:py-12 lg:px-12">
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-28 right-24 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-10">
            {/* Left */}
            <div className="max-w-2xl">
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-emerald-100 mb-3 sm:mb-8">  
                <Link to={"/"} className="flex gap-1 items-center hover:text-white">
                <Home size={14} className="sm:w-4 sm:h-4" />
                  Home
                </Link>
                <ChevronRight size={13} className="opacity-70 sm:w-4 sm:h-4" />
                <span className="font-semibold text-white">Your Uploads</span>
              </div>

              {/* Small heading */}
              <p className="uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[10px] sm:text-sm font-bold text-emerald-300 mb-1 sm:mb-4">
                YOUR LITERARY JOURNEY
              </p>

              {/* Main heading */}
              <h1 className="text-2xl sm:text-5xl font-extrabold tracking-tight text-white">
                Your Uploads
              </h1>

              <p className="mt-1.5 sm:mt-5 text-xs sm:text-lg leading-relaxed text-emerald-50/80 max-w-xl">
                Keep track of your submitted stories, poetry and special
                collections all in one place.
              </p>
            </div>

            {/* Count Card */}
            <div className="relative shrink-0 mt-2 sm:mt-0">
              <div className="w-full sm:w-52 h-14 sm:h-40 rounded-xl sm:rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm flex flex-row sm:flex-col items-center justify-between sm:justify-center px-4 sm:px-0">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-200 order-1 sm:order-2">
                  Total Uploads
                </div>
                <div className="text-xl sm:text-4xl font-extrabold text-white order-2 sm:order-1 sm:mb-2 ms-2">
                  {uploadCount}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* =====================================================
          CONTENT
      ===================================================== */}
    <main className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pb-10 sm:pb-16 mt-3">
      {/* ===================================================
              LOADING
          =================================================== */}
      {loading && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm p-8 sm:p-12 text-center">
          <Loader2
            size={28}
            className="mx-auto animate-spin text-[#1b3b2b] sm:w-8 sm:h-8"
          />
          <p className="mt-3 text-xs sm:text-base text-gray-600">Loading your uploads...</p>
        </div>
      )}

      {/* ===================================================
              ERROR
          =================================================== */}
      {!loading && error && (
        <div className="rounded-xl sm:rounded-2xl border border-red-200 bg-red-50 p-3.5 sm:p-5">
          <div className="flex items-start gap-2.5 sm:gap-3">
            <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5 sm:w-5 sm:h-5" />
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-red-800">
                Unable to load your uploads
              </h3>
              <p className="mt-0.5 text-xs sm:text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
              NO UPLOADS
          =================================================== */}
      {!loading && !error && uploads.length === 0 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-16 text-center">
          <div className="w-14 h-14 sm:w-20 sm:h-20 mx-auto rounded-xl sm:rounded-2xl bg-[#edf5f0] flex items-center justify-center">
            <BookOpen size={28} className="text-[#1b3b2b] sm:w-9 sm:h-9" />
          </div>

          <h2 className="mt-4 sm:mt-6 text-xl sm:text-2xl font-bold text-gray-900">
            No uploads yet
          </h2>

          <p className="mt-2 text-xs sm:text-base max-w-md mx-auto text-gray-500 leading-relaxed">
            Your submitted stories, poetry and special collections will appear
            here.
          </p>

          <button
            onClick={() => navigate("/book/upload")}
            className="mt-5 sm:mt-7 w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#1b3b2b] text-white text-sm sm:text-base font-semibold hover:bg-[#123022] transition shadow-sm"
          >
            Submit Your Work
          </button>
        </div>
      )}

      {/* ===================================================
              UPLOAD LIST
          =================================================== */}
      {!loading && !error && uploads.length > 0 && (
        <div className="space-y-5 sm:space-y-10">
          {uploads.map((upload) => {
            const paymentAvailable = isPaymentAvailable(upload);
            const paymentCompleted = isPaymentCompleted(upload);
            const isCurrentlyPaying =
              paymentLoadingId === upload.storyPoetryId;

            return (
              <article
                key={upload.storyPoetryId}
                className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="p-3.5 sm:p-7">
                  {/* =====================================
                          TOP
                      ===================================== */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-5">
                    {/* Icon + Details */}
                    <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#edf5f0] text-[#1b3b2b] flex items-center justify-center shrink-0">
                        {getTypeIcon(upload.type)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2 className="text-base sm:text-2xl font-bold text-gray-900 break-words leading-snug">
                          {upload.title}
                        </h2>

                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1 sm:mt-2 text-xs sm:text-sm">
                          <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-gray-100 text-gray-700 text-[11px] sm:text-xs font-semibold">
                            {getTypeLabel(upload.type)}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-500 text-[11px] sm:text-sm">
                            {formatDate(upload.createdDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ===================================
                              STATUS BADGE
                        =================================== */}
                    <div className="shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      {paymentCompleted ? (
                        <span className="w-full sm:w-auto justify-center inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-full bg-green-100 text-green-700 text-xs sm:text-sm font-bold">
                          <CheckCircle2 size={15} className="sm:w-[17px] sm:h-[17px]" />
                          Payment Completed
                        </span>
                      ) : paymentAvailable ? (
                        <span className="w-full sm:w-auto justify-center inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-full bg-emerald-100 text-emerald-700 text-xs sm:text-sm font-bold">
                          <CheckCircle2 size={15} className="sm:w-[17px] sm:h-[17px]" />
                          Selected
                        </span>
                      ) : (
                        <span className="w-full sm:w-auto justify-center inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-full bg-amber-100 text-amber-700 text-xs sm:text-sm font-bold">
                          <Clock3 size={15} className="sm:w-[17px] sm:h-[17px]" />
                          Waiting for Selection
                        </span>
                      )}
                    </div>
                  </div>

                  {/* =====================================
                          WAITING STATE
                      ===================================== */}
                  {!paymentAvailable && !paymentCompleted && (
                    <div className="mt-3 sm:mt-6 rounded-xl sm:rounded-2xl border border-red-200 bg-red-50 p-3 sm:p-5">
                      <div className="flex items-start gap-2.5 sm:gap-3">
                        <div className="text-base sm:text-xl shrink-0">⚠️</div>
                        <div>
                          <h3 className="font-bold text-xs sm:text-base text-red-800">
                            Waiting for Selection
                          </h3>
                          <p className="mt-1 text-xs sm:text-sm leading-normal sm:leading-6 text-red-700">
                            You will receive an email if your{" "}
                            <strong>{getTypeLabel(upload.type)}</strong> has
                            been selected. Only after receiving the email can
                            you proceed with payment.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* =====================================
                          PAYMENT AVAILABLE
                      ===================================== */}
                  {paymentAvailable && !paymentCompleted && (
                    <div className="mt-3 sm:mt-6 pt-3 sm:pt-6 border-t border-gray-100">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-5">
                        <div>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <CheckCircle2
                              size={16}
                              className="text-emerald-600 sm:w-[20px] sm:h-[20px]"
                            />
                            <h3 className="font-bold text-xs sm:text-base text-gray-900">
                              Your submission has been selected
                            </h3>
                          </div>
                          <p className="mt-1 text-xs sm:text-sm text-gray-500 leading-tight sm:leading-6">
                            You can now complete the payment for this
                            submission.
                          </p>
                        </div>

                        <button
                          onClick={() => handlePayment(upload)}
                          disabled={isCurrentlyPaying}
                          className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 sm:px-7 sm:py-3.5 rounded-xl bg-[#1b3b2b] text-white text-sm sm:text-base font-bold hover:bg-[#123022] disabled:opacity-60 disabled:cursor-not-allowed transition shadow-sm active:scale-[0.99]"
                        >
                          {isCurrentlyPaying ? (
                            <>
                              <Loader2 size={16} className="animate-spin sm:w-[19px] sm:h-[19px]" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CreditCard size={16} className="sm:w-[19px] sm:h-[19px]" />
                              Pay Now
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* =====================================
                          PAYMENT COMPLETED
                      ===================================== */}
                  {paymentCompleted && (
                    <div className="mt-3 sm:mt-6 rounded-xl sm:rounded-2xl border border-green-200 bg-green-50 p-3 sm:p-5">
                      <div className="flex items-start gap-2.5 sm:gap-3">
                        <CheckCircle2
                          size={18}
                          className="text-green-600 shrink-0 mt-0.5 sm:w-[23px] sm:h-[23px]"
                        />
                        <div>
                          <h3 className="font-bold text-xs sm:text-base text-green-800">
                            Payment Completed
                          </h3>
                          <p className="mt-0.5 text-xs sm:text-sm leading-tight sm:leading-6 text-green-700">
                            Your payment for this submission has been
                            successfully completed.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>

    {/* =====================================================
          FOOTER
      ===================================================== */}
    <Footer />
  </div>
);
};

export default YourUploads;
