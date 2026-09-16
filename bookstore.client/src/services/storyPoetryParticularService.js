import { API_BASE_URL } from "./api";

// =========================================================
// ADMIN - GET ALL PARTICULARS
// =========================================================

export const getAllStoryPoetryParticulars = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/api/StoryPoetryParticular/Admin`,
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
      data?.message || "Failed to fetch particulars."
    );
  }

  return data;
};


// =========================================================
// PUBLIC - GET ACTIVE PARTICULARS BY TYPE
// =========================================================

export const getActiveStoryPoetryParticulars = async (type) => {
  const response = await fetch(
    `${API_BASE_URL}/api/StoryPoetryParticular/Active/${encodeURIComponent(
      type
    )}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Failed to fetch active particulars."
    );
  }

  return data;
};


// =========================================================
// ADMIN - GET PARTICULAR BY ID
// =========================================================

export const getStoryPoetryParticularById = async (id) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/api/StoryPoetryParticular/${id}`,
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
      data?.message || "Failed to fetch particular."
    );
  }

  return data;
};


// =========================================================
// ADMIN - ADD PARTICULAR
// =========================================================

export const addStoryPoetryParticular = async (particularData) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/api/StoryPoetryParticular`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: particularData.type,
        name: particularData.name,
        extraCopyPrice: Number(particularData.extraCopyPrice),
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Failed to add particular."
    );
  }

  return data;
};


// =========================================================
// ADMIN - DEACTIVATE PARTICULAR
// =========================================================

export const deactivateStoryPoetryParticular = async (id) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/api/StoryPoetryParticular/${id}/deactivate`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Failed to deactivate particular."
    );
  }

  return data;
};