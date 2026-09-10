import { API_BASE_URL } from "./api";

// =========================================================
// AUTH HEADERS
// =========================================================

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// =========================================================
// GET ALL WARNINGS - ADMIN
// =========================================================

export const getAllPageWarnings = async () => {
  const response = await fetch(
    `${API_BASE_URL}/api/PageWarning`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to fetch warnings.");
  }

  return response.json();
};

// =========================================================
// GET WARNING FOR A PAGE
// =========================================================

export const getPageWarningByPage = async (pageName) => {
  const response = await fetch(
    `${API_BASE_URL}/api/PageWarning/page/${pageName}`,
    {
      method: "GET",
    }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to fetch warning.");
  }

  return response.json();
};

// =========================================================
// CREATE WARNING - ADMIN
// =========================================================

export const createPageWarning = async (warningData) => {
  const response = await fetch(
    `${API_BASE_URL}/api/PageWarning`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(warningData),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to create warning.");
  }

  return response.json();
};

// =========================================================
// UPDATE WARNING - ADMIN
// =========================================================

export const updatePageWarning = async (id, warningData) => {
  const response = await fetch(
    `${API_BASE_URL}/api/PageWarning/${id}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(warningData),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to update warning.");
  }

  return response.json();
};

// =========================================================
// DELETE WARNING - ADMIN
// =========================================================

export const deletePageWarning = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/api/PageWarning/${id}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to delete warning.");
  }

  return response.json();
};

// =========================================================
// TOGGLE ACTIVE STATUS - ADMIN
// =========================================================

export const togglePageWarning = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/api/PageWarning/${id}/toggle`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to update warning status.");
  }

  return response.json();
};