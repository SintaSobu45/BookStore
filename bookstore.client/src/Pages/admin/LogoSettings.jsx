import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  Upload,
  X,
  RefreshCw,
  CheckCircle,
} from "lucide-react";

import {
  getLogo,
  addLogo,
  replaceLogo,
} from "../../services/logoService";

function LogoSettings({ isOpen, onClose }) {
  const [logo, setLogo] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  // =========================================================
  // LOAD CURRENT LOGO
  // =========================================================

  const loadLogo = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getLogo();

      setLogo(data);
    } catch (err) {
      console.error("Logo loading failed:", err);
      setError("Failed to load current logo.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD LOGO WHEN MODAL OPENS
  // =========================================================

  useEffect(() => {
    if (isOpen) {
      loadLogo();

      setSelectedImage(null);
      setMessage("");
      setError("");
    }
  }, [isOpen]);

  // =========================================================
  // SELECT IMAGE
  // =========================================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("Image size must be less than 20 MB.");
      return;
    }

    setSelectedImage(file);
    setMessage("");
    setError("");
  };

  // =========================================================
  // SAVE LOGO
  // =========================================================

  const handleSave = async () => {
    if (!selectedImage) {
      setError("Please select a logo image.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      let data;

      // -------------------------------------------------------
      // ADD NEW LOGO
      // -------------------------------------------------------

      if (!logo) {
        data = await addLogo(selectedImage);
      }

      // -------------------------------------------------------
      // REPLACE EXISTING LOGO
      // -------------------------------------------------------

      else {
        data = await replaceLogo(logo.logoId, selectedImage);
      }

      setLogo(data.logo);
      setSelectedImage(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setMessage(
        logo
          ? "Logo replaced successfully."
          : "Logo uploaded successfully.",
      );
    } catch (err) {
      console.error("Logo save failed:", err);

      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // PREVIEW URL
  // =========================================================

  const previewUrl = selectedImage
    ? URL.createObjectURL(selectedImage)
    : logo?.imageUrl;

  // =========================================================
  // MODAL
  // =========================================================

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* =================================================
            HEADER
        ================================================== */}

        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Logo Settings
            </h2>

            <p className="text-xs text-stone-500 mt-1">
              Upload or replace your website logo.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-stone-100 transition"
          >
            <X className="h-5 w-5 text-stone-500" />
          </button>
        </div>

        {/* =================================================
            BODY
        ================================================== */}

        <div className="p-5">

          {loading ? (
            <div className="py-12 text-center">

              <RefreshCw className="h-7 w-7 animate-spin mx-auto text-[#1b3b2b]" />

              <p className="text-sm text-stone-500 mt-3">
                Loading logo...
              </p>

            </div>
          ) : (
            <>
              {/* =================================================
                  LOGO PREVIEW
              ================================================== */}

              <div className="border border-dashed border-stone-300 rounded-2xl p-6 bg-stone-50">

                {previewUrl ? (
                  <div className="flex flex-col items-center">

                    <img
                      src={previewUrl}
                      alt="Logo preview"
                      className="max-h-32 max-w-full object-contain"
                    />

                    {selectedImage && (
                      <p className="text-xs text-emerald-700 font-semibold mt-3">
                        New logo selected
                      </p>
                    )}

                  </div>
                ) : (
                  <div className="py-8 text-center">

                    <Image className="h-10 w-10 mx-auto text-stone-300" />

                    <p className="font-semibold text-gray-700 mt-3">
                      No logo uploaded
                    </p>

                    <p className="text-xs text-stone-400 mt-1">
                      Select an image below to upload your logo.
                    </p>

                  </div>
                )}

              </div>

              {/* =================================================
                  FILE SELECT
              ================================================== */}

              <div className="mt-5">

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 font-semibold text-sm text-gray-700 transition"
                >
                  <Upload className="h-4 w-4" />

                  {logo ? "Choose New Logo" : "Choose Logo"}
                </button>

                {selectedImage && (
                  <p className="text-xs text-stone-500 mt-2 text-center">
                    {selectedImage.name}
                  </p>
                )}

              </div>

              {/* =================================================
                  SUCCESS MESSAGE
              ================================================== */}

              {message && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">

                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />

                  <p className="text-xs font-semibold text-emerald-700">
                    {message}
                  </p>

                </div>
              )}

              {/* =================================================
                  ERROR MESSAGE
              ================================================== */}

              {error && (
                <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3">

                  <p className="text-xs font-semibold text-red-700">
                    {error}
                  </p>

                </div>
              )}

              {/* =================================================
                  SAVE BUTTON
              ================================================== */}

              <button
                type="button"
                onClick={handleSave}
                disabled={!selectedImage || saving}
                className="w-full mt-5 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1b3b2b] text-white font-bold text-sm hover:bg-[#143022] disabled:opacity-50 disabled:cursor-not-allowed transition"
              >

                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />

                    {logo
                      ? "Replacing..."
                      : "Uploading..."}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />

                    {logo
                      ? "Replace Logo"
                      : "Upload Logo"}
                  </>
                )}

              </button>

            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default LogoSettings;