import { useEffect, useState } from "react";
import {
  getPaymentSettings,
  updateSubmissionPrices,
} from "../../services/paymentSettingsService";

const PaymentSettings = ({ isOpen, onClose }) => {
  const [storyPrice, setStoryPrice] = useState("");
  const [poetryPrice, setPoetryPrice] = useState("");
  const [specialPrice, setSpecialPrice] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadPaymentSettings();
    }
  }, [isOpen]);

  const loadPaymentSettings = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const settings = await getPaymentSettings();

      const storySetting = settings.find(
        (setting) =>
          setting.paymentType?.toLowerCase() === "story"
      );

      const poetrySetting = settings.find(
        (setting) =>
          setting.paymentType?.toLowerCase() === "poetry"
      );

      const specialSetting = settings.find(
        (setting) =>
          setting.paymentType?.toLowerCase() === "special"
      );

      setStoryPrice(storySetting?.amount ?? "");
      setPoetryPrice(poetrySetting?.amount ?? "");
      setSpecialPrice(specialSetting?.amount ?? "");
    } catch (err) {
      setError(
        err.message || "Failed to load payment settings."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!storyPrice || Number(storyPrice) <= 0) {
      setError("Please enter a valid Story price.");
      return;
    }

    if (!poetryPrice || Number(poetryPrice) <= 0) {
      setError("Please enter a valid Poetry price.");
      return;
    }

    if (!specialPrice || Number(specialPrice) <= 0) {
      setError("Please enter a valid Special price.");
      return;
    }

    try {
      setSaving(true);

      await updateSubmissionPrices({
        storyPrice,
        poetryPrice,
        specialPrice,
      });

      setMessage(
        "Story, Poetry and Special prices updated successfully."
      );

      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err) {
      setError(
        err.message || "Failed to update payment prices."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Submission Payment Settings
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              Set individual prices for submissions
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {loading ? (
            <p className="text-sm text-gray-500">
              Loading payment settings...
            </p>
          ) : (
            <form onSubmit={handleSave}>

              {/* Story */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Story Price
                </label>

                <div className="flex items-center">
                  <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-4 py-3 text-gray-600">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={storyPrice}
                    onChange={(e) =>
                      setStoryPrice(e.target.value)
                    }
                    placeholder="Enter Story price"
                    className="w-full border border-gray-300 rounded-r-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
                  />
                </div>
              </div>

              {/* Poetry */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Poetry Price
                </label>

                <div className="flex items-center">
                  <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-4 py-3 text-gray-600">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={poetryPrice}
                    onChange={(e) =>
                      setPoetryPrice(e.target.value)
                    }
                    placeholder="Enter Poetry price"
                    className="w-full border border-gray-300 rounded-r-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
                  />
                </div>
              </div>

              {/* Special */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Special Price
                </label>

                <div className="flex items-center">
                  <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-4 py-3 text-gray-600">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={specialPrice}
                    onChange={(e) =>
                      setSpecialPrice(e.target.value)
                    }
                    placeholder="Enter Special price"
                    className="w-full border border-gray-300 rounded-r-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                These prices are used when creating Razorpay
                payment orders.
              </p>

              {/* Error */}
              {error && (
                <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  {error}
                </p>
              )}

              {/* Success */}
              {message && (
                <p className="mt-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  {message}
                </p>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-lg bg-[#1b3b2b] text-white font-semibold hover:bg-[#143022] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Prices"}
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;