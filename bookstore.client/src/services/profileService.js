import { API_BASE_URL } from './api';


// =========================
// Get Profile
// =========================

export const getProfile = async () => {

  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('User is not logged in');
  }

  const response = await fetch(`${API_BASE_URL}/api/Profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to fetch profile');
  }

  return await response.json();
};


// =========================
// Update Profile
// =========================

export const updateProfile = async (profileData) => {

  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('User is not logged in');
  }

  const response = await fetch(`${API_BASE_URL}/api/Profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to update profile');
  }

  return await response.json();
};



// =========================
// Upload Profile Image
// =========================

export const uploadProfileImage = async (image) => {

  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('User is not logged in');
  }

  const formData = new FormData();

  formData.append('image', image);

  const response = await fetch(`${API_BASE_URL}/api/Profile/image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to upload profile image');
  }

  return await response.json();
};