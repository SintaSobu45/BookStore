import { API_BASE_URL } from "./api";

const getToken = () => localStorage.getItem("token");

const getAuthHeaders = () => {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
};

// ===============================
// GET ALL EDITORS
// ===============================

export const getAllEditors = async () => {
  const response = await fetch(
    `${API_BASE_URL}/api/Account/editors`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.Message ||
        "Failed to fetch editors."
    );
  }

  return data;
};

// ===============================
// CREATE EDITOR
// ===============================

export const createEditor = async ({
  name,
  email,
  phone,
  password,
}) => {
  const response = await fetch(
    `${API_BASE_URL}/api/Account/create-editor`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name,
        email,
        phone,
        password,
      }),
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.Message ||
        "Failed to create editor."
    );
  }

  return data;
};

// ===============================
// UPDATE EDITOR
// ===============================

export const updateEditor = async (
  userId,
  { name, email, phone }
) => {
  const response = await fetch(
    `${API_BASE_URL}/api/Account/editors/${userId}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name,
        email,
        phone,
      }),
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.Message ||
        "Failed to update editor."
    );
  }

  return data;
};

// ===============================
// CHANGE EDITOR PASSWORD
// ===============================

export const changeEditorPassword = async (
  userId,
  password
) => {
  const response = await fetch(
    `${API_BASE_URL}/api/Account/editors/${userId}/password`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        newPassword:password,
      }),
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.Message ||
        "Failed to change editor password."
    );
  }

  return data;
};

// ===============================
// DELETE EDITOR
// ===============================

export const deleteEditor = async (userId) => {
  const response = await fetch(
    `${API_BASE_URL}/api/Account/editors/${userId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.Message ||
        "Failed to delete editor."
    );
  }

  return data;
};