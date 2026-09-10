import React, { useEffect, useState } from "react";
import {
  getPromotionBanners,
  createPromotionBanner,
  updatePromotionBanner,
  deletePromotionBanner,
} from "../../services/promotionBannerService";

function PromotionBanners() {
  const [banners, setBanners] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    desktopImage: null,
    tabletImage: null,
    mobileImage: null,
    isActive: true,
  });

  const [previews, setPreviews] = useState({
    desktop: null,
    tablet: null,
    mobile: null,
  });

  // =========================================================
  // LOAD BANNERS
  // =========================================================

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getPromotionBanners();

      setBanners(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load promotion banners.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // HANDLE FILE CHANGE
  // =========================================================

  const handleFileChange = (e, field, previewField) => {
    const file = e.target.files?.[0] || null;

    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));

    if (file) {
      setPreviews((prev) => ({
        ...prev,
        [previewField]: URL.createObjectURL(file),
      }));
    }
  };

  // =========================================================
  // HANDLE ACTIVE
  // =========================================================

  const handleActiveChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      isActive: e.target.checked,
    }));
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setFormData({
      desktopImage: null,
      tabletImage: null,
      mobileImage: null,
      isActive: true,
    });

    setPreviews({
      desktop: null,
      tablet: null,
      mobile: null,
    });

    setEditingId(null);
    setEditMode(false);
    setShowForm(false);
  };

  // =========================================================
  // CREATE
  // =========================================================

  const handleCreate = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.desktopImage ||
      !formData.tabletImage ||
      !formData.mobileImage
    ) {
      setError("Please upload all three banner images.");
      return;
    }

    try {
      setSaving(true);

      const data = new FormData();

      data.append("DesktopImage", formData.desktopImage);
      data.append("TabletImage", formData.tabletImage);
      data.append("MobileImage", formData.mobileImage);
      data.append("IsActive", formData.isActive);

      const result = await createPromotionBanner(data);

      setSuccess(
        result?.message || "Promotion banner created successfully."
      );

      resetForm();
      await loadBanners();
    } catch (err) {
      setError(err.message || "Failed to create promotion banner.");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (banner) => {
    setEditingId(banner.promotionBannerId);

    setFormData({
      desktopImage: null,
      tabletImage: null,
      mobileImage: null,
      isActive: banner.isActive,
    });

    setPreviews({
      desktop: banner.desktopImageUrl,
      tablet: banner.tabletImageUrl,
      mobile: banner.mobileImageUrl,
    });

    setEditMode(true);
    setShowForm(true);

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // UPDATE
  // =========================================================

  const handleUpdate = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      setSaving(true);

      const data = new FormData();

      if (formData.desktopImage) {
        data.append("DesktopImage", formData.desktopImage);
      }

      if (formData.tabletImage) {
        data.append("TabletImage", formData.tabletImage);
      }

      if (formData.mobileImage) {
        data.append("MobileImage", formData.mobileImage);
      }

      data.append("IsActive", formData.isActive);

      const result = await updatePromotionBanner(
        editingId,
        data
      );

      setSuccess(
        result?.message || "Promotion banner updated successfully."
      );

      resetForm();
      await loadBanners();
    } catch (err) {
      setError(err.message || "Failed to update promotion banner.");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this promotion banner?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const result = await deletePromotionBanner(id);

      setSuccess(
        result?.message || "Promotion banner deleted successfully."
      );

      await loadBanners();
    } catch (err) {
      setError(err.message || "Failed to delete promotion banner.");
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-6 mt-5">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Promotion Banners
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage promotional banners displayed on the storefront.
          </p>
        </div>

        <button
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setEditMode(false);
              setEditingId(null);
              setShowForm(true);
            }
          }}
          className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
        >
          {showForm ? "Close" : "+ Add Promotion Banner"}
        </button>
      </div>

      {/* MESSAGES */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium">
          {success}
        </div>
      )}

      {/* FORM */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">
              {editMode
                ? "Edit Promotion Banner"
                : "Create Promotion Banner"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Upload separate images optimized for each device screen size.
            </p>
          </div>

          <form
            onSubmit={editMode ? handleUpdate : handleCreate}
            className="p-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* DESKTOP */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Desktop Image
                  </label>
                  <span className="text-[10px] bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full">
                    1920×500 (Landscape)
                  </span>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  required={!editMode}
                  onChange={(e) =>
                    handleFileChange(
                      e,
                      "desktopImage",
                      "desktop"
                    )
                  }
                  className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm cursor-pointer"
                />

                {previews.desktop && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 bg-gray-900/5 p-2 text-center">
                    <img
                      src={previews.desktop}
                      alt="Desktop preview"
                      className="w-full h-auto max-h-48 object-contain rounded-lg mx-auto"
                    />
                  </div>
                )}

                {editMode && (
                  <p className="text-xs text-gray-400 mt-2">
                    Leave empty to keep the existing image.
                  </p>
                )}
              </div>

              {/* TABLET */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Tablet Image
                  </label>
                  <span className="text-[10px] bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full">
                    1024×400 (Wide)
                  </span>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  required={!editMode}
                  onChange={(e) =>
                    handleFileChange(
                      e,
                      "tabletImage",
                      "tablet"
                    )
                  }
                  className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm cursor-pointer"
                />

                {previews.tablet && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 bg-gray-900/5 p-2 text-center">
                    <img
                      src={previews.tablet}
                      alt="Tablet preview"
                      className="w-full h-auto max-h-48 object-contain rounded-lg mx-auto"
                    />
                  </div>
                )}

                {editMode && (
                  <p className="text-xs text-gray-400 mt-2">
                    Leave empty to keep the existing image.
                  </p>
                )}
              </div>

              {/* MOBILE */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Mobile Image
                  </label>
                  <span className="text-[10px] bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full">
                    800×800 (Square/Portrait)
                  </span>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  required={!editMode}
                  onChange={(e) =>
                    handleFileChange(
                      e,
                      "mobileImage",
                      "mobile"
                    )
                  }
                  className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm cursor-pointer"
                />

                {previews.mobile && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 bg-gray-900/5 p-2 text-center">
                    <img
                      src={previews.mobile}
                      alt="Mobile preview"
                      className="w-full h-auto max-h-48 object-contain rounded-lg mx-auto"
                    />
                  </div>
                )}

                {editMode && (
                  <p className="text-xs text-gray-400 mt-2">
                    Leave empty to keep the existing image.
                  </p>
                )}
              </div>
            </div>

            {/* ACTIVE */}
            <div className="mt-6">
              <label className="inline-flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={handleActiveChange}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm font-semibold text-gray-700">
                  Active Banner
                </span>
              </label>

              <p className="text-xs text-gray-400 mt-1">
                Maximum 3 banners can be active at the same time.
              </p>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-3 mt-7 pt-5 border-t border-gray-100">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white rounded-xl text-sm font-semibold"
              >
                {saving
                  ? "Saving..."
                  : editMode
                    ? "Save Changes"
                    : "Create Banner"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* BANNER LIST */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            All Promotion Banners
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {banners.length} banner
            {banners.length !== 1 ? "s" : ""}
          </p>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          </div>
        ) : banners.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-5xl mb-4">🖼️</div>
            <h3 className="font-semibold text-gray-900">
              No promotion banners
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Create your first promotional banner.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {banners.map((banner) => (
              <div
                key={banner.promotionBannerId}
                className="p-5 sm:p-6"
              >
                {/* STATUS */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        banner.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          banner.isActive
                            ? "bg-emerald-500"
                            : "bg-gray-400"
                        }`}
                      />
                      {banner.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(
                          banner.promotionBannerId
                        )
                      }
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* PREVIEWS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">
                      Desktop
                    </p>
                    <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-900/5 p-2 text-center">
                      <img
                        src={banner.desktopImageUrl}
                        alt="Desktop banner"
                        className="w-full h-auto max-h-40 object-contain rounded-lg mx-auto"
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">
                      Tablet
                    </p>
                    <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-900/5 p-2 text-center">
                      <img
                        src={banner.tabletImageUrl}
                        alt="Tablet banner"
                        className="w-full h-auto max-h-40 object-contain rounded-lg mx-auto"
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">
                      Mobile
                    </p>
                    <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-900/5 p-2 text-center">
                      <img
                        src={banner.mobileImageUrl}
                        alt="Mobile banner"
                        className="w-full h-auto max-h-40 object-contain rounded-lg mx-auto"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PromotionBanners;