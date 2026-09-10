import { API_BASE_URL } from "./api";

// =========================================================
// GET ALL PROMOTION BANNERS - ADMIN
// =========================================================

export const getPromotionBanners = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const response = await fetch(`${API_BASE_URL}/api/PromotionBanner`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load promotion banners."
    );
  }

  return data;
};

// =========================================================
// GET ACTIVE PROMOTION BANNERS - PUBLIC
// =========================================================

export const getActivePromotionBanners = async () => {
  const response = await fetch(
    `${API_BASE_URL}/api/PromotionBanner/active`,
    {
      method: "GET",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load active banners."
    );
  }

  return data;
};

// =========================================================
// CREATE PROMOTION BANNER - ADMIN
// =========================================================

export const createPromotionBanner = async (bannerData) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const response = await fetch(`${API_BASE_URL}/api/PromotionBanner`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: bannerData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to create promotion banner."
    );
  }

  return data;
};

// =========================================================
// GET PROMOTION BANNER BY ID - ADMIN
// =========================================================

export const getPromotionBannerById = async (id) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/PromotionBanner/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load promotion banner."
    );
  }

  return data;
};

// =========================================================
// UPDATE PROMOTION BANNER - ADMIN
// =========================================================

export const updatePromotionBanner = async (id, bannerData) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/PromotionBanner/${id}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: bannerData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to update promotion banner."
    );
  }

  return data;
};

// =========================================================
// DELETE PROMOTION BANNER - ADMIN
// =========================================================

export const deletePromotionBanner = async (id) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/PromotionBanner/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to delete promotion banner."
    );
  }

  return data;
};