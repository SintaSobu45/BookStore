import { API_BASE_URL } from './api'

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