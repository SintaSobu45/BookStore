import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  ReceiptText,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { getStoryPoetryById } from "../services/storyPoetryService";
import {
  createStoryPoetryPayment,
  verifyStoryPoetryPayment,
  cancelStoryPoetryPayment,
} from "../services/paymentService";

const StoryPoetryPayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestedCopies, setRequestedCopies] = useState(0);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const loadSubmission = async () => {
      try {
        setLoading(true);
        const data = await getStoryPoetryById(id);
        console.log('submissiondata',data);
        
        setSubmission(data);
      } catch (error) {
        console.error("Failed to load submission:", error);
        toast.error(error?.message || "Failed to load submission.");
        navigate("/your/uploads");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadSubmission();
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9f8] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[#1b3b2b]" />
          <p className="text-gray-600 text-sm font-medium">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!submission) return null;

  const uploadFee = Number(submission.baseAmount ?? 0);
  const extraCopyPrice = Number(submission.extraCopyPrice ?? 0);
  const complimentaryCopies = 2;
  const extraCopyAmount = extraCopyPrice * requestedCopies;
  const totalAmount = uploadFee + extraCopyAmount;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
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

  const handleProceedToPayment = async () => {
    if (!submission?.storyPoetryId) {
      toast.error("Invalid submission.");
      return;
    }

    try {
      setPaymentLoading(true);
      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        throw new Error(
          "Unable to load Razorpay. Please check your connection and try again."
        );
      }

      const paymentData = await createStoryPoetryPayment(
        submission.storyPoetryId,
        requestedCopies
      );

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

      const currency =
        paymentData?.data?.currency ??
        paymentData?.data?.Currency ??
        paymentData?.currency ??
        paymentData?.Currency ??
        "INR";

      const razorpayKey =
        paymentData?.data?.razorpayKey ??
        paymentData?.data?.RazorpayKey ??
        paymentData?.razorpayKey ??
        paymentData?.RazorpayKey ??
        import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!paymentId || !razorpayOrderId || !amount || !razorpayKey) {
        throw new Error("Missing payment setup parameters from server.");
      }

      const options = {
        key: razorpayKey,
        amount: Math.round(Number(amount) * 100),
        currency: currency,
        name: "The Old Library",
        description: `${submission.type || "Submission"} - ${submission.title}`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            await verifyStoryPoetryPayment({
              paymentId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success("Payment completed successfully!");
            navigate("/your/uploads");
          } catch (err) {
            console.error("Payment verification error:", err);
            toast.error(
              err?.message ||
                "Payment verification failed. Please contact support."
            );
          } finally {
            setPaymentLoading(false);
          }
        },
        modal: {
          ondismiss: async function () {
            try {
              if (paymentId) {
                await cancelStoryPoetryPayment(paymentId);
                toast.success("Payment cancelled.");
              }
            } catch (error) {
              console.error("Payment cancellation error:", error);
            } finally {
              setPaymentLoading(false);
            }
          },
        },
        theme: { color: "#1b3b2b" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response) {
        toast.error(response?.error?.description || "Payment failed.");
        setPaymentLoading(false);
      });
      razorpay.open();
    } catch (err) {
      console.error("Story/Poetry payment error:", err);
      toast.error(err?.message || "Unable to start payment. Please try again.");
      setPaymentLoading(false);
    }
  };

  const formatCurrency = (value) => `₹${Number(value || 0).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-[#f8f9f8] py-8 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
          <button
            type="button"
            onClick={() => navigate("/your/uploads")}
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-[#1b3b2b] transition"
          >
            <ArrowLeft size={16} />
            Back to Uploads
          </button>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1b3b2b] bg-[#eaf3ee] px-3 py-1 rounded-full border border-[#1b3b2b]/10">
              <ShieldCheck size={14} /> Secure Checkout
            </span>
          </div>
        </div>

        {/* E-Commerce Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Order & Submission Details */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Submission Banner Card */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#1b3b2b] bg-[#eaf3ee] px-2.5 py-0.5 rounded-md">
                    {submission.type || "Submission"}
                  </span>
                  <h1 className="text-xl font-bold text-gray-900 leading-tight">
                    {submission.title}
                  </h1>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#eaf3ee] flex items-center justify-center shrink-0 border border-[#1b3b2b]/10 text-[#1b3b2b]">
                  <BookOpen size={20} />
                </div>
              </div>

              {/* Contributor Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 bg-gray-50/80 p-3.5 rounded-xl border border-gray-100 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Contributor</span>
                  <span className="font-semibold text-gray-800 truncate block mt-0.5">
                    {submission.contributorNameMalayalam || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Particular</span>
                  <span className="font-semibold text-gray-800 truncate block mt-0.5">
                    {submission.particularName || submission.particularNameSnapshot || "—"}
                  </span>
                </div>
                {submission.contributorPhone && (
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Phone</span>
                    <span className="font-semibold text-gray-800 truncate block mt-0.5">
                      {submission.contributorPhone}
                    </span>
                  </div>
                )}
                {(submission.contributorDistrictMalayalam || submission.contributorCityMalayalam) && (
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Location</span>
                    <span className="font-semibold text-gray-800 truncate block mt-0.5">
                      {[submission.contributorDistrictMalayalam, submission.contributorCityMalayalam]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Copies Configurator Card */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-sm pb-2 border-b border-gray-100">
                <ReceiptText size={18} className="text-[#1b3b2b]" />
                <h3>Copies & Distribution</h3>
              </div>

              {/* Included Copies Banner */}
              <div className="flex items-center justify-between bg-[#eaf3ee] border border-[#1b3b2b]/10 rounded-xl p-3 text-xs text-[#1b3b2b]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#1b3b2b] shrink-0" />
                  <span>Complimentary Copies Included</span>
                </div>
                <span className="font-bold bg-white px-2 py-0.5 rounded-md shadow-xs">
                  {complimentaryCopies} Copies
                </span>
              </div>

              {/* Extra Copy Selector */}
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-3">
                <div>
                  <p className="text-xs font-bold text-gray-900">Additional Copies</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {formatCurrency(extraCopyPrice)} per copy
                  </p>
                </div>
                <select
                  value={requestedCopies}
                  onChange={(e) => setRequestedCopies(Number(e.target.value))}
                  disabled={paymentLoading}
                  className="rounded-lg border border-gray-300 bg-white text-xs px-3 py-1.5 text-gray-900 font-semibold outline-none focus:border-[#1b3b2b] focus:ring-1 focus:ring-[#1b3b2b] cursor-pointer shadow-xs"
                >
                  {Array.from({ length: 11 }, (_, i) => (
                    <option key={i} value={i}>
                      {i} extra {i === 1 ? "copy" : "copies"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Payment Summary Card */}
          <div className="lg:col-span-5 lg:sticky lg:top-6">
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 space-y-5">
              <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100 flex items-center justify-between">
                <span>Payment Summary</span>
                <CreditCard size={18} className="text-[#1b3b2b]" />
              </h2>

              {/* Itemized Price Breakdown */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Upload Fee</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(uploadFee)}</span>
                </div>

                <div className="flex justify-between items-center text-gray-600">
                  <span>Complimentary Copies</span>
                  <span className="font-semibold text-gray-900">{complimentaryCopies} Copies</span>
                </div>

                {requestedCopies > 0 && (
                  <>
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Extra Copy Price</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(extraCopyPrice)}</span>
                    </div>

                    <div className="flex justify-between items-center text-gray-600">
                      <span>Extra Copies</span>
                      <span className="font-semibold text-gray-900">{requestedCopies}</span>
                    </div>
                  </>
                )}

                <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-bold text-gray-900 block">Total Payable</span>
                    <span className="text-[10px] text-gray-400">Inclusive of all taxes</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-[#1b3b2b]">
                      {formatCurrency(totalAmount)}
                    </span>
                    <span className="text-[10px] font-medium text-gray-500 block">INR</span>
                  </div>
                </div>
              </div>

              {/* Checkout Action Button */}
              <button
                type="button"
                onClick={handleProceedToPayment}
                disabled={paymentLoading || totalAmount <= 0}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1b3b2b] py-3.5 px-4 text-sm font-semibold text-white hover:bg-[#142e22] active:scale-[0.99] transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-md cursor-pointer"
              >
                {paymentLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    Proceed to Pay {formatCurrency(totalAmount)}
                  </>
                )}
              </button>

              <div className="pt-1 text-center">
                <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1">
                  <ShieldCheck size={13} className="text-[#1b3b2b]" />
                  Encrypted & Secured by Razorpay
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StoryPoetryPayment;