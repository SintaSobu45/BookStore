import { API_BASE_URL } from './api'

// =========================================================
// LOGIN
// =========================================================

export const loginUser = async (loginData) => {
  const response = await fetch(`${API_BASE_URL}/api/Account/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(loginData)
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Invalid email or password.')
  }

  return data
}


// =========================================================
// REGISTER
// =========================================================

export const registerUser = async (registerData) => {
  const response = await fetch(`${API_BASE_URL}/api/Account/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(registerData)
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Registration failed.')
  }

  return data
}


// =========================================================
// VERIFY EMAIL OTP
// =========================================================

export const verifyEmailOtp = async (verifyData) => {
  const response = await fetch(
    `${API_BASE_URL}/api/Account/verify-email`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(verifyData)
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'OTP verification failed.')
  }

  return data
}


// =========================================================
// RESEND OTP
// =========================================================

export const resendOtp = async (registrationToken) => {
  const response = await fetch(
    `${API_BASE_URL}/api/Account/resend-otp`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        registrationToken
      })
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to resend OTP.')
  }

  return data
}