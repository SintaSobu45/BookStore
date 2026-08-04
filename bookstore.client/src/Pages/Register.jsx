import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../services/authService'

function Register() {

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setSuccess('')

    // Check password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {

      // Data expected by ASP.NET Core RegisterRequest
      const registerData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      }

      const result = await registerUser(registerData)

      console.log('Registration successful:', result)

      setSuccess(
        result.message || 'Registration successful.'
      )

      // Clear form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      })

      // Navigate to login after successful registration
      setTimeout(() => {
        navigate('/login')
      }, 1500)

    } catch (error) {

      setError(error.message)

    } finally {

      setLoading(false)

    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">

      <div className="container">

        {/* Back Home */}
        <div className="mt-4 mb-3">
          <Link
            to="/"
            className="text-muted text-decoration-none"
          >
            👈 Back To Home
          </Link>
        </div>

        <div className="row justify-content-center">

          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">

            {/* Logo / Brand */}
            <div className="text-center mb-4">

              <h2 className="fw-bold mb-1">
                മലയാളം പുസ്തകശാല
              </h2>

              <p className="text-muted mb-0">
                Malayalam Book Store
              </p>

            </div>

            {/* Register Card */}
            <div className="card border-0 shadow-sm rounded-4">

              <div className="card-body p-4 p-md-5">

                <h3 className="fw-bold text-center mb-2">
                  Create an Account
                </h3>

                <p className="text-muted text-center mb-4">
                  Join us and discover your next favorite book
                </p>

                {/* Error Message */}
                {error && (
                  <div
                    className="alert alert-danger"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div
                    className="alert alert-success"
                    role="alert"
                  >
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit}>

                  {/* First Name + Last Name */}
                  <div className="row">

                    <div className="col-md-6 mb-3">

                      <label className="form-label fw-semibold">
                        First Name
                      </label>

                      <input
                        type="text"
                        name="firstName"
                        className="form-control form-control-lg"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />

                    </div>

                    <div className="col-md-6 mb-3">

                      <label className="form-label fw-semibold">
                        Last Name
                      </label>

                      <input
                        type="text"
                        name="lastName"
                        className="form-control form-control-lg"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />

                    </div>

                  </div>

                  {/* Email */}
                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      className="form-control form-control-lg"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />

                  </div>

                  {/* Phone */}
                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      className="form-control form-control-lg"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />

                  </div>

                  {/* Password */}
                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Password
                    </label>

                    <input
                      type="password"
                      name="password"
                      className="form-control form-control-lg"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      minLength={6}
                      required
                    />

                    <div className="form-text">
                      Password must be at least 6 characters.
                    </div>

                  </div>

                  {/* Confirm Password */}
                  <div className="mb-4">

                    <label className="form-label fw-semibold">
                      Confirm Password
                    </label>

                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-control form-control-lg"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      minLength={6}
                      required
                    />

                  </div>

                  {/* Terms */}
                  <div className="form-check mb-4">

                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="terms"
                      required
                    />

                    <label
                      className="form-check-label text-muted"
                      htmlFor="terms"
                    >
                      I agree to the{' '}

                      <Link
                        to="/terms"
                        className="text-decoration-none"
                      >
                        Terms & Conditions
                      </Link>

                    </label>

                  </div>

                  {/* Register Button */}
                  <button
                    type="submit"
                    className="btn btn-dark btn-lg w-100 rounded-3"
                    disabled={loading}
                  >

                    {loading
                      ? 'Creating Account...'
                      : 'Create Account'
                    }

                  </button>

                </form>

                {/* Login */}
                <div className="text-center mt-4">

                  <span className="text-muted">
                    Already have an account?{' '}
                  </span>

                  <Link
                    to="/login"
                    className="fw-semibold text-decoration-none"
                  >
                    Login
                  </Link>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Register