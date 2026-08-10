import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
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
  Ticket
} from 'lucide-react'

import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'

import { getEventById } from '../services/eventService'
import { getProfile } from '../services/profileService'
import { registerForEvent } from '../services/eventRegistrationService'

export default function EventRegistration() {

  const navigate = useNavigate()
  const { id } = useParams()

  console.log('Event id:', id)

  // =========================
  // Profile
  // =========================

  const [profile, setProfile] = useState(null)

  // =========================
  // Event
  // =========================

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)

  // =========================
  // Registration
  // =========================

  const [seats, setSeats] = useState(1)

  // =========================
  // Book Copies
  // =========================

  const [wantExtraCopies, setWantExtraCopies] = useState('no')
  const [extraCopiesCount, setExtraCopiesCount] = useState(1)

  // =========================
  // Payment
  // =========================

  const [paymentMethod, setPaymentMethod] = useState('razorpay')
  const [agreed, setAgreed] = useState(false)

  // =========================
  // Submit
  // =========================

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // =========================
  // Load Event + Profile
  // =========================

  useEffect(() => {
    loadEvent()
    loadProfile()
  }, [id])

  const loadEvent = async () => {
    try {
      setLoading(true)

      console.log('Loading event:', id)

      const data = await getEventById(id)

      console.log('Event API response:', data)

      setEvent(data)

    } catch (err) {

      console.error('Failed to load event:', err)

      setError(
        err.message || 'Failed to load event.'
      )

    } finally {
      setLoading(false)
    }
  }

  const loadProfile = async () => {
    try {

      const data = await getProfile()

      console.log('Profile response:', data)

      setProfile(data)

    } catch (err) {

      console.error('Failed to load profile:', err)

    }
  }

  // =========================
  // Backend based calculations
  // =========================

  const ticketPricePerSeat =
    Number(event?.entryFee || 0)

  const bookPrice =
    Number(event?.bookPrice || 0)

  const entryFee =
    seats * ticketPricePerSeat

  /*
    Backend logic:

    First 2 copies are free for approved contributors.

    Additional copies are paid.

    Since frontend doesn't know whether user
    is an approved contributor, the backend
    remains the final authority.
  */

  const requestedBookCopies =
    wantExtraCopies === 'yes'
      ? 2 + extraCopiesCount
      : 2

  const paidCopiesPreview =
    wantExtraCopies === 'yes'
      ? extraCopiesCount
      : 0

  const bookAmount =
    paidCopiesPreview * bookPrice

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

  const totalAmount =
    entryFee + bookAmount

  const totalCopies =
    requestedBookCopies

  // =========================
  // Submit Registration
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault()

    setError('')
    setSuccess('')

    if (!event) {
      setError('Event information is not available.')
      return
    }

    if (!agreed) {
      setError(
        'Please agree to the Terms & Conditions and Privacy Policy.'
      )
      return
    }

    if (seats < 1) {
      setError('Please select at least one seat.')
      return
    }

    if (seats > event.availableSeats) {
      setError(
        `Only ${event.availableSeats} seats are available.`
      )
      return
    }

    /*
      Backend receives:

      EventId
      NumberOfSeats
      BookCopies
    */

    const registrationData = {
      eventId: Number(id),
      numberOfSeats: seats,
      bookCopies: requestedBookCopies
    }

    console.log(
      'Registration data:',
      registrationData
    )

    try {

      setSubmitting(true)

      const result =
        await registerForEvent(registrationData)

      console.log(
        'Registration successful:',
        result
      )

      setSuccess(
        result.message ||
        'Event registration successful.'
      )

      /*
        For now we are only making the POST work.

        Later we can connect Razorpay here.
      */

      setTimeout(() => {
        navigate('/my-registrations')
      }, 1500)

    } catch (err) {

      console.error(
        'Event registration failed:',
        err
      )

      setError(
        err.message ||
        'Event registration failed.'
      )

    } finally {

      setSubmitting(false)

    }
  }

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
    )
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
    )
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-stone-50/60 pb-20">

        {/* =========================
            Breadcrumb
        ========================= */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-6">

          <div className="flex items-center space-x-2 text-xs text-stone-500 mb-2 font-medium">

            <Link
              to="/"
              className="hover:text-emerald-900 flex items-center"
            >
              <Home className="h-3.5 w-3.5 mr-1" />
              Home
            </Link>

            <ChevronRight className="h-3.5 w-3.5 text-stone-400" />

            <Link
              to="/events"
              className="hover:text-emerald-900"
            >
              Events
            </Link>

            <ChevronRight className="h-3.5 w-3.5 text-stone-400" />

            <span className="text-gray-900 font-semibold">
              Event Registration
            </span>

          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
            Event Registration
          </h1>

          <p className="text-sm text-stone-600 font-medium mt-1">
            Register for the event, get your book copies and be part of a memorable celebration.
          </p>

        </div>

        {/* =========================
            Error / Success
        ========================= */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-semibold">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold">
              {success}
            </div>
          )}

        </div>

        {/* =========================
            Event Hero
        ========================= */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Event Card */}

            <div className="lg:col-span-7 bg-white border border-stone-200/80 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between">

              <div
                className="relative h-56 sm:h-64 bg-cover bg-center flex flex-col justify-between p-6"
                style={{
                  backgroundImage: `
                    linear-gradient(
                      to top,
                      rgba(0,0,0,.85),
                      rgba(0,0,0,.3)
                    ),
                    url("${event.imageUrl || 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80'}")
                  `
                }}
              >

                <div className="flex justify-between items-start">

                  <div className="bg-[#1b3b2b] text-white rounded-2xl p-3 text-center shadow-md border border-emerald-700/40 min-w-[70px]">

                    <span className="block text-lg font-black leading-none">
                      {new Date(event.eventDate).getDate()}
                    </span>

                    <span className="block text-[10px] font-bold tracking-widest uppercase mt-1 text-emerald-200">
                      {new Date(event.eventDate).toLocaleDateString(
                        'en-IN',
                        {
                          month: 'short',
                          year: 'numeric'
                        }
                      )}
                    </span>

                  </div>

                  <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/30">
                    Poetry Event
                  </span>

                </div>

                <div className="text-white space-y-1">

                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    {event.eventName}
                  </h2>

                  <p className="text-xs text-stone-200 font-medium">
                    {event.description}
                  </p>

                </div>

              </div>

              {/* Event Meta */}

              <div className="p-6 space-y-4 bg-white flex-1 flex flex-col justify-between">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-600 font-medium">

                  <div className="flex items-center space-x-2.5">
                    <Calendar className="h-4 w-4 text-emerald-900 shrink-0" />

                    <span>
                      {new Date(event.eventDate).toLocaleDateString(
                        'en-IN',
                        {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }
                      )}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2.5">

                    <Clock className="h-4 w-4 text-emerald-900 shrink-0" />

                    <span>
                      4:00 PM - 7:00 PM
                    </span>

                  </div>

                  <div className="flex items-center space-x-2.5">

                    <MapPin className="h-4 w-4 text-emerald-900 shrink-0" />

                    <span>
                      {event.venue}
                    </span>

                  </div>

                  <div className="flex items-center space-x-2.5">

                    <Users className="h-4 w-4 text-emerald-900 shrink-0" />

                    <span>
                      {event.availableSeats} Seats Available
                    </span>

                  </div>

                </div>

                <div className="pt-4 border-t border-stone-100 grid grid-cols-3 gap-2 text-xs">

                  <div>

                    <span className="block text-[10px] text-stone-400 uppercase font-bold">
                      Organized by
                    </span>

                    <span className="font-bold text-gray-900">
                      Book Store Community
                    </span>

                  </div>

                  <div>

                    <span className="block text-[10px] text-stone-400 uppercase font-bold">
                      Event Type
                    </span>

                    <span className="font-bold text-gray-900">
                      Poetry
                    </span>

                  </div>

                  <div>

                    <span className="block text-[10px] text-stone-400 uppercase font-bold">
                      Entry Fee
                    </span>

                    <span className="font-bold text-emerald-900">
                      ₹{event.entryFee} per person
                    </span>

                  </div>

                </div>

              </div>

            </div>

            {/* Right Side */}

            <div className="lg:col-span-5 space-y-4">

              <div className="bg-emerald-50/80 border border-emerald-800/20 rounded-3xl p-5 flex items-start space-x-3.5 shadow-xs">

                <div className="bg-[#1b3b2b] text-white p-2.5 rounded-2xl shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>

                <div>

                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide text-emerald-950">
                    Published Authors
                  </h4>

                  <p className="text-xs text-stone-700 mt-0.5 leading-relaxed">
                    Approved contributors can receive up to 2 complimentary copies with their registration.
                  </p>

                </div>

              </div>

              <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm space-y-4">

                <h3 className="font-extrabold text-gray-900 text-sm">
                  Event Benefits
                </h3>

                <div className="space-y-3 text-xs text-stone-700 font-medium">

                  {[
                    'Stage time for published authors',
                    'Certificate presentation on stage',
                    'Receive your published book on stage',
                    '2 complimentary copies for approved contributors',
                    'Chance to connect with writers & readers',
                    'Refreshments & networking'
                  ].map((item, index) => (

                    <div
                      key={index}
                      className="flex items-center space-x-3"
                    >

                      <div className="bg-emerald-100 text-emerald-900 p-1 rounded-full shrink-0">
                        <Check className="h-3.5 w-3.5" />
                      </div>

                      <span>{item}</span>

                    </div>

                  ))}

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* =========================
            Progress
        ========================= */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">

          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm overflow-x-auto">

            <div className="flex items-center justify-between min-w-[700px]">

              <div className="flex items-center space-x-3 bg-emerald-50/80 border border-emerald-800/20 px-4 py-2.5 rounded-2xl">

                <div className="w-7 h-7 rounded-full bg-[#1b3b2b] text-white flex items-center justify-center font-bold text-xs">
                  1
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-900">
                    Registration
                  </p>

                  <p className="text-[10px] text-stone-500">
                    Your Details
                  </p>
                </div>

              </div>

              <div className="flex-1 h-0.5 bg-stone-200 mx-4"></div>

              <div className="flex items-center space-x-3 px-4 py-2.5">

                <div className="w-7 h-7 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center font-bold text-xs">
                  2
                </div>

                <div>
                  <p className="text-xs font-bold text-stone-600">
                    Book Copies
                  </p>

                  <p className="text-[10px] text-stone-400">
                    Select Copies
                  </p>
                </div>

              </div>

              <div className="flex-1 h-0.5 bg-stone-200 mx-4"></div>

              <div className="flex items-center space-x-3 px-4 py-2.5">

                <div className="w-7 h-7 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center font-bold text-xs">
                  3
                </div>

                <div>
                  <p className="text-xs font-bold text-stone-600">
                    Payment
                  </p>

                  <p className="text-[10px] text-stone-400">
                    Secure Payment
                  </p>
                </div>

              </div>

              <div className="flex-1 h-0.5 bg-stone-200 mx-4"></div>

              <div className="flex items-center space-x-3 px-4 py-2.5">

                <div className="w-7 h-7 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center font-bold text-xs">
                  4
                </div>

                <div>
                  <p className="text-xs font-bold text-stone-600">
                    Confirmation
                  </p>

                  <p className="text-[10px] text-stone-400">
                    Get Your Ticket
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* =========================
            Main Form
        ========================= */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >

            {/* =========================
                Left
            ========================= */}

            <div className="lg:col-span-7 space-y-6">

              {/* Details */}

              <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">

                <h3 className="font-extrabold text-gray-900 text-base border-b border-stone-100 pb-3">
                  1. Your Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Name */}

                  <div>

                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Full Name
                    </label>

                    <div className="relative">

                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                        <User className="h-4 w-4" />
                      </span>

                      <input
                        type="text"
                        value={
                          profile
                            ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
                            : ''
                        }
                        disabled
                        className="w-full bg-gray-100 border border-stone-200 rounded-xl py-3 pl-10 pr-4 text-xs text-gray-600 cursor-not-allowed"
                      />

                    </div>

                  </div>

                  {/* Email */}

                  <div>

                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Email Address
                    </label>

                    <div className="relative">

                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                        <Mail className="h-4 w-4" />
                      </span>

                      <input
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        className="w-full bg-gray-100 border border-stone-200 rounded-xl py-3 pl-10 pr-4 text-xs text-gray-600 cursor-not-allowed"
                      />

                    </div>

                  </div>

                  {/* Phone */}

                  <div>

                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Phone Number
                    </label>

                    <div className="relative">

                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                        <Phone className="h-4 w-4" />
                      </span>

                      <input
                        type="text"
                        value={profile?.phone || ''}
                        disabled
                        className="w-full bg-gray-100 border border-stone-200 rounded-xl py-3 pl-10 pr-4 text-xs text-gray-600 cursor-not-allowed"
                      />

                    </div>

                  </div>

                  {/* Seats */}

                  <div>

                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Number of Seats
                    </label>

                    <select
                      value={seats}
                      onChange={(e) =>
                        setSeats(Number(e.target.value))
                      }
                      className="w-full bg-stone-50/75 border border-stone-200 rounded-xl py-3 px-3.5 text-xs text-gray-800 focus:outline-none focus:border-emerald-800 font-medium"
                    >

                      {Array.from(
                        {
                          length: Math.min(
                            10,
                            event.availableSeats
                          )
                        },
                        (_, index) => index + 1
                      ).map(number => (

                        <option
                          key={number}
                          value={number}
                        >
                          {number}
                        </option>

                      ))}

                    </select>

                    <p className="text-[10px] text-stone-400 mt-1">
                      Maximum 10 seats per registration
                    </p>

                  </div>

                </div>

              </div>

              {/* =========================
                  Book Copies
              ========================= */}

              <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">

                <h3 className="font-extrabold text-gray-900 text-base border-b border-stone-100 pb-3">
                  2. Book Copies
                </h3>

                <div className="bg-emerald-50/60 border border-emerald-800/20 p-4 rounded-2xl flex items-start space-x-3">

                  <BookOpen className="h-5 w-5 text-emerald-900 shrink-0 mt-0.5" />

                  <p className="text-xs text-stone-700 leading-relaxed font-medium">

                    Approved Story/Poetry contributors can receive
                    <span className="font-bold text-gray-900">
                      {' '}2 complimentary copies
                    </span>
                    . Additional copies cost
                    <span className="font-bold text-emerald-900">
                      {' '}₹{bookPrice}
                    </span>
                    {' '}each.

                  </p>

                </div>

                <div>

                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Do you want additional copies?
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    {/* YES */}

                    <div
                      onClick={() =>
                        setWantExtraCopies('yes')
                      }
                      className={`border-2 rounded-2xl p-4 cursor-pointer transition-all ${
                        wantExtraCopies === 'yes'
                          ? 'border-[#1b3b2b] bg-emerald-50/20'
                          : 'border-stone-200'
                      }`}
                    >

                      <div className="flex items-start space-x-3">

                        <input
                          type="radio"
                          name="extraCopies"
                          checked={
                            wantExtraCopies === 'yes'
                          }
                          onChange={() =>
                            setWantExtraCopies('yes')
                          }
                          className="accent-[#1b3b2b] mt-0.5"
                        />

                        <div>

                          <h4 className="font-bold text-gray-900 text-xs">
                            Yes, I want additional copies
                          </h4>

                          <p className="text-[10px] text-stone-500 mt-0.5">
                            ₹{bookPrice} per additional copy
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* NO */}

                    <div
                      onClick={() =>
                        setWantExtraCopies('no')
                      }
                      className={`border-2 rounded-2xl p-4 cursor-pointer transition-all ${
                        wantExtraCopies === 'no'
                          ? 'border-[#1b3b2b] bg-emerald-50/20'
                          : 'border-stone-200'
                      }`}
                    >

                      <div className="flex items-start space-x-3">

                        <input
                          type="radio"
                          name="extraCopies"
                          checked={
                            wantExtraCopies === 'no'
                          }
                          onChange={() =>
                            setWantExtraCopies('no')
                          }
                          className="accent-[#1b3b2b] mt-0.5"
                        />

                        <div>

                          <h4 className="font-bold text-gray-900 text-xs">
                            No, that's enough
                          </h4>

                          <p className="text-[10px] text-stone-500 mt-0.5">
                            Request only the complimentary copies
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

                {/* Extra copies counter */}

                {wantExtraCopies === 'yes' && (

                  <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">

                    <div>

                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Additional Copies
                      </label>

                      <div className="flex items-center space-x-2">

                        <button
                          type="button"
                          onClick={() =>
                            setExtraCopiesCount(
                              Math.max(
                                1,
                                extraCopiesCount - 1
                              )
                            )
                          }
                          className="w-8 h-8 rounded-lg bg-white border border-stone-300 flex items-center justify-center font-bold text-gray-700 hover:bg-stone-100"
                        >
                          <Minus className="h-3 w-3" />
                        </button>

                        <span className="w-12 text-center font-bold text-sm text-gray-900">
                          {extraCopiesCount}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setExtraCopiesCount(
                              Math.min(
                                100,
                                extraCopiesCount + 1
                              )
                            )
                          }
                          className="w-8 h-8 rounded-lg bg-white border border-stone-300 flex items-center justify-center font-bold text-gray-700 hover:bg-stone-100"
                        >
                          <Plus className="h-3 w-3" />
                        </button>

                      </div>

                    </div>

                    <div className="text-left sm:text-right">

                      <span className="block text-[10px] text-stone-400 uppercase font-bold">
                        Price per copy
                      </span>

                      <span className="font-extrabold text-emerald-900 text-sm">
                        ₹{bookPrice}.00
                      </span>

                    </div>

                  </div>

                )}

                <div className="pt-2 flex justify-between items-center text-xs text-stone-600 font-medium">

                  <span>
                    {wantExtraCopies === 'yes'
                      ? `2 complimentary + ${extraCopiesCount} additional`
                      : '2 complimentary copies'}
                  </span>

                  <span className="font-bold text-gray-900">
                    Requested: {totalCopies}
                  </span>

                </div>

                <p className="text-[10px] text-stone-400">
                  Final complimentary/paid copy eligibility is determined by the server based on your approved contributor status.
                </p>

              </div>

              {/* =========================
                  Payment Method
              ========================= */}

              <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">

                <h3 className="font-extrabold text-gray-900 text-base border-b border-stone-100 pb-3">
                  3. Payment Method
                </h3>

                <div className="space-y-3">

                  {/* Razorpay */}

                  <div
                    onClick={() =>
                      setPaymentMethod('razorpay')
                    }
                    className={`border-2 rounded-2xl p-4 cursor-pointer transition-all flex items-center justify-between ${
                      paymentMethod === 'razorpay'
                        ? 'border-[#1b3b2b] bg-emerald-50/20'
                        : 'border-stone-200'
                    }`}
                  >

                    <div className="flex items-center space-x-3">

                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={
                          paymentMethod === 'razorpay'
                        }
                        onChange={() =>
                          setPaymentMethod('razorpay')
                        }
                        className="accent-[#1b3b2b]"
                      />

                      <div>

                        <h4 className="font-bold text-gray-900 text-xs">
                          Razorpay
                        </h4>

                        <p className="text-[10px] text-stone-500">
                          UPI, Cards, NetBanking
                        </p>

                      </div>

                    </div>

                    <span className="font-extrabold text-blue-900 text-xs bg-blue-50 px-2.5 py-1 rounded-lg">
                      Razorpay
                    </span>

                  </div>

                  {/* UPI */}

                  <div
                    onClick={() =>
                      setPaymentMethod('upi')
                    }
                    className={`border-2 rounded-2xl p-4 cursor-pointer transition-all flex items-center justify-between ${
                      paymentMethod === 'upi'
                        ? 'border-[#1b3b2b] bg-emerald-50/20'
                        : 'border-stone-200'
                    }`}
                  >

                    <div className="flex items-center space-x-3">

                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={
                          paymentMethod === 'upi'
                        }
                        onChange={() =>
                          setPaymentMethod('upi')
                        }
                        className="accent-[#1b3b2b]"
                      />

                      <div>

                        <h4 className="font-bold text-gray-900 text-xs">
                          UPI
                        </h4>

                        <p className="text-[10px] text-stone-500">
                          Pay using any UPI app
                        </p>

                      </div>

                    </div>

                    <span className="font-bold text-stone-700 text-xs">
                      UPI
                    </span>

                  </div>

                  {/* Card */}

                  <div
                    onClick={() =>
                      setPaymentMethod('card')
                    }
                    className={`border-2 rounded-2xl p-4 cursor-pointer transition-all flex items-center justify-between ${
                      paymentMethod === 'card'
                        ? 'border-[#1b3b2b] bg-emerald-50/20'
                        : 'border-stone-200'
                    }`}
                  >

                    <div className="flex items-center space-x-3">

                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={
                          paymentMethod === 'card'
                        }
                        onChange={() =>
                          setPaymentMethod('card')
                        }
                        className="accent-[#1b3b2b]"
                      />

                      <div>

                        <h4 className="font-bold text-gray-900 text-xs">
                          Credit / Debit Card
                        </h4>

                        <p className="text-[10px] text-stone-500">
                          Visa, MasterCard, RuPay
                        </p>

                      </div>

                    </div>

                    <CreditCard className="h-5 w-5 text-stone-500" />

                  </div>

                  {/* Net Banking */}

                  <div
                    onClick={() =>
                      setPaymentMethod('netbanking')
                    }
                    className={`border-2 rounded-2xl p-4 cursor-pointer transition-all flex items-center justify-between ${
                      paymentMethod === 'netbanking'
                        ? 'border-[#1b3b2b] bg-emerald-50/20'
                        : 'border-stone-200'
                    }`}
                  >

                    <div className="flex items-center space-x-3">

                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={
                          paymentMethod === 'netbanking'
                        }
                        onChange={() =>
                          setPaymentMethod('netbanking')
                        }
                        className="accent-[#1b3b2b]"
                      />

                      <div>

                        <h4 className="font-bold text-gray-900 text-xs">
                          Net Banking
                        </h4>

                        <p className="text-[10px] text-stone-500">
                          All major banks supported
                        </p>

                      </div>

                    </div>

                    <Building2 className="h-5 w-5 text-stone-500" />

                  </div>

                  {/* Wallet */}

                  <div
                    onClick={() =>
                      setPaymentMethod('wallets')
                    }
                    className={`border-2 rounded-2xl p-4 cursor-pointer transition-all flex items-center justify-between ${
                      paymentMethod === 'wallets'
                        ? 'border-[#1b3b2b] bg-emerald-50/20'
                        : 'border-stone-200'
                    }`}
                  >

                    <div className="flex items-center space-x-3">

                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={
                          paymentMethod === 'wallets'
                        }
                        onChange={() =>
                          setPaymentMethod('wallets')
                        }
                        className="accent-[#1b3b2b]"
                      />

                      <div>

                        <h4 className="font-bold text-gray-900 text-xs">
                          Wallets
                        </h4>

                        <p className="text-[10px] text-stone-500">
                          PhonePe, Paytm, Amazon Pay & more
                        </p>

                      </div>

                    </div>

                    <Wallet className="h-5 w-5 text-stone-500" />

                  </div>

                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2">

                  <div className="bg-emerald-100 text-emerald-900 p-2 rounded-full">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <h4 className="font-bold text-gray-900 text-xs">
                    Secure Payment
                  </h4>

                  <p className="text-[11px] text-stone-500 max-w-sm">
                    Your payment will be processed securely.
                  </p>

                </div>

              </div>

            </div>

            {/* =========================
                Right Summary
            ========================= */}

            <div className="lg:col-span-5">

              <div className="sticky top-6 bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">

                <h3 className="font-extrabold text-gray-900 text-base border-b border-stone-100 pb-3">
                  Order Summary
                </h3>

                {/* Event */}

                <div className="space-y-3">

                  <span className="block text-[10px] uppercase font-bold text-stone-400">
                    Event Details
                  </span>

                  <div className="flex space-x-3 items-center bg-stone-50 p-3 rounded-2xl border border-stone-200/70">

                    <img
                      src={
                        event.imageUrl ||
                        'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=200&q=80'
                      }
                      alt="Event"
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />

                    <div>

                      <h4 className="font-bold text-gray-900 text-xs">
                        {event.eventName}
                      </h4>

                      <p className="text-[10px] text-stone-500 mt-0.5">
                        {new Date(event.eventDate).toLocaleDateString(
                          'en-IN',
                          {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          }
                        )}
                      </p>

                      <p className="text-[10px] text-stone-500">
                        4:00 PM - 7:00 PM
                      </p>

                    </div>

                  </div>

                </div>

                {/* Fee */}

                <div className="space-y-2.5 text-xs text-stone-600 border-t border-stone-100 pt-4">

                  <span className="block text-[10px] uppercase font-bold text-stone-400 mb-1">
                    Summary
                  </span>

                  <div className="flex justify-between">

                    <span>
                      Entry Fee ({seats}{' '}
                      {seats === 1
                        ? 'Seat'
                        : 'Seats'})
                    </span>

                    <span className="font-bold text-gray-900">
                      ₹{entryFee}.00
                    </span>

                  </div>

                  {wantExtraCopies === 'yes' && (

                    <div className="flex justify-between">

                      <span>
                        Additional Copies ({extraCopiesCount} × ₹{bookPrice})
                      </span>

                      <span className="font-bold text-gray-900">
                        ₹{bookAmount}.00
                      </span>

                    </div>

                  )}

                  <div className="flex justify-between">

                    <span>
                      Complimentary Copies
                    </span>

                    <span className="font-bold text-emerald-800">
                      2
                    </span>

                  </div>

                </div>

                {/* Total */}

                <div className="border-t border-stone-200 pt-4 flex justify-between items-center">

                  <span className="font-extrabold text-gray-900 text-sm">
                    Estimated Total
                  </span>

                  <span className="font-black text-emerald-900 text-xl">
                    ₹{totalAmount}.00
                  </span>

                </div>

                {/* Included */}

                <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 space-y-2.5">

                  <h4 className="font-bold text-gray-900 text-xs">
                    What's Included?
                  </h4>

                  <div className="space-y-2 text-xs text-stone-700">

                    <div className="flex items-center space-x-2.5">
                      <Check className="h-3.5 w-3.5 text-emerald-900" />
                      <span>
                        Event Entry for {seats}{' '}
                        {seats === 1
                          ? 'Person'
                          : 'Persons'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2.5">
                      <Check className="h-3.5 w-3.5 text-emerald-900" />
                      <span>
                        Certificate on Stage
                      </span>
                    </div>

                    <div className="flex items-center space-x-2.5">
                      <Check className="h-3.5 w-3.5 text-emerald-900" />
                      <span>
                        Your Book on Stage
                      </span>
                    </div>

                    <div className="flex items-center space-x-2.5">
                      <Check className="h-3.5 w-3.5 text-emerald-900" />
                      <span>
                        Up to 2 Complimentary Copies
                      </span>
                    </div>

                    {wantExtraCopies === 'yes' && (

                      <div className="flex items-center space-x-2.5">

                        <Check className="h-3.5 w-3.5 text-emerald-900" />

                        <span>
                          {extraCopiesCount} Additional{' '}
                          {extraCopiesCount === 1
                            ? 'Copy'
                            : 'Copies'}
                        </span>

                      </div>

                    )}

                  </div>

                  <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl flex items-start space-x-2.5 text-stone-700 text-[11px]">

                    <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />

                    <p>
                      The server will verify your contributor status and calculate the final payable amount.
                    </p>

                  </div>

                </div>

                {/* Terms */}

                <div className="flex items-start space-x-2 pt-2">

                  <input
                    type="checkbox"
                    id="agreeTerms"
                    checked={agreed}
                    onChange={(e) =>
                      setAgreed(e.target.checked)
                    }
                    className="accent-[#1b3b2b] h-4 w-4 mt-0.5 rounded cursor-pointer"
                  />

                  <label
                    htmlFor="agreeTerms"
                    className="text-xs text-stone-600 cursor-pointer leading-relaxed"
                  >
                    I agree to the{' '}
                    <span className="text-emerald-900 font-bold">
                      Terms & Conditions
                    </span>{' '}
                    and{' '}
                    <span className="text-emerald-900 font-bold">
                      Privacy Policy
                    </span>
                  </label>

                </div>

                {/* Submit */}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#1b3b2b] hover:bg-emerald-950 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-colors flex items-center justify-center space-x-2 text-sm cursor-pointer"
                >

                  {submitting ? (

                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>

                      <span>
                        Registering...
                      </span>
                    </>

                  ) : (

                    <>
                      <Lock className="h-4 w-4" />

                      <span>
                        Register for ₹{totalAmount}.00
                      </span>
                    </>

                  )}

                </button>

                <div className="text-center">

                  <span className="text-[10px] text-stone-400 font-medium">
                    Secure event registration
                  </span>

                </div>

              </div>

            </div>

          </form>

        </div>

      </div>

      <Footer />

    </>
  )
}