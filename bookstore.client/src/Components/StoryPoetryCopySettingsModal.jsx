import { useEffect, useState } from "react";
import {
  getStoryPoetryCopySettings,
  updateStoryPoetryCopySetting,
} from "../services/storyPoetryService";

const StoryPoetryCopySettingsModal = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editingSetting, setEditingSetting] = useState(null);
  const [freeCopies, setFreeCopies] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // LOAD SETTINGS
  // =========================================================

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getStoryPoetryCopySettings();

      setSettings(data);
    } catch (err) {
      console.error("Failed to load copy settings:", err);

      setError(
        err?.message || "Failed to load copy settings.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD WHEN MODAL OPENS
  // =========================================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSuccess("");
    setError("");

    loadSettings();
  }, [isOpen]);

  // =========================================================
  // CLOSE
  // =========================================================

  const handleClose = () => {
    if (saving) {
      return;
    }

    setEditingSetting(null);
    setFreeCopies("");
    setError("");
    setSuccess("");

    onClose();
  };

  // =========================================================
  // START EDIT
  // =========================================================

  const handleEdit = (setting) => {
    setEditingSetting(setting);
    setFreeCopies(String(setting.freeCopies));

    setError("");
    setSuccess("");
  };

  // =========================================================
  // CANCEL EDIT
  // =========================================================

  const handleCancelEdit = () => {
    if (saving) {
      return;
    }

    setEditingSetting(null);
    setFreeCopies("");
    setError("");
  };

  // =========================================================
  // VALIDATE
  // =========================================================

  const validateFreeCopies = () => {
    if (freeCopies.trim() === "") {
      return "Free copies cannot be empty.";
    }

    if (!/^\d+$/.test(freeCopies.trim())) {
      return "Free copies must be a valid number.";
    }

    const value = Number(freeCopies);

    if (!Number.isInteger(value)) {
      return "Free copies must be a whole number.";
    }

    if (value < 0) {
      return "Free copies cannot be negative.";
    }

    return null;
  };

  // =========================================================
  // SAVE
  // =========================================================

  const handleSave = async () => {
    if (!editingSetting) {
      return;
    }

    const validationError = validateFreeCopies();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const value = Number(freeCopies.trim());

      await updateStoryPoetryCopySetting(
        editingSetting.storyPoetryCopySettingId,
        value,
      );

      setSuccess(
        `${editingSetting.type} free copies updated successfully.`,
      );

      setEditingSetting(null);
      setFreeCopies("");

      // Refresh values from backend
      await loadSettings();

      // Automatically clear success message
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Failed to update copy setting:", err);

      setError(
        err?.message || "Failed to update copy setting.",
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DON'T RENDER
  // =========================================================

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Story / Poetry Copy Settings
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              Manage the number of free copies given for each
              submission type.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* ===================================================
            BODY
        =================================================== */}

        <div className="p-6">
          {/* SUCCESS */}

          {success && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              {success}
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-emerald-900" />
            </div>
          ) : (
            <div className="space-y-3">
              {settings.map((setting) => (
                <div
                  key={setting.storyPoetryCopySettingId}
                  className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-5 py-4"
                >
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
                      Type
                    </p>

                    <p className="mt-1 text-base font-bold text-gray-900">
                      {setting.type}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
                      Current Free Copies
                    </p>

                    <p className="mt-1 text-lg font-bold text-emerald-900">
                      {setting.freeCopies}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleEdit(setting)}
                    className="rounded-lg border border-emerald-900 px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <div className="flex justify-end border-t border-stone-200 px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="rounded-xl border border-stone-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {editingSetting && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4"
          onClick={() => {
            if (!saving) {
              handleCancelEdit();
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}

            <div className="mb-5">
              <h3 className="text-lg font-bold text-gray-900">
                Edit {editingSetting.type}
              </h3>

              <p className="mt-1 text-sm text-stone-500">
                Only the free copy count can be changed.
              </p>
            </div>

            {/* TYPE */}

            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Type
              </label>

              <div className="rounded-xl border border-stone-200 bg-stone-100 px-4 py-3 text-sm font-medium text-gray-600">
                {editingSetting.type}
              </div>
            </div>

            {/* FREE COPIES */}

            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Free Copies
              </label>

              <input
                type="number"
                min="0"
                step="1"
                value={freeCopies}
                onChange={(e) => {
                  setFreeCopies(e.target.value);
                  setError("");
                }}
                placeholder="Enter free copies"
                disabled={saving}
                autoFocus
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-900 focus:ring-2 focus:ring-emerald-900/10 disabled:bg-stone-100"
              />

              <p className="mt-1.5 text-xs text-stone-400">
                Enter 0 if no free copies should be given.
              </p>
            </div>

            {/* ACTIONS */}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="rounded-xl border border-stone-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-emerald-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryPoetryCopySettingsModal;