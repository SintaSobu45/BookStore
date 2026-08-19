import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  CreditCard,
  CheckCircle,
  Clock3,
  XCircle,
  Loader2,
  RefreshCcw,
} from "lucide-react";

import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

import {
  getMyRegistrations,
  createEventPayment,
  verifyEventPayment,
} from "../services/eventRegistrationService";

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // LOAD MY REGISTRATIONS
  // =====================================================

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyRegistrations();

      console.log("My registrations:", data);

      setRegistrations(data);
    } catch (err) {
      console.error("Failed to load registrations:", err);

      setError(
        err.message || "Failed to load your registrations."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  // =====================================================
  // RETRY PAYMENT
  // =====================================================

  const handleRetryPayment = async (registration) => {
    try {
      setRetryingId(registration.registrationId);
      setError("");
      setSuccess("");

      console.log(
        "Retrying payment for registration:",
        registration.registrationId
      );

      // -------------------------------------------------
      // 1. Create new Razorpay order
      // -------------------------------------------------

      const payment = await createEventPayment(
        registration.registrationId
      );

      console.log("Retry payment order:", payment);

      if (!payment.razorpayOrderId) {
        throw new Error(
          "Razorpay order was not created."
        );
      }

      // -------------------------------------------------
      // 2. Check Razorpay SDK
      // -------------------------------------------------

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay Checkout failed to load. Please refresh the page."
        );
      }

      // -------------------------------------------------
      // 3. Open Razorpay Checkout
      // -------------------------------------------------

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

        amount: Math.round(
          Number(payment.amount) * 100
        ),

        currency: "INR",

        name: "BookStore",

        description: registration.eventName,

        order_id: payment.razorpayOrderId,

        handler: async function (response) {
          try {
            console.log(
              "Retry payment successful:",
              response
            );

            // -------------------------------------------------
            // 4. Verify payment
            // -------------------------------------------------

            const verification =
              await verifyEventPayment({
                paymentId: payment.paymentId,

                razorpayOrderId:
                  response.razorpay_order_id,

                razorpayPaymentId:
                  response.razorpay_payment_id,

                razorpaySignature:
                  response.razorpay_signature,
              });

            console.log(
              "Retry payment verified:",
              verification
            );

            setSuccess(
              "Payment successful! Your event registration is confirmed."
            );

            // -------------------------------------------------
            // 5. Reload registrations
            // -------------------------------------------------

            await loadRegistrations();

          } catch (err) {
            console.error(
              "Retry payment verification failed:",
              err
            );

            setError(
              err.message ||
                "Payment verification failed."
            );
          } finally {
            setRetryingId(null);
          }
        },

        modal: {
          ondismiss: function () {
            console.log(
              "Razorpay checkout closed."
            );

            setRetryingId(null);

            setError(
              "Payment was cancelled. Your registration is still pending."
            );
          },
        },

        prefill: {
          name: registration.userName || "",
          email: registration.email || "",
          contact: registration.phone || "",
        },

        theme: {
          color: "#1b3b2b",
        },
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.open();

    } catch (err) {
      console.error(
        "Retry payment failed:",
        err
      );

      setError(
        err.message ||
          "Unable to start payment."
      );

      setRetryingId(null);
    }
  };

  // =====================================================
  // STATUS
  // =====================================================

  const getStatus = (status) => {
    const normalized =
      status?.toLowerCase();

    if (
      normalized === "registered" ||
      normalized === "confirmed" ||
      normalized === "paid"
    ) {
      return {
        label: "Confirmed",
        className:
          "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCircle,
      };
    }

    if (normalized === "pending") {
      return {
        label: "Payment Pending",
        className:
          "bg-amber-50 text-amber-700 border-amber-200",
        icon: Clock3,
      };
    }

    if (
      normalized === "cancelled" ||
      normalized === "failed"
    ) {
      return {
        label: status,
        className:
          "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
      };
    }

    return {
      label: status || "Unknown",
      className:
        "bg-stone-50 text-stone-600 border-stone-200",
      icon: Clock3,
    };
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-900 mx-auto mb-3" />

            <p className="text-sm font-semibold text-stone-600">
              Loading your registrations...
            </p>
          </div>
        </div>

        <Footer />
      </>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-stone-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* HEADER */}

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              My Registrations
            </h1>

            <p className="text-sm text-stone-500 mt-2">
              View your event registrations and payment status.
            </p>
          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">
              {success}
            </div>
          )}

          {/* NO REGISTRATIONS */}

          {registrations.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-3xl p-10 text-center shadow-sm">

              <CalendarDays className="w-12 h-12 text-stone-300 mx-auto mb-4" />

              <h2 className="text-lg font-bold text-gray-900">
                No Registrations Yet
              </h2>

              <p className="text-sm text-stone-500 mt-2 mb-6">
                You haven't registered for any events yet.
              </p>

              <Link
                to="/events"
                className="inline-flex items-center bg-[#1b3b2b] text-white px-5 py-3 rounded-xl text-sm font-bold"
              >
                Browse Events
              </Link>

            </div>
          ) : (
            <div className="space-y-5">

              {registrations.map((registration) => {
                const status =
                  getStatus(
                    registration.status
                  );

                const StatusIcon =
                  status.icon;

                const isPending =
                  registration.status?.toLowerCase() ===
                  "pending";

                const isRetrying =
                  retryingId ===
                  registration.registrationId;

                return (
                  <div
                    key={
                      registration.registrationId
                    }
                    className="bg-white border border-stone-200 rounded-3xl shadow-sm overflow-hidden"
                  >

                    <div className="p-6 sm:p-7">

                      {/* TOP */}

                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                        <div>
                          <h2 className="text-lg font-extrabold text-gray-900">
                            {registration.eventName}
                          </h2>

                          <p className="text-xs text-stone-400 mt-1">
                            Registration #
                            {registration.registrationId}
                          </p>
                        </div>

                        <div
                          className={`inline-flex items-center gap-2 border rounded-full px-3 py-1.5 text-xs font-bold ${status.className}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />

                          {status.label}
                        </div>

                      </div>

                      {/* DETAILS */}

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">

                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <CalendarDays className="w-4 h-4 text-emerald-800" />
                          </div>

                          <div>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-stone-400">
                              Date
                            </p>

                            <p className="text-xs font-semibold text-gray-800">
                              {new Date(
                                registration.eventDate
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-emerald-800" />
                          </div>

                          <div>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-stone-400">
                              Time
                            </p>

                            <p className="text-xs font-semibold text-gray-800">
                              4:00 PM - 7:00 PM
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-emerald-800" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wider font-bold text-stone-400">
                              Venue
                            </p>

                            <p className="text-xs font-semibold text-gray-800 truncate">
                              {registration.venue}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <Users className="w-4 h-4 text-emerald-800" />
                          </div>

                          <div>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-stone-400">
                              Seats
                            </p>

                            <p className="text-xs font-semibold text-gray-800">
                              {registration.numberOfSeats}
                            </p>
                          </div>
                        </div>

                      </div>

                      {/* BOTTOM */}

                      <div className="border-t border-stone-100 mt-6 pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-stone-400">
                            Registration Amount
                          </p>

                          <p className="text-xl font-black text-emerald-900">
                            ₹
                            {Number(
                              registration.totalAmount
                            ).toFixed(2)}
                          </p>
                        </div>

                        {/* RETRY PAYMENT */}

                        {isPending && (
                          <button
                            onClick={() =>
                              handleRetryPayment(
                                registration
                              )
                            }
                            disabled={isRetrying}
                            className="inline-flex items-center justify-center gap-2 bg-[#1b3b2b] hover:bg-emerald-950 disabled:opacity-60 text-white font-bold text-sm px-5 py-3 rounded-xl transition"
                          >
                            {isRetrying ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />

                                Processing...
                              </>
                            ) : (
                              <>
                                <RefreshCcw className="w-4 h-4" />

                                Retry Payment
                              </>
                            )}
                          </button>
                        )}

                        {!isPending && (
                          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                            <CheckCircle className="w-4 h-4" />

                            Registration confirmed
                          </div>
                        )}

                      </div>

                    </div>
                  </div>
                );
              })}

            </div>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}