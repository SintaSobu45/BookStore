import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../services/authService'

function Login() {

  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {

      const loginData = {
        email: email,
        password: password
      }

      const result = await loginUser(loginData)

      console.log('Login successful:', result)

      // Store authentication data
      localStorage.setItem('token', result.token)
      localStorage.setItem('userId', result.userId)
      localStorage.setItem('fullName', result.fullName)
      localStorage.setItem('email', result.email)
      localStorage.setItem('role', result.role)

      // Navigate to home after successful login
      navigate('/')

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

          <div className="col-12 col-sm-10 col-md-7 col-lg-5 col-xl-4">

            {/* Logo / Brand */}
            <div className="text-center mb-4">

              <h2 className="fw-bold mb-1">
                മലയാളം പുസ്തകശാല
              </h2>

              <p className="text-muted mb-0">
                Malayalam Book Store
              </p>

            </div>

            {/* Login Card */}
            <div className="card border-0 shadow-sm rounded-4">

              <div className="card-body p-4 p-md-5">

                <h3 className="fw-bold text-center mb-2">
                  Welcome Back
                </h3>

                <p className="text-muted text-center mb-4">
                  Login To Continue
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

                <form onSubmit={handleSubmit}>

                  {/* Email */}
                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Email Address
                    </label>

                    <input
                      type="email"
                      className="form-control form-control-lg"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      className="form-control form-control-lg"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />

                  </div>

                  {/* Remember + Forgot */}
                  <div className="d-flex justify-content-between align-items-center mb-4">

                    <div className="form-check">

                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="rememberMe"
                      />

                      <label
                        className="form-check-label text-muted"
                        htmlFor="rememberMe"
                      >
                        Remember Me ?
                      </label>

                    </div>

                    <Link
                      to="/forgot-password"
                      className="text-decoration-none"
                    >
                      Forgot Password?
                    </Link>

                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    className="btn btn-dark btn-lg w-100 rounded-3"
                    disabled={loading}
                  >

                    {loading ? 'Logging in...' : 'Login'}

                  </button>

                </form>

                {/* Register */}
                <div className="text-center mt-4">

                  <span className="text-muted">
                    Dont have an account ?{' '}
                  </span>

                  <Link
                    to="/register"
                    className="fw-semibold text-decoration-none"
                  >
                    Create Account
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

export default Login