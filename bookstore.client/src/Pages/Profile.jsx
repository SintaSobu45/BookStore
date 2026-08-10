import React, { useEffect, useState } from 'react';
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
  Save
} from 'lucide-react';

import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

import {
  getProfile,
  updateProfile
} from '../services/profileService';

export default function Profile() {

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [editMode, setEditMode] = useState(false);

  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });


  // =========================
  // Load Profile
  // =========================

  const loadProfile = async () => {

    try {

      setLoading(true);
      setError('');

      const data = await getProfile();

      console.log('Profile:', data);

      setProfile(data);

      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        pincode: data.pincode || ''
      });

    } catch (error) {

      console.error(
        'Failed to load profile:',
        error
      );

      setError(
        error.message || 'Failed to load profile'
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadProfile();

  }, []);


  // =========================
  // Handle Input
  // =========================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));

  };


  // =========================
  // Edit
  // =========================

  const handleEdit = () => {

    setSuccess('');
    setError('');
    setEditMode(true);

  };


  // =========================
  // Cancel
  // =========================

  const handleCancel = () => {

    setFormData({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phone: profile.phone || '',
      address: profile.address || '',
      city: profile.city || '',
      state: profile.state || '',
      pincode: profile.pincode || ''
    });

    setEditMode(false);

    setError('');
    setSuccess('');

  };


  // =========================
  // Update Profile
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setSaving(true);

      setError('');
      setSuccess('');

      const response = await updateProfile(formData);

      console.log(
        'Updated profile:',
        response
      );

      /*
        Backend returns:

        {
          message: "...",
          profile: {...}
        }
      */

      const updatedProfile =
        response.profile || response;

      setProfile(updatedProfile);

      setFormData({
        firstName: updatedProfile.firstName || '',
        lastName: updatedProfile.lastName || '',
        phone: updatedProfile.phone || '',
        address: updatedProfile.address || '',
        city: updatedProfile.city || '',
        state: updatedProfile.state || '',
        pincode: updatedProfile.pincode || ''
      });

      setEditMode(false);

      setSuccess(
        response.message ||
        'Profile updated successfully'
      );

    } catch (error) {

      console.error(
        'Failed to update profile:',
        error
      );

      setError(
        error.message ||
        'Failed to update profile'
      );

    } finally {

      setSaving(false);

    }

  };


  // =========================
  // Loading
  // =========================

  if (loading) {

    return (
      <>
        <Navbar />

        <div className="min-h-screen flex items-center justify-center bg-stone-100/60">

          <div className="flex items-center space-x-2 text-gray-500">

            <Loader2 className="h-5 w-5 animate-spin" />

            <span className="text-sm">
              Loading profile...
            </span>

          </div>

        </div>

        <Footer />
      </>
    );

  }


  // =========================
  // Error / No Profile
  // =========================

  if (error && !profile) {

    return (
      <>
        <Navbar />

        <div className="min-h-screen flex items-center justify-center bg-stone-100/60">

          <div className="text-center">

            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Unable to load profile
            </h2>

            <p className="text-sm text-red-500">
              {error}
            </p>

          </div>

        </div>

        <Footer />
      </>
    );

  }


  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-stone-100/60 py-10 px-4 sm:px-6 lg:px-8">

        <div className="max-w-5xl mx-auto">


          {/* =========================
              Header
          ========================= */}

          <div className="mb-8 flex items-center justify-between">

            <div>

              <h1 className="text-3xl font-extrabold text-gray-900">
                My Profile
              </h1>

              <p className="text-sm text-stone-500 mt-1">
                Manage your personal information
              </p>

            </div>


            {!editMode && (

              <button
                onClick={handleEdit}
                className="flex items-center space-x-2 bg-[#1b3b2b] hover:bg-emerald-950 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >

                <Pencil className="h-4 w-4" />

                <span>
                  Edit Profile
                </span>

              </button>

            )}

          </div>


          {/* =========================
              Success Message
          ========================= */}

          {success && (

            <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-medium">

              {success}

            </div>

          )}


          {/* =========================
              Error Message
          ========================= */}

          {error && profile && (

            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">

              {error}

            </div>

          )}


          {/* =========================
              Profile Card
          ========================= */}

          <div className="bg-white border border-stone-200/80 rounded-3xl shadow-sm overflow-hidden">


            {/* Profile Header */}

            <div className="bg-[#1b3b2b] px-6 sm:px-8 py-8">

              <div className="flex items-center space-x-5">

                {/* Avatar */}

                <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center shadow-md">

                  <User className="h-10 w-10 text-emerald-900" />

                </div>


                {/* Name */}

                <div>

                  <h2 className="text-2xl font-bold text-white">

                    {profile.firstName} {profile.lastName}

                  </h2>

                  <p className="text-sm text-emerald-100 mt-1">

                    {profile.email}

                  </p>

                </div>

              </div>

            </div>


            {/* =========================
                Content
            ========================= */}

            <div className="p-6 sm:p-8">


              {/* =========================
                  Edit Form
              ========================= */}

              {editMode ? (

                <form
                  onSubmit={handleSubmit}
                  className="space-y-8"
                >

                  {/* Personal Information */}

                  <div>

                    <h3 className="text-lg font-bold text-gray-900 mb-5">
                      Personal Information
                    </h3>


                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">


                      {/* First Name */}

                      <div>

                        <label className="block text-xs font-bold text-gray-700 mb-2">
                          First Name
                        </label>

                        <div className="relative">

                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />

                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            maxLength={100}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-800 focus:outline-none focus:border-emerald-800"
                          />

                        </div>

                      </div>


                      {/* Last Name */}

                      <div>

                        <label className="block text-xs font-bold text-gray-700 mb-2">
                          Last Name
                        </label>

                        <div className="relative">

                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />

                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            maxLength={100}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-800 focus:outline-none focus:border-emerald-800"
                          />

                        </div>

                      </div>


                      {/* Email - Read Only */}

                      <div>

                        <label className="block text-xs font-bold text-gray-700 mb-2">
                          Email Address
                        </label>

                        <div className="relative">

                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />

                          <input
                            type="email"
                            value={profile.email}
                            disabled
                            className="w-full bg-stone-100 border border-stone-200 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-500 cursor-not-allowed"
                          />

                        </div>

                        <p className="text-[11px] text-stone-400 mt-1">
                          Email cannot be changed.
                        </p>

                      </div>


                      {/* Phone */}

                      <div>

                        <label className="block text-xs font-bold text-gray-700 mb-2">
                          Phone Number
                        </label>

                        <div className="relative">

                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />

                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            maxLength={10}
                            pattern="[6-9][0-9]{9}"
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-800 focus:outline-none focus:border-emerald-800"
                          />

                        </div>

                        <p className="text-[11px] text-stone-400 mt-1">
                          Enter a valid 10-digit Indian phone number.
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* =========================
                      Address
                  ========================= */}

                  <div>

                    <h3 className="text-lg font-bold text-gray-900 mb-5">
                      Address Information
                    </h3>


                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">


                      {/* Address */}

                      <div className="sm:col-span-2">

                        <label className="block text-xs font-bold text-gray-700 mb-2">
                          Address
                        </label>

                        <div className="relative">

                          <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />

                          <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            maxLength={500}
                            rows={3}
                            placeholder="Enter your address"
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-800 focus:outline-none focus:border-emerald-800 resize-none"
                          />

                        </div>

                      </div>


                      {/* City */}

                      <div>

                        <label className="block text-xs font-bold text-gray-700 mb-2">
                          City
                        </label>

                        <div className="relative">

                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />

                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            maxLength={100}
                            placeholder="Enter your city"
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-800 focus:outline-none focus:border-emerald-800"
                          />

                        </div>

                      </div>


                      {/* State */}

                      <div>

                        <label className="block text-xs font-bold text-gray-700 mb-2">
                          State
                        </label>

                        <div className="relative">

                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />

                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            maxLength={100}
                            placeholder="Enter your state"
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-800 focus:outline-none focus:border-emerald-800"
                          />

                        </div>

                      </div>


                      {/* Pincode */}

                      <div>

                        <label className="block text-xs font-bold text-gray-700 mb-2">
                          Pincode
                        </label>

                        <div className="relative">

                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />

                          <input
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                            maxLength={10}
                            placeholder="Enter your pincode"
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-800 focus:outline-none focus:border-emerald-800"
                          />

                        </div>

                      </div>

                    </div>

                  </div>


                  {/* =========================
                      Action Buttons
                  ========================= */}

                  <div className="flex justify-end space-x-3 pt-4 border-t border-stone-100">

                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex items-center space-x-2 border border-stone-200 hover:bg-stone-50 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    >

                      <X className="h-4 w-4" />

                      <span>
                        Cancel
                      </span>

                    </button>


                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center space-x-2 bg-[#1b3b2b] hover:bg-emerald-950 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    >

                      {saving ? (

                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />

                          <span>
                            Saving...
                          </span>
                        </>

                      ) : (

                        <>
                          <Save className="h-4 w-4" />

                          <span>
                            Save Changes
                          </span>
                        </>

                      )}

                    </button>

                  </div>

                </form>

              ) : (

                /* =========================
                    View Mode
                ========================= */

                <>

                  {/* Personal Information */}

                  <h3 className="text-lg font-bold text-gray-900 mb-5">
                    Personal Information
                  </h3>


                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">


                    {/* First Name */}

                    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">

                      <div className="flex items-center space-x-2 mb-2">

                        <User className="h-4 w-4 text-emerald-800" />

                        <span className="text-xs font-semibold text-stone-500">
                          First Name
                        </span>

                      </div>

                      <p className="text-sm font-bold text-gray-900">
                        {profile.firstName || '-'}
                      </p>

                    </div>


                    {/* Last Name */}

                    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">

                      <div className="flex items-center space-x-2 mb-2">

                        <User className="h-4 w-4 text-emerald-800" />

                        <span className="text-xs font-semibold text-stone-500">
                          Last Name
                        </span>

                      </div>

                      <p className="text-sm font-bold text-gray-900">
                        {profile.lastName || '-'}
                      </p>

                    </div>


                    {/* Email */}

                    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">

                      <div className="flex items-center space-x-2 mb-2">

                        <Mail className="h-4 w-4 text-emerald-800" />

                        <span className="text-xs font-semibold text-stone-500">
                          Email Address
                        </span>

                      </div>

                      <p className="text-sm font-bold text-gray-900 break-all">
                        {profile.email || '-'}
                      </p>

                    </div>


                    {/* Phone */}

                    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">

                      <div className="flex items-center space-x-2 mb-2">

                        <Phone className="h-4 w-4 text-emerald-800" />

                        <span className="text-xs font-semibold text-stone-500">
                          Phone Number
                        </span>

                      </div>

                      <p className="text-sm font-bold text-gray-900">
                        {profile.phone || '-'}
                      </p>

                    </div>

                  </div>


                  {/* Address */}

                  <h3 className="text-lg font-bold text-gray-900 mt-10 mb-5">
                    Address Information
                  </h3>


                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">


                    {/* Address */}

                    <div className="sm:col-span-2 bg-stone-50 border border-stone-200 rounded-2xl p-4">

                      <div className="flex items-center space-x-2 mb-2">

                        <MapPin className="h-4 w-4 text-emerald-800" />

                        <span className="text-xs font-semibold text-stone-500">
                          Address
                        </span>

                      </div>

                      <p className="text-sm font-bold text-gray-900">
                        {profile.address || 'Not provided'}
                      </p>

                    </div>


                    {/* City */}

                    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">

                      <div className="flex items-center space-x-2 mb-2">

                        <Building2 className="h-4 w-4 text-emerald-800" />

                        <span className="text-xs font-semibold text-stone-500">
                          City
                        </span>

                      </div>

                      <p className="text-sm font-bold text-gray-900">
                        {profile.city || 'Not provided'}
                      </p>

                    </div>


                    {/* State */}

                    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">

                      <div className="flex items-center space-x-2 mb-2">

                        <MapPin className="h-4 w-4 text-emerald-800" />

                        <span className="text-xs font-semibold text-stone-500">
                          State
                        </span>

                      </div>

                      <p className="text-sm font-bold text-gray-900">
                        {profile.state || 'Not provided'}
                      </p>

                    </div>


                    {/* Pincode */}

                    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">

                      <div className="flex items-center space-x-2 mb-2">

                        <Hash className="h-4 w-4 text-emerald-800" />

                        <span className="text-xs font-semibold text-stone-500">
                          Pincode
                        </span>

                      </div>

                      <p className="text-sm font-bold text-gray-900">
                        {profile.pincode || 'Not provided'}
                      </p>

                    </div>

                  </div>

                </>

              )}

            </div>

          </div>

        </div>

      </div>

      <Footer />
    </>
  );
}