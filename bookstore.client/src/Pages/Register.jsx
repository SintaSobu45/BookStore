import React, { useState } from 'react';
import {
  User, Mail, Phone, Lock, Eye, EyeOff,
  BookOpen, Users, Award, ShieldCheck
} from 'lucide-react';
import Navbar from '../Components/Navbar';
import { Link, useNavigate } from 'react-router-dom';

import { registerUser } from '../services/authService';

export default function Register() {

  const navigate = useNavigate();

  // =========================
  // Form State
  // =========================

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // =========================
  // UI State
  // =========================

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // =========================
  // Handle Input
  // =========================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    setError('');
  };

  // =========================
  // Register
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');
    setSuccess('');

    // -------------------------
    // Required Fields
    // -------------------------

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError('Please fill in all required fields.');
      return;
    }

    // -------------------------
    // Password Match
    // -------------------------

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // -------------------------
    // Password Length
    // -------------------------

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    // -------------------------
    // Phone Validation
    // Backend:
    // ^[6-9]\d{9}$
    // -------------------------

    const phoneRegex = /^[6-9]\d{9}$/;

    if (!phoneRegex.test(formData.phone)) {
      setError(
        'Phone number must be 10 digits and start with 6, 7, 8, or 9.'
      );
      return;
    }

    // -------------------------
    // Terms
    // -------------------------

    if (!agreed) {
      setError(
        'Please agree to the Terms & Conditions and Privacy Policy.'
      );
      return;
    }

    try {

      setLoading(true);

      // IMPORTANT:
      // Do not send confirmPassword to backend.
      // Backend only expects these 5 fields.

      const registerData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      };

      console.log('Register data:', registerData);

      const response = await registerUser(registerData);

      console.log('Registration response:', response);

      setSuccess('Account created successfully!');

      // Redirect to login after successful registration

      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (error) {

      console.error('Registration failed:', error);

      setError(
        error.message || 'Registration failed. Please try again.'
      );

    } finally {

      setLoading(false);

    }
  };


  return (
    <>

      <Navbar />

      <div className="min-h-screen bg-stone-100/60 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">

        <div className="max-w-7xl w-full bg-white border border-stone-200/80 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">

          {/* =========================================
              Left Column
          ========================================= */}

          <div
            className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between border-r border-stone-200/80 relative overflow-hidden bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80')`
            }}
          >

            <div className="space-y-8 z-10">

              <div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-green-900 tracking-tight mb-3">
                  Join Our Community
                </h2>

                <p className="text-sm text-stone-900 font-medium leading-relaxed">
                  Create your account and start sharing your stories, poems and ideas with the world.
                </p>

              </div>


              {/* Feature List */}

              <div className="space-y-5">

                <div className="flex items-start space-x-4 bg-white/60 backdrop-blur-sm p-3.5 rounded-2xl border border-stone-200/50 shadow-sm">

                  <div className="bg-[#1b3b2b] text-white p-2.5 rounded-xl shrink-0 shadow-sm">
                    <BookOpen className="h-4 w-4" />
                  </div>

                  <div>

                    <h4 className="font-bold text-gray-900 text-sm">
                      Share Your Creativity
                    </h4>

                    <p className="text-xs text-stone-600">
                      Publish your poems and stories
                    </p>

                  </div>

                </div>


                <div className="flex items-start space-x-4 bg-white/60 backdrop-blur-sm p-3.5 rounded-2xl border border-stone-200/50 shadow-sm">

                  <div className="bg-[#1b3b2b] text-white p-2.5 rounded-xl shrink-0 shadow-sm">
                    <Users className="h-4 w-4" />
                  </div>

                  <div>

                    <h4 className="font-bold text-gray-900 text-sm">
                      Reach More Readers
                    </h4>

                    <p className="text-xs text-stone-600">
                      Connect with a growing community
                    </p>

                  </div>

                </div>


                <div className="flex items-start space-x-4 bg-white/60 backdrop-blur-sm p-3.5 rounded-2xl border border-stone-200/50 shadow-sm">

                  <div className="bg-[#1b3b2b] text-white p-2.5 rounded-xl shrink-0 shadow-sm">
                    <Award className="h-4 w-4" />
                  </div>

                  <div>

                    <h4 className="font-bold text-gray-900 text-sm">
                      Earn & Grow
                    </h4>

                    <p className="text-xs text-stone-600">
                      Get paid for your original content
                    </p>

                  </div>

                </div>


                <div className="flex items-start space-x-4 bg-white/60 backdrop-blur-sm p-3.5 rounded-2xl border border-stone-200/50 shadow-sm">

                  <div className="bg-[#1b3b2b] text-white p-2.5 rounded-xl shrink-0 shadow-sm">
                    <ShieldCheck className="h-4 w-4" />
                  </div>

                  <div>

                    <h4 className="font-bold text-gray-900 text-sm">
                      Safe & Secure
                    </h4>

                    <p className="text-xs text-stone-600">
                      Your data is always protected
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* =========================================
              Right Column
          ========================================= */}

          <div className="lg:col-span-7 p-8 sm:p-12 space-y-8 bg-white">

            {/* Header */}

            <div>

              <h3 className="text-2xl font-extrabold text-gray-900 mb-1">
                Create Your Account
              </h3>

              <p className="text-xs text-stone-500 font-medium">
                Fill in your details to get started
              </p>

            </div>


            {/* Progress Indicator */}

            <div className="flex items-center justify-between max-w-md mx-auto py-2">

              <div className="flex flex-col items-center space-y-1">

                <div className="w-8 h-8 rounded-full bg-[#1b3b2b] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  1
                </div>

                <span className="text-[11px] font-bold text-gray-900">
                  Personal Info
                </span>

              </div>


              <div className="flex-1 h-0.5 bg-stone-200 mx-4"></div>


              <div className="flex flex-col items-center space-y-1">

                <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center font-bold text-xs">
                  2
                </div>

                <span className="text-[11px] font-medium text-stone-400">
                  Verify Email
                </span>

              </div>


              <div className="flex-1 h-0.5 bg-stone-200 mx-4"></div>


              <div className="flex flex-col items-center space-y-1">

                <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center font-bold text-xs">
                  3
                </div>

                <span className="text-[11px] font-medium text-stone-400">
                  Complete
                </span>

              </div>

            </div>


            {/* =========================================
                Form
            ========================================= */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* First + Last Name */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>

                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    First Name <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">

                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">
                      <User className="h-4 w-4" />
                    </span>

                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter your first name"
                      className="w-full bg-stone-50/75 border border-stone-200 rounded-xl py-3 pl-10 pr-4 text-xs text-gray-800 focus:outline-none focus:border-emerald-800"
                    />

                  </div>

                </div>


                <div>

                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Last Name <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">

                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">
                      <User className="h-4 w-4" />
                    </span>

                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter your last name"
                      className="w-full bg-stone-50/75 border border-stone-200 rounded-xl py-3 pl-10 pr-4 text-xs text-gray-800 focus:outline-none focus:border-emerald-800"
                    />

                  </div>

                </div>

              </div>


              {/* Email + Phone */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>

                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">

                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">
                      <Mail className="h-4 w-4" />
                    </span>

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      className="w-full bg-stone-50/75 border border-stone-200 rounded-xl py-3 pl-10 pr-4 text-xs text-gray-800 focus:outline-none focus:border-emerald-800"
                    />

                  </div>

                </div>


                <div>

                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">

                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">
                      <Phone className="h-4 w-4" />
                    </span>

                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      maxLength={10}
                      className="w-full bg-stone-50/75 border border-stone-200 rounded-xl py-3 pl-10 pr-4 text-xs text-gray-800 focus:outline-none focus:border-emerald-800"
                    />

                  </div>

                </div>

              </div>


              {/* Password + Confirm Password */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Password */}

                <div>

                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">

                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">
                      <Lock className="h-4 w-4" />
                    </span>

                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      className="w-full bg-stone-50/75 border border-stone-200 rounded-xl py-3 pl-10 pr-10 text-xs text-gray-800 focus:outline-none focus:border-emerald-800"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-gray-600 cursor-pointer"
                    >

                      {showPassword
                        ? <EyeOff className="h-4 w-4" />
                        : <Eye className="h-4 w-4" />
                      }

                    </button>

                  </div>

                </div>


                {/* Confirm Password */}

                <div>

                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">

                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">
                      <Lock className="h-4 w-4" />
                    </span>

                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className="w-full bg-stone-50/75 border border-stone-200 rounded-xl py-3 pl-10 pr-10 text-xs text-gray-800 focus:outline-none focus:border-emerald-800"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-gray-600 cursor-pointer"
                    >

                      {showConfirmPassword
                        ? <EyeOff className="h-4 w-4" />
                        : <Eye className="h-4 w-4" />
                      }

                    </button>

                  </div>

                </div>

              </div>


              {/* =========================================
                  Error Message
              ========================================= */}

              {error && (

                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-4 py-3 rounded-xl">
                  {error}
                </div>

              )}


              {/* =========================================
                  Success Message
              ========================================= */}

              {success && (

                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium px-4 py-3 rounded-xl">
                  {success}
                </div>

              )}


              {/* Terms */}

              <div className="flex items-center space-x-2 pt-1">

                <input
                  type="checkbox"
                  id="terms"
                  checked={agreed}
                  onChange={(e) =>
                    setAgreed(e.target.checked)
                  }
                  className="accent-[#1b3b2b] h-4 w-4 rounded cursor-pointer"
                />

                <label
                  htmlFor="terms"
                  className="text-xs text-stone-600 cursor-pointer"
                >

                  I agree to the{' '}

                  <span className="text-emerald-900 font-bold hover:underline">
                    Terms & Conditions
                  </span>

                  {' '}and{' '}

                  <span className="text-emerald-900 font-bold hover:underline">
                    Privacy Policy
                  </span>

                </label>

              </div>


              {/* Submit */}

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-[#1b3b2b] hover:bg-emerald-950 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-colors text-sm ${
                  loading
                    ? 'opacity-60 cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
              >

                {loading
                  ? 'Creating Account...'
                  : 'Create Account'
                }

              </button>


              {/* Login */}

              <p className="text-center text-xs text-stone-500 pt-2 font-medium">

                Already have an account?{' '}

                <Link
                  className="text-emerald-900 font-bold"
                  to="/login"
                >
                  Login
                </Link>

              </p>

            </form>

          </div>

        </div>

      </div>

    </>
  );
}