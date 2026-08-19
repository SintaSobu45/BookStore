import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Hash,
  Loader2,
  Pencil,
  X,
  Save,
  Camera,
  Languages,
} from "lucide-react";

import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

import {
  getProfile,
  updateProfile,
  uploadProfileImage,
} from "../services/profileService";

// =========================================================
// INPUT FIELD
// IMPORTANT:
// This component is OUTSIDE Profile so it won't remount
// every time formData changes.
// =========================================================

const InputField = ({
  label,
  name,
  value,
  icon: Icon,
  placeholder,
  required = false,
  maxLength,
  type = "text",
  onChange,
}) => {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-700 mb-2">
        {label}

        {required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>

      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-800 focus:outline-none focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800/20 transition"
        />
      </div>
    </div>
  );
};

// =========================================================
// TEXTAREA FIELD
// =========================================================

const TextareaField = ({
  label,
  name,
  value,
  icon: Icon,
  placeholder,
  maxLength,
  onChange,
}) => {
  return (
    <div className="sm:col-span-2">
      <label className="block text-xs font-bold text-gray-700 mb-2">
        {label}
      </label>

      <div className="relative">
        <Icon className="absolute left-3 top-3.5 h-4 w-4 text-stone-400 pointer-events-none" />

        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={3}
          className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-800 focus:outline-none focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800/20 resize-none transition"
        />
      </div>
    </div>
  );
};

// =========================================================
// INFO CARD
// =========================================================

const InfoCard = ({
  icon: Icon,
  label,
  value,
  fullWidth = false,
}) => {
  return (
    <div
      className={`bg-stone-50 border border-stone-200 rounded-2xl p-4 ${
        fullWidth ? "sm:col-span-2" : ""
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-emerald-800 shrink-0" />

        <span className="text-xs font-semibold text-stone-500">
          {label}
        </span>
      </div>

      <p className="text-sm font-bold text-gray-900 break-words whitespace-pre-wrap">
        {value || "Not provided"}
      </p>
    </div>
  );
};

// =========================================================
// PROFILE
// =========================================================

export default function Profile() {
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [editMode, setEditMode] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // FORM DATA
  // Matches GetProfileResponse from backend
  // =========================================================

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    state: "",
    pincode: "",

    nameMalayalam: "",
    addressMalayalam: "",
    cityMalayalam: "",
    districtMalayalam: "",
    stateMalayalam: "",
  });

  // =========================================================
  // CREATE FORM DATA FROM PROFILE
  // =========================================================

  const createFormData = (data) => {
    return {
      name: data?.name || "",
      phone: data?.phone || "",
      address: data?.address || "",
      city: data?.city || "",
      district: data?.district || "",
      state: data?.state || "",
      pincode: data?.pincode || "",

      nameMalayalam: data?.nameMalayalam || "",
      addressMalayalam: data?.addressMalayalam || "",
      cityMalayalam: data?.cityMalayalam || "",
      districtMalayalam: data?.districtMalayalam || "",
      stateMalayalam: data?.stateMalayalam || "",
    };
  };

  // =========================================================
  // LOAD PROFILE
  // =========================================================

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getProfile();

      console.log("Profile:", data);

      setProfile(data);

      setFormData(createFormData(data));
    } catch (error) {
      console.error("Failed to load profile:", error);

      setError(
        error.message || "Failed to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = () => {
    setError("");
    setSuccess("");
    setEditMode(true);
  };

  // =========================================================
  // CANCEL
  // =========================================================

  const handleCancel = () => {
    setFormData(createFormData(profile));

    setEditMode(false);
    setError("");
    setSuccess("");
  };

  // =========================================================
  // UPDATE PROFILE
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await updateProfile(formData);

      console.log("Updated profile:", response);

      const updatedProfile =
        response.profile || response;

      setProfile(updatedProfile);

      setFormData(createFormData(updatedProfile));

      setEditMode(false);

      setSuccess(
        response.message ||
          "Profile updated successfully."
      );
    } catch (error) {
      console.error(
        "Failed to update profile:",
        error
      );

      setError(
        error.message ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // UPLOAD PROFILE IMAGE
  // =========================================================

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Only images
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      e.target.value = "";
      return;
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Image size must be less than 5MB."
      );
      e.target.value = "";
      return;
    }

    try {
      setUploadingImage(true);
      setError("");
      setSuccess("");

      const response =
        await uploadProfileImage(file);

      console.log(
        "Uploaded profile image:",
        response
      );

      const updatedProfile =
        response.profile || response;

      setProfile(updatedProfile);

      setFormData(createFormData(updatedProfile));

      setSuccess(
        response.message ||
          "Profile image updated successfully."
      );
    } catch (error) {
      console.error(
        "Failed to upload profile image:",
        error
      );

      setError(
        error.message ||
          "Failed to upload profile image."
      );
    } finally {
      setUploadingImage(false);

      // Allow selecting the same image again
      e.target.value = "";
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-stone-100/60 px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white border border-stone-200 rounded-3xl shadow-sm overflow-hidden">

              {/* Header Skeleton */}

              <div className="bg-[#1b3b2b] px-5 sm:px-8 py-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">

                  <div className="w-20 h-20 rounded-full bg-white/20 animate-pulse shrink-0" />

                  <div className="flex-1 w-full text-center sm:text-left">
                    <div className="h-6 w-40 bg-white/20 rounded-lg animate-pulse mx-auto sm:mx-0" />

                    <div className="h-4 w-52 bg-white/15 rounded-lg animate-pulse mt-3 mx-auto sm:mx-0" />
                  </div>

                </div>
              </div>

              {/* Content Skeleton */}

              <div className="p-5 sm:p-8">

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 text-emerald-800 animate-spin" />
                  </div>

                  <div>
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />

                    <div className="h-3 w-44 bg-gray-100 rounded animate-pulse mt-2" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(
                    (item) => (
                      <div
                        key={item}
                        className="border border-gray-100 bg-gray-50 rounded-2xl p-4"
                      >
                        <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mb-3" />

                        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                      </div>
                    )
                  )}
                </div>

                <div className="flex justify-center mt-8">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="h-5 w-5 text-emerald-800 animate-spin" />

                    <span className="text-sm font-medium">
                      Loading profile...
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error && !profile) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen flex items-center justify-center bg-stone-100/60 px-4">
          <div className="text-center max-w-md">

            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-red-500" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Unable to load profile
            </h2>

            <p className="text-sm text-red-500 break-words">
              {error}
            </p>

          </div>
        </main>

        <Footer />
      </>
    );
  }

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-stone-100/60 py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                My Profile
              </h1>

              <p className="text-sm text-stone-500 mt-1">
                Manage your personal information
              </p>
            </div>

            {!editMode && (
              <button
                onClick={handleEdit}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1b3b2b] hover:bg-emerald-950 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                <Pencil className="h-4 w-4" />

                <span>Edit Profile</span>
              </button>
            )}

          </div>

          {/* =================================================
              SUCCESS MESSAGE
          ================================================= */}

          {success && (
            <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-medium">
              {success}
            </div>
          )}

          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {error && profile && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {/* =================================================
              PROFILE CARD
          ================================================= */}

          <div className="bg-white border border-stone-200/80 rounded-3xl shadow-sm overflow-hidden">

            {/* =================================================
                PROFILE HEADER
            ================================================= */}

            <div className="bg-[#1b3b2b] px-5 sm:px-8 py-7 sm:py-8">

              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5">

                {/* PROFILE IMAGE */}

                <div className="relative h-20 w-20 shrink-0">

                  {profile.profileImageUrl ? (
                    <img
                      src={profile.profileImageUrl}
                      alt="Profile"
                      className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-md"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center shadow-md">
                      <User className="h-10 w-10 text-emerald-900" />
                    </div>
                  )}

                  {/* CAMERA BUTTON */}

                  <label
                    htmlFor="profile-image-upload"
                    className="absolute bottom-0 right-0 h-7 w-7 bg-white text-emerald-900 rounded-full flex items-center justify-center shadow-md cursor-pointer hover:bg-emerald-50 transition"
                  >
                    {uploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </label>

                  <input
                    id="profile-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />

                </div>

                {/* USER NAME */}

                <div className="text-center sm:text-left min-w-0">

                  <h2 className="text-xl sm:text-2xl font-bold text-white break-words">
                    {profile.name || "User"}
                  </h2>

                  <p className="text-sm text-emerald-100 mt-1 break-all">
                    {profile.email}
                  </p>

                </div>

              </div>

            </div>

            {/* =================================================
                CONTENT
            ================================================= */}

            <div className="p-5 sm:p-8">

              {editMode ? (

                // =================================================
                // EDIT MODE
                // =================================================

                <form
                  onSubmit={handleSubmit}
                  className="space-y-10"
                >

                  {/* =================================================
                      PERSONAL INFORMATION
                  ================================================= */}

                  <section>

                    <div className="mb-5">
                      <h3 className="text-lg font-bold text-gray-900">
                        Personal Information
                      </h3>

                      <p className="text-xs text-stone-500 mt-1">
                        Update your basic account information.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                      {/* NAME */}

                      <InputField
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        icon={User}
                        placeholder="Enter your full name"
                        required
                        maxLength={200}
                        onChange={handleChange}
                      />

                      {/* EMAIL */}

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2">
                          Email Address
                        </label>

                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />

                          <input
                            type="email"
                            value={profile.email || ""}
                            disabled
                            className="w-full bg-stone-100 border border-stone-200 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-500 cursor-not-allowed"
                          />
                        </div>

                        <p className="text-[11px] text-stone-400 mt-1">
                          Email cannot be changed.
                        </p>
                      </div>

                      {/* PHONE */}

                      <InputField
                        label="Phone Number"
                        name="phone"
                        value={formData.phone}
                        icon={Phone}
                        placeholder="Enter 10-digit phone number"
                        required
                        maxLength={10}
                        type="tel"
                        onChange={handleChange}
                      />

                    </div>

                  </section>

                  {/* =================================================
                      ADDRESS INFORMATION
                  ================================================= */}

                  <section>

                    <div className="mb-5">
                      <h3 className="text-lg font-bold text-gray-900">
                        Address Information
                      </h3>

                      <p className="text-xs text-stone-500 mt-1">
                        Add your location and contact address.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                      {/* ADDRESS */}

                      <TextareaField
                        label="Address"
                        name="address"
                        value={formData.address}
                        icon={MapPin}
                        placeholder="Enter your address"
                        maxLength={500}
                        onChange={handleChange}
                      />

                      {/* CITY */}

                      <InputField
                        label="City"
                        name="city"
                        value={formData.city}
                        icon={Building2}
                        placeholder="Enter your city"
                        maxLength={100}
                        onChange={handleChange}
                      />

                      {/* DISTRICT */}

                      <InputField
                        label="District"
                        name="district"
                        value={formData.district}
                        icon={MapPin}
                        placeholder="Enter your district"
                        maxLength={100}
                        onChange={handleChange}
                      />

                      {/* STATE */}

                      <InputField
                        label="State"
                        name="state"
                        value={formData.state}
                        icon={MapPin}
                        placeholder="Enter your state"
                        maxLength={100}
                        onChange={handleChange}
                      />

                      {/* PINCODE */}

                      <InputField
                        label="Pincode"
                        name="pincode"
                        value={formData.pincode}
                        icon={Hash}
                        placeholder="Enter your pincode"
                        maxLength={10}
                        type="text"
                        onChange={handleChange}
                      />

                    </div>

                  </section>

                  {/* =================================================
                      MALAYALAM DETAILS
                  ================================================= */}

                  <section>

                    <div className="mb-5">

                      <div className="flex items-center gap-3">

                        <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                          <Languages className="h-5 w-5 text-emerald-900" />
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Malayalam Details
                          </h3>

                          <p className="text-xs text-stone-500 mt-1">
                            Add your information in Malayalam.
                          </p>
                        </div>

                      </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                      {/* MALAYALAM NAME */}

                      <InputField
                        label="Name in Malayalam"
                        name="nameMalayalam"
                        value={formData.nameMalayalam}
                        icon={User}
                        placeholder="മലയാളത്തിൽ പേര്"
                        maxLength={200}
                        onChange={handleChange}
                      />

                      {/* MALAYALAM CITY */}

                      <InputField
                        label="City in Malayalam"
                        name="cityMalayalam"
                        value={formData.cityMalayalam}
                        icon={Building2}
                        placeholder="നഗരം"
                        maxLength={100}
                        onChange={handleChange}
                      />

                      {/* MALAYALAM DISTRICT */}

                      <InputField
                        label="District in Malayalam"
                        name="districtMalayalam"
                        value={formData.districtMalayalam}
                        icon={MapPin}
                        placeholder="ജില്ല"
                        maxLength={100}
                        onChange={handleChange}
                      />

                      {/* MALAYALAM STATE */}

                      <InputField
                        label="State in Malayalam"
                        name="stateMalayalam"
                        value={formData.stateMalayalam}
                        icon={MapPin}
                        placeholder="സംസ്ഥാനം"
                        maxLength={100}
                        onChange={handleChange}
                      />

                      {/* MALAYALAM ADDRESS */}

                      <TextareaField
                        label="Address in Malayalam"
                        name="addressMalayalam"
                        value={formData.addressMalayalam}
                        icon={MapPin}
                        placeholder="വിലാസം മലയാളത്തിൽ"
                        maxLength={500}
                        onChange={handleChange}
                      />

                    </div>

                  </section>

                  {/* =================================================
                      ACTION BUTTONS
                  ================================================= */}

                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-5 border-t border-stone-100">

                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={saving}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 border border-stone-200 hover:bg-stone-50 text-gray-700 px-5 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <X className="h-4 w-4 shrink-0" />

                      <span>
                        Cancel
                      </span>
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1b3b2b] hover:bg-emerald-950 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin shrink-0" />

                          <span>
                            Saving...
                          </span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 shrink-0" />

                          <span>
                            Save Changes
                          </span>
                        </>
                      )}
                    </button>

                  </div>

                </form>

              ) : (

                // =================================================
                // VIEW MODE
                // =================================================

                <div className="space-y-10">

                  {/* =================================================
                      PERSONAL INFORMATION
                  ================================================= */}

                  <section>

                    <h3 className="text-lg font-bold text-gray-900 mb-5">
                      Personal Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                      <InfoCard
                        icon={User}
                        label="Full Name"
                        value={profile.name}
                      />

                      <InfoCard
                        icon={Mail}
                        label="Email Address"
                        value={profile.email}
                      />

                      <InfoCard
                        icon={Phone}
                        label="Phone Number"
                        value={profile.phone}
                      />

                    </div>

                  </section>

                  {/* =================================================
                      ADDRESS INFORMATION
                  ================================================= */}

                  <section>

                    <h3 className="text-lg font-bold text-gray-900 mb-5">
                      Address Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                      <InfoCard
                        icon={MapPin}
                        label="Address"
                        value={profile.address}
                        fullWidth
                      />

                      <InfoCard
                        icon={Building2}
                        label="City"
                        value={profile.city}
                      />

                      <InfoCard
                        icon={MapPin}
                        label="District"
                        value={profile.district}
                      />

                      <InfoCard
                        icon={MapPin}
                        label="State"
                        value={profile.state}
                      />

                      <InfoCard
                        icon={Hash}
                        label="Pincode"
                        value={profile.pincode}
                      />

                    </div>

                  </section>

                  {/* =================================================
                      MALAYALAM INFORMATION
                  ================================================= */}

                  <section>

                    <div className="flex items-center gap-3 mb-5">

                      <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                        <Languages className="h-5 w-5 text-emerald-900" />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Malayalam Details
                        </h3>

                        <p className="text-xs text-stone-500">
                          Your profile information in Malayalam.
                        </p>
                      </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                      <InfoCard
                        icon={User}
                        label="Name"
                        value={profile.nameMalayalam}
                      />

                      <InfoCard
                        icon={Building2}
                        label="City"
                        value={profile.cityMalayalam}
                      />

                      <InfoCard
                        icon={MapPin}
                        label="District"
                        value={profile.districtMalayalam}
                      />

                      <InfoCard
                        icon={MapPin}
                        label="State"
                        value={profile.stateMalayalam}
                      />

                      <InfoCard
                        icon={MapPin}
                        label="Address"
                        value={profile.addressMalayalam}
                        fullWidth
                      />

                    </div>

                  </section>

                </div>
              )}

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}