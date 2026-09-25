import { useEffect, useState } from "react";

import {
  getPaymentSettings,
  updateSubmissionPrices,
} from "../../services/paymentSettingsService";

import {
  getStoryPoetryCopySettings,
  updateStoryPoetryCopySetting,
} from "../../services/storyPoetryService";

const PaymentSettings = ({ isOpen, onClose }) => {
  // =========================================================
  // PAYMENT PRICES
  // =========================================================

  const [storyPrice, setStoryPrice] = useState("");
  const [poetryPrice, setPoetryPrice] = useState("");
  const [specialPrice, setSpecialPrice] = useState("");

  // =========================================================
  // FREE COPIES
  // =========================================================

  const [storyFreeCopies, setStoryFreeCopies] = useState("");
  const [poetryFreeCopies, setPoetryFreeCopies] = useState("");
  const [specialFreeCopies, setSpecialFreeCopies] = useState("");

  // =========================================================
  // COPY SETTING IDS
  // =========================================================

  const [storyCopySettingId, setStoryCopySettingId] = useState(null);
  const [poetryCopySettingId, setPoetryCopySettingId] = useState(null);
  const [specialCopySettingId, setSpecialCopySettingId] = useState(null);

  // =========================================================
  // STATES
  // =========================================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================================================
  // LOAD SETTINGS WHEN MODAL OPENS
  // =========================================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    loadSettings();
  }, [isOpen]);

  // =========================================================
  // LOAD PAYMENT + COPY SETTINGS
  // =========================================================

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const [paymentSettings, copySettings] = await Promise.all([
        getPaymentSettings(),
        getStoryPoetryCopySettings(),
      ]);

      // =====================================================
      // PAYMENT SETTINGS
      // =====================================================

      const storySetting = paymentSettings?.find(
        (setting) =>
          setting.paymentType?.toLowerCase() === "story",
      );

      const poetrySetting = paymentSettings?.find(
        (setting) =>
          setting.paymentType?.toLowerCase() === "poetry",
      );

      const specialSetting = paymentSettings?.find(
        (setting) =>
          setting.paymentType?.toLowerCase() === "special",
      );

      setStoryPrice(storySetting?.amount ?? "");
      setPoetryPrice(poetrySetting?.amount ?? "");
      setSpecialPrice(specialSetting?.amount ?? "");

      // =====================================================
      // COPY SETTINGS
      // =====================================================

      const storyCopySetting = copySettings?.find(
        (setting) =>
          setting.type?.toLowerCase() === "story",
      );

      const poetryCopySetting = copySettings?.find(
        (setting) =>
          setting.type?.toLowerCase() === "poetry",
      );

      const specialCopySetting = copySettings?.find(
        (setting) =>
          setting.type?.toLowerCase() === "special",
      );

      setStoryFreeCopies(
        storyCopySetting?.freeCopies ?? "",
      );

      setPoetryFreeCopies(
        poetryCopySetting?.freeCopies ?? "",
      );

      setSpecialFreeCopies(
        specialCopySetting?.freeCopies ?? "",
      );

      setStoryCopySettingId(
        storyCopySetting?.storyPoetryCopySettingId ?? null,
      );

      setPoetryCopySettingId(
        poetryCopySetting?.storyPoetryCopySettingId ?? null,
      );

      setSpecialCopySettingId(
        specialCopySetting?.storyPoetryCopySettingId ?? null,
      );
    } catch (err) {
      console.error("Failed to load submission settings:", err);

      setError(
        err?.message ||
          "Failed to load submission settings.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // VALIDATE
  // =========================================================

  const validateSettings = () => {
    // -------------------------------------------------------
    // STORY PRICE
    // -------------------------------------------------------

    if (
      storyPrice === "" ||
      Number.isNaN(Number(storyPrice)) ||
      Number(storyPrice) <= 0
    ) {
      return "Please enter a valid Story price.";
    }

    // -------------------------------------------------------
    // POETRY PRICE
    // -------------------------------------------------------

    if (
      poetryPrice === "" ||
      Number.isNaN(Number(poetryPrice)) ||
      Number(poetryPrice) <= 0
    ) {
      return "Please enter a valid Poetry price.";
    }

    // -------------------------------------------------------
    // SPECIAL PRICE
    // -------------------------------------------------------

    if (
      specialPrice === "" ||
      Number.isNaN(Number(specialPrice)) ||
      Number(specialPrice) <= 0
    ) {
      return "Please enter a valid Special price.";
    }

    // -------------------------------------------------------
    // STORY FREE COPIES
    // -------------------------------------------------------

    if (String(storyFreeCopies).trim() === "") {
      return "Please enter the number of free Story copies.";
    }

    if (
      !/^\d+$/.test(
        String(storyFreeCopies).trim(),
      )
    ) {
      return "Story free copies must be a whole number.";
    }

    if (Number(storyFreeCopies) < 0) {
      return "Story free copies cannot be negative.";
    }

    // -------------------------------------------------------
    // POETRY FREE COPIES
    // -------------------------------------------------------

    if (String(poetryFreeCopies).trim() === "") {
      return "Please enter the number of free Poetry copies.";
    }

    if (
      !/^\d+$/.test(
        String(poetryFreeCopies).trim(),
      )
    ) {
      return "Poetry free copies must be a whole number.";
    }

    if (Number(poetryFreeCopies) < 0) {
      return "Poetry free copies cannot be negative.";
    }

    // -------------------------------------------------------
    // SPECIAL FREE COPIES
    // -------------------------------------------------------

    if (String(specialFreeCopies).trim() === "") {
      return "Please enter the number of free Special copies.";
    }

    if (
      !/^\d+$/.test(
        String(specialFreeCopies).trim(),
      )
    ) {
      return "Special free copies must be a whole number.";
    }

    if (Number(specialFreeCopies) < 0) {
      return "Special free copies cannot be negative.";
    }

    // -------------------------------------------------------
    // COPY SETTING IDS
    // -------------------------------------------------------

    if (!storyCopySettingId) {
      return "Story copy setting could not be found.";
    }

    if (!poetryCopySettingId) {
      return "Poetry copy setting could not be found.";
    }

    if (!specialCopySettingId) {
      return "Special copy setting could not be found.";
    }

    return null;
  };

  // =========================================================
  // SAVE
  // =========================================================

  const handleSave = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    const validationError = validateSettings();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      // =====================================================
      // UPDATE PAYMENT PRICES
      // =====================================================

      await updateSubmissionPrices({
        storyPrice: Number(storyPrice),
        poetryPrice: Number(poetryPrice),
        specialPrice: Number(specialPrice),
      });

      // =====================================================
      // UPDATE FREE COPIES
      // =====================================================

      await Promise.all([
        updateStoryPoetryCopySetting(
          storyCopySettingId,
          Number(storyFreeCopies),
        ),

        updateStoryPoetryCopySetting(
          poetryCopySettingId,
          Number(poetryFreeCopies),
        ),

        updateStoryPoetryCopySetting(
          specialCopySettingId,
          Number(specialFreeCopies),
        ),
      ]);

      // =====================================================
      // SUCCESS
      // =====================================================

      setMessage(
        "Submission prices and free copy settings updated successfully.",
      );

      // Close after short delay
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error(
        "Failed to update submission settings:",
        err,
      );

      setError(
        err?.message ||
          "Failed to update submission settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // CLOSE
  // =========================================================

  const handleClose = () => {
    if (saving) {
      return;
    }

    setError("");
    setMessage("");

    onClose();
  };

  // =========================================================
  // DON'T RENDER
  // =========================================================

  if (!isOpen) {
    return null;
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* =================================================
            HEADER
        ================================================== */}

        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Submission Settings
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Set submission prices and free copies.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="text-2xl leading-none text-gray-400 transition hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* =================================================
            BODY
        ================================================== */}

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#1b3b2b]" />
            </div>
          ) : (
            <form onSubmit={handleSave}>
              {/* =================================================
                  STORY
              ================================================== */}

              <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-gray-900">
                    Story
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Configure Story submission price and free copies.
                  </p>
                </div>

                {/* Story Price */}

                <div className="mb-4">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Submission Price
                  </label>

                  <div className="flex items-center">
                    <span className="rounded-l-lg border border-r-0 border-gray-300 bg-gray-100 px-4 py-3 text-gray-600">
                      ₹
                    </span>

                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={storyPrice}
                      onChange={(e) => {
                        setStoryPrice(e.target.value);
                        setError("");
                      }}
                      placeholder="Enter Story price"
                      disabled={saving}
                      className="w-full rounded-r-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* Story Free Copies */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Free Copies
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={storyFreeCopies}
                    onChange={(e) => {
                      setStoryFreeCopies(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter free copies"
                    disabled={saving}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600 disabled:bg-gray-100"
                  />

                  <p className="mt-1.5 text-xs text-gray-400">
                    Enter 0 if no free Story copies should be given.
                  </p>
                </div>
              </div>

              {/* =================================================
                  POETRY
              ================================================== */}

              <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-gray-900">
                    Poetry
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Configure Poetry submission price and free copies.
                  </p>
                </div>

                {/* Poetry Price */}

                <div className="mb-4">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Submission Price
                  </label>

                  <div className="flex items-center">
                    <span className="rounded-l-lg border border-r-0 border-gray-300 bg-gray-100 px-4 py-3 text-gray-600">
                      ₹
                    </span>

                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={poetryPrice}
                      onChange={(e) => {
                        setPoetryPrice(e.target.value);
                        setError("");
                      }}
                      placeholder="Enter Poetry price"
                      disabled={saving}
                      className="w-full rounded-r-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* Poetry Free Copies */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Free Copies
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={poetryFreeCopies}
                    onChange={(e) => {
                      setPoetryFreeCopies(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter free copies"
                    disabled={saving}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600 disabled:bg-gray-100"
                  />

                  <p className="mt-1.5 text-xs text-gray-400">
                    Enter 0 if no free Poetry copies should be given.
                  </p>
                </div>
              </div>

              {/* =================================================
                  SPECIAL
              ================================================== */}

              <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-gray-900">
                    Special
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Configure Special submission price and free copies.
                  </p>
                </div>

                {/* Special Price */}

                <div className="mb-4">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Submission Price
                  </label>

                  <div className="flex items-center">
                    <span className="rounded-l-lg border border-r-0 border-gray-300 bg-gray-100 px-4 py-3 text-gray-600">
                      ₹
                    </span>

                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={specialPrice}
                      onChange={(e) => {
                        setSpecialPrice(e.target.value);
                        setError("");
                      }}
                      placeholder="Enter Special price"
                      disabled={saving}
                      className="w-full rounded-r-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* Special Free Copies */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Free Copies
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={specialFreeCopies}
                    onChange={(e) => {
                      setSpecialFreeCopies(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter free copies"
                    disabled={saving}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600 disabled:bg-gray-100"
                  />

                  <p className="mt-1.5 text-xs text-gray-400">
                    Enter 0 if no free Special copies should be given.
                  </p>
                </div>
              </div>

              {/* =================================================
                  INFO
              ================================================== */}

              <p className="text-xs text-gray-500">
                Submission prices are used when creating Razorpay
                payment orders. Free copy counts determine how many
                complimentary copies are provided for each submission
                type.
              </p>

              {/* =================================================
                  ERROR
              ================================================== */}

              {error && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* =================================================
                  SUCCESS
              ================================================== */}

              {message && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {message}
                </div>
              )}

              {/* =================================================
                  BUTTONS
              ================================================== */}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#1b3b2b] px-5 py-2.5 font-semibold text-white transition hover:bg-[#143022] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Settings"}
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