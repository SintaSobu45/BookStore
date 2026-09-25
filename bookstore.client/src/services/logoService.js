import { API_BASE_URL } from "./api";

// =========================================================
// GET CURRENT LOGO
// =========================================================

export const getLogo = async () => {
  const response = await fetch(`${API_BASE_URL}/api/Logo`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch logo.");
  }

  return await response.json();
};

// =========================================================
// ADD LOGO
// =========================================================

export const addLogo = async (image) => {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("image", image);

  const response = await fetch(`${API_BASE_URL}/api/Logo`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to add logo.");
  }

  return data;
};

// =========================================================
// REPLACE LOGO
// =========================================================

export const replaceLogo = async (id, image) => {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("image", image);

  const response = await fetch(`${API_BASE_URL}/api/Logo/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to replace logo.");
  }

  return data;
};