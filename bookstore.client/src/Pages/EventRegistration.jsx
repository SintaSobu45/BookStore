import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Home,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Users,
  Sparkles,
  Check,
  User,
  Mail,
  Phone,
  Plus,
  Minus,
  ShieldCheck,
  Lock,
  CreditCard,
  Wallet,
  Building2,
  Award,
  BookOpen,
  Info,
  Ticket,
  CalendarDays,
} from "lucide-react";


import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

import { getEventById } from "../services/eventService";
import { getProfile } from "../services/profileService";
import { registerForEvent, createEventPayment,verifyEventPayment } from "../services/eventRegistrationService";




export default function EventRegistration() {
  const navigate = useNavigate();
  const { id } = useParams();

  console.log("Event id:", id);

  // =========================
  // Profile
  // =========================

  const [profile, setProfile] = useState(null);

  // =========================
  // Event
  // =========================

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================
  // Registration
  // =========================

  const [seats, setSeats] = useState(1);

  // =========================
  // Book Copies
  // =========================

  const [wantExtraCopies, setWantExtraCopies] = useState("no");
  const [extraCopiesCount, setExtraCopiesCount] = useState(1);

  // =========================
  // Payment
  // =========================

  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [agreed, setAgreed] = useState(false);

  // =========================
  // Submit
  // =========================

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // Load Event + Profile
  // =========================

  useEffect(() => {
    loadEvent();
    loadProfile();
  }, [id]);

  const loadEvent = async () => {
    try {
      setLoading(true);

      console.log("Loading event:", id);

      const data = await getEventById(id);

      console.log("Event API response:", data);

      setEvent(data);
    } catch (err) {
      console.error("Failed to load event:", err);

      setError(err.message || "Failed to load event.");
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const data = await getProfile();

      console.log("Profile response:", data);

      setProfile(data);
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  };

  // =========================
  // Backend based calculations
  // =========================

  const ticketPricePerSeat = Number(event?.entryFee || 0);

  const bookPrice = Number(event?.bookPrice || 0);

  const entryFee = ticketPricePerSeat;

  /*
    Backend logic:

    First 2 copies are free for approved contributors.

    Additional copies are paid.

    Since frontend doesn't know whether user
    is an approved contributor, the backend
    remains the final authority.
  */

  const requestedBookCopies =
    wantExtraCopies === "yes" ? 2 + extraCopiesCount : 2;

  const paidCopiesPreview = wantExtraCopies === "yes" ? extraCopiesCount : 0;

  const bookAmount = paidCopiesPreview * bookPrice;

  /*
    IMPORTANT:

    Your backend currently calculates:

    TotalAmount =
      EntryFee * Seats
      +
      BookPrice * PaidBookCopies

    There is NO convenience fee.

    So frontend preview follows that.
  */

  const totalAmount = entryFee ;

  const totalCopies = requestedBookCopies;

  // =========================
  // Submit Registration
  // =========================

  const handleSubmit = async (e) => {
  e.preventDefault();

  setError("");
  setSuccess("");

  if (!event) {
    setError("Event information is not available.");
    return;
  }

  if (!agreed) {
    setError("Please agree to the Terms & Conditions and Privacy Policy.");
    return;
  }

  if (seats < 1) {
    setError("Please select at least one seat.");
    return;
  }

  if (seats > event.availableSeats) {
    setError(`Only ${event.availableSeats} seats are available.`);
    return;
  }

  try {
    setSubmitting(true);

    // =====================================================
    // STEP 1 — Create Pending Event Registration
    // =====================================================

    const registrationData = {
      eventId: Number(id),
      numberOfSeats: seats,
    };

    console.log("Creating event registration:", registrationData);

    const registrationResult =
      await registerForEvent(registrationData);

    console.log(
      "Registration created:",
      registrationResult
    );

    const registrationId =
      registrationResult.registrationId;

    if (!registrationId) {
      throw new Error(
        "Registration was created but Registration ID was not returned."
      );
    }

    // =====================================================
    // STEP 2 — Create Razorpay Order
    // =====================================================

    console.log(
      "Creating Razorpay order for registration:",
      registrationId
    );

    const payment =
      await createEventPayment(registrationId);

    console.log(
      "Razorpay order created:",
      payment
    );

    if (!payment.razorpayOrderId) {
      throw new Error(
        "Razorpay order was not created."
      );
    }

    // =====================================================
    // STEP 3 — Open Razorpay Checkout
    // =====================================================

    if (!window.Razorpay) {
      throw new Error(
        "Razorpay Checkout failed to load. Please refresh the page."
      );
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,

      amount: Math.round(
        Number(payment.amount) * 100
      ),

      currency: "INR",

      name: "BookStore",

      description: event.eventName,

      order_id: payment.razorpayOrderId,

      handler: async function (response) {

        try {

          console.log(
            "Razorpay payment successful:",
            response
          );

          // =================================================
          // STEP 4 — Verify Payment With Backend
          // =================================================

          const verification =
            await verifyEventPayment({

              paymentId:
                payment.paymentId,

              razorpayOrderId:
                response.razorpay_order_id,

              razorpayPaymentId:
                response.razorpay_payment_id,

              razorpaySignature:
                response.razorpay_signature,
            });

          console.log(
            "Payment verified:",
            verification
          );

          setSuccess(
            "Payment successful! Your event registration is confirmed."
          );

          // =================================================
          // STEP 5 — Redirect
          // =================================================

          setTimeout(() => {
            navigate("/my/registrations");
          }, 1500);

        } catch (err) {

          console.error(
            "Payment verification failed:",
            err
          );

          setError(
            err.message ||
            "Payment verification failed."
          );

        } finally {

          setSubmitting(false);

        }
      },

      modal: {
        ondismiss: function () {

          console.log(
            "Razorpay checkout closed."
          );

          setSubmitting(false);

          setError(
            "Payment was cancelled. Your registration is still pending."
          );
        },
      },

      prefill: {
        name:
          profile?.fullName ||
          profile?.name ||
          "",

        email:
          profile?.email ||
          "",

        contact:
          profile?.phone ||
          "",
      },

      theme: {
        color: "#1b3b2b",
      },
    };

    const razorpay =
      new window.Razorpay(options);

    razorpay.open();

  } catch (err) {
    setSubmitting(false);
  console.error(
    "Event registration/payment failed:",
    err
  );

  if (
    err.message ===
    "You have already registered for this event."
  ) {
    toast.error(
      "You have already registered and paid for this event.",
      {
        position: "top-right",
        autoClose: 4000,
      }
    );
  } else {
    toast.error(
      err.message ||
      "Unable to process registration.",
      {
        position: "top-right",
        autoClose: 4000,
      }
    );
  }

  
}
};

  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="min-h-screen flex items-center justify-center bg-stone-50">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-emerald-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>

            <p className="text-sm font-semibold text-stone-600">
              Loading event...
            </p>
          </div>
        </div>

        <Footer />
      </>
    );
  }

  // =========================
  // Event not found
  // =========================

  if (!event) {
    return (
      <>
        <Navbar />

        <div className="min-h-screen flex items-center justify-center bg-stone-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Event Not Found
            </h2>

            <p className="text-sm text-stone-500 mb-5">
              We couldn't find the event you're looking for.
            </p>

            <Link
              to="/events"
              className="inline-flex items-center bg-[#1b3b2b] text-white px-5 py-3 rounded-xl text-sm font-bold"
            >
              Back to Events
            </Link>
          </div>
        </div>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* =========================
        PAGE CONTENT
    ========================= */}

      <div className="relative min-h-screen bg-stone-50/60">
        {/* =========================
          BLURRED PAGE
      ========================= */}

        <div
          className={
            !profile ? "blur-[1px] pointer-events-none select-none" : ""
          }
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* =========================
                LEFT - REGISTRATION
            ========================= */}

              <div className="lg:col-span-7">
                <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
                  <h3 className="font-extrabold text-gray-900 text-base border-b border-stone-100 pb-3 mb-6">
                    Event Registration
                  </h3>

                  {/* Number of Seats */}

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Number of Seats
                    </label>

                    <select
                      value={seats}
                      onChange={(e) => setSeats(Number(e.target.value))}
                      className="w-full bg-stone-50/75 border border-stone-200 rounded-xl py-3 px-3.5 text-xs text-gray-800 focus:outline-none focus:border-emerald-800 font-medium"
                    >
                      {Array.from(
                        {
                          length: Math.min(10, event.availableSeats),
                        },
                        (_, index) => index + 1,
                      ).map((number) => (
                        <option key={number} value={number}>
                          {number} {number === 1 ? "Seat" : "Seats"}
                        </option>
                      ))}
                    </select>

                    <p className="text-[10px] text-stone-400 mt-2">
                      Maximum 10 seats per registration
                    </p>
                  </div>

                  {/* =========================
                    PAYMENT
                ========================= */}

                  <div className="mt-8">
                    <h3 className="font-extrabold text-gray-900 text-sm border-b border-stone-100 pb-3 mb-4">
                      Payment
                    </h3>

                    <div className="border-2 border-[#1b3b2b] bg-emerald-50/20 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          checked
                          readOnly
                          className="accent-[#1b3b2b]"
                        />

                        <div>
                          <h4 className="font-bold text-gray-900 text-xs">
                            Razorpay
                          </h4>

                          <p className="text-[10px] text-stone-500">
                            UPI, Cards, NetBanking & Wallets
                          </p>
                        </div>
                      </div>

                      <span className="font-extrabold text-blue-900 text-xs bg-blue-50 px-2.5 py-1 rounded-lg">
                        Razorpay
                      </span>
                    </div>

                    <div className="mt-4 bg-stone-50 border border-stone-200 rounded-2xl p-4 flex items-center space-x-3">
                      <ShieldCheck className="h-5 w-5 text-emerald-900" />

                      <div>
                        <h4 className="font-bold text-gray-900 text-xs">
                          Secure Payment
                        </h4>

                        <p className="text-[10px] text-stone-500">
                          Your payment will be processed securely through
                          Razorpay.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* =========================
                RIGHT - ORDER SUMMARY
            ========================= */}

              <div className="lg:col-span-5">
                <div className="sticky top-6 bg-white border border-stone-200/80 rounded-3xl shadow-sm overflow-hidden">
                  {/* =========================
        EVENT BANNER
    ========================= */}
                  <div className="w-full bg-stone-100 overflow-hidden">
                    <img
                      src={
                        event.imageUrl ||
                        "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={event.eventName}
                      className="w-full h-auto block"
                    />
                  </div>

                  {/* =========================
        ORDER CONTENT
    ========================= */}
                  <div className="p-6 sm:p-8 space-y-6">
                    {/* Heading */}
                    <div className="border-b border-stone-100 pb-3">
                      <h3 className="font-extrabold text-gray-900 text-base">
                        Order Summary
                      </h3>
                    </div>

                    {/* =========================
          EVENT DETAILS
      ========================= */}
                    <div>
                      <span className="block text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-3">
                        Event Details
                      </span>

                      <div className="space-y-3">
                        {/* Event Name */}
                        <h4 className="font-extrabold text-gray-900 text-sm leading-snug">
                          {event.eventName}
                        </h4>

                        {/* Date */}
                        <div className="flex items-center gap-2 text-xs text-stone-600">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                            <CalendarDays className="h-3.5 w-3.5 text-emerald-800" />
                          </div>

                          <span>
                            {new Date(event.eventDate).toLocaleDateString(
                              "en-IN",
                              {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-2 text-xs text-stone-600">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                            <Clock className="h-3.5 w-3.5 text-emerald-800" />
                          </div>

                          <span>4:00 PM - 7:00 PM</span>
                        </div>

                        {/* Venue */}
                        <div className="flex items-center gap-2 text-xs text-stone-600">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                            <MapPin className="h-3.5 w-3.5 text-emerald-800" />
                          </div>

                          <span className="truncate">{event.venue}</span>
                        </div>
                      </div>
                    </div>

                    {/* =========================
          SUMMARY
      ========================= */}
                    <div className="border-t border-stone-100 pt-5">
                      <span className="block text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-3">
                        Summary
                      </span>

                      <div className="flex justify-between items-center text-xs text-stone-600">
                        <span>
                          Entry Fee ({seats} {seats === 1 ? "Seat" : "Seats"})
                        </span>

                        <span className="font-bold text-gray-900">
                          ₹{entryFee}.00
                        </span>
                      </div>
                    </div>

                    {/* =========================
          TOTAL
      ========================= */}
                    <div className="border-t border-stone-200 pt-5 flex items-center justify-between">
                      <span className="font-extrabold text-gray-900 text-sm">
                        Total
                      </span>

                      <span className="font-black text-emerald-900 text-2xl">
                        ₹{totalAmount}.00
                      </span>
                    </div>

                    {/* =========================
          TERMS
      ========================= */}
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="agreeTerms"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="accent-[#1b3b2b] h-4 w-4 mt-0.5 rounded cursor-pointer"
                      />

                      <label
                        htmlFor="agreeTerms"
                        className="text-xs text-stone-600 leading-relaxed cursor-pointer"
                      >
                        I agree to the{" "}
                        <span className="text-emerald-900 font-bold">
                          Terms & Conditions
                        </span>{" "}
                        and{" "}
                        <span className="text-emerald-900 font-bold">
                          Privacy Policy
                        </span>
                      </label>
                    </div>

                    {/* =========================
          REGISTER BUTTON
      ========================= */}
                    <button
                    onClick={handleSubmit}
                      type="submit"
                      className="w-full bg-[#1b3b2b] hover:bg-emerald-950 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />

                          <span>Registering...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />

                          <span>Register for ₹{totalAmount}.00</span>
                        </>
                      )}
                    </button>

                    {/* Secure text */}
                    <div className="text-center">
                      <span className="text-[10px] text-stone-400 font-medium">
                        🔒 Secure event registration
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================
          LOGIN OVERLAY
          This stays OUTSIDE the blurred container
      ================================================== */}

        {!profile && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/10">
            <div className="bg-white border border-stone-200 shadow-2xl rounded-3xl px-8 py-8 sm:px-10 sm:py-10 text-center w-[90%] max-w-md">
              {/* Lock Icon */}

              <div className="w-16 h-16 bg-emerald-100 text-emerald-900 rounded-full flex items-center justify-center mx-auto mb-5">
                <Lock className="h-7 w-7" />
              </div>

              {/* Title */}

              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                Please Login
              </h2>

              {/* Description */}

              <p className="text-sm text-stone-500 mt-2 leading-relaxed">
                You need to login to register for this event and make a payment.
              </p>

              {/* Login Button */}

              <Link
                to="/login"
                className="mt-6 inline-flex items-center justify-center bg-[#1b3b2b] hover:bg-emerald-950 text-white font-bold text-sm px-7 py-3 rounded-xl shadow-md transition-colors"
              >
                Login to Continue
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
