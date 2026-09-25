import { API_BASE_URL } from "./api";

// =========================================================
// ADD STORY / POETRY
// =========================================================

export const addStoryPoetry = async (storyPoetryData) => {
  const token = localStorage.getItem("token");

  const formData = new FormData();

  formData.append("Title", storyPoetryData.title);
  formData.append("Type", storyPoetryData.type);
  formData.append("Content", storyPoetryData.content);

  formData.append(
    "StoryPoetryParticularId",
    storyPoetryData.storyPoetryParticularId,
  );

  formData.append(
    "ContributorNameMalayalam",
    storyPoetryData.contributorNameMalayalam,
  );

  formData.append(
    "ContributorAddressMalayalam",
    storyPoetryData.contributorAddressMalayalam || "",
  );

  formData.append("ContributorAddress", storyPoetryData.contributorAddress);

  formData.append("ContributorPincode", storyPoetryData.contributorPincode);

  formData.append(
    "ContributorDistrictMalayalam",
    storyPoetryData.contributorDistrictMalayalam,
  );

  formData.append(
    "ContributorCityMalayalam",
    storyPoetryData.contributorCityMalayalam,
  );

  formData.append("ContributorEmail", storyPoetryData.contributorEmail);

  formData.append("ContributorPhone", storyPoetryData.contributorPhone);

  formData.append(
    "ContributorProfileImage",
    storyPoetryData.contributorProfileImage,
  );

  const response = await fetch(`${API_BASE_URL}/api/StoryPoetry`, {
    method: "POST",

    headers: {
      Authorization: `Bearer ${token}`,
    },

    body: formData,
  });

  // =========================================================
  // READ RESPONSE SAFELY
  // =========================================================

  const contentType = response.headers.get("content-type") || "";

  let data = null;
  let responseText = "";

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    responseText = await response.text();
  }

  // =========================================================
  // HANDLE ERROR
  // =========================================================

  if (!response.ok) {
    // Backend validation / normal JSON error
    if (data?.message) {
      throw new Error(data.message);
    }

    // ASP.NET error response may contain the exception text
    if (responseText) {
      if (
        responseText.includes("You have already submitted to this category")
      ) {
        throw new Error(
          "You have already submitted to this particular. Please choose another.",
        );
      }

      if (responseText.includes("You have already submitted this particular")) {
        throw new Error(
          "You have already submitted to this particular. Please choose another.",
        );
      }
    }

    // Fallback
    throw new Error("Failed to submit Story/Poetry.");
  }

  return data;
};

// =========================================================
// GET MY STORY / POETRY
// =========================================================

export const getMyStoryPoetry = async () => {
  const response = await fetch(`${API_BASE_URL}/api/StoryPoetry/my`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to load your submissions.");
  }

  return data;
};

// =========================================================
// GET STORY / POETRY BY ID
// =========================================================

/* export const getStoryPoetryById = async (id) => {

  const response = await fetch(
    `${API_BASE_URL}/api/StoryPoetry/${id}`,
    {
      headers: {
        Authorization:
          `Bearer ${localStorage.getItem('token')}`
      }
    }
  );


  const data = await response.json();


  if (!response.ok) {

    throw new Error(
      data?.message ||
      'Failed to load Story/Poetry.'
    );

  }


  return data;
}; */

// =========================================================
// UPDATE STORY / POETRY
// =========================================================

export const updateStoryPoetry = async (id, storyPoetryData) => {
  const token = localStorage.getItem("token");

  const formData = new FormData();

  formData.append("Title", storyPoetryData.title);
  formData.append("Type", storyPoetryData.type);
  formData.append("Content", storyPoetryData.content);

  formData.append(
    "StoryPoetryParticularId",
    storyPoetryData.storyPoetryParticularId,
  );

  formData.append(
    "ContributorNameMalayalam",
    storyPoetryData.contributorNameMalayalam,
  );

  formData.append(
    "ContributorAddressMalayalam",
    storyPoetryData.contributorAddressMalayalam,
  );

  formData.append("ContributorAddress", storyPoetryData.contributorAddress);

  formData.append("ContributorPincode", storyPoetryData.contributorPincode);

  formData.append(
    "ContributorDistrictMalayalam",
    storyPoetryData.contributorDistrictMalayalam,
  );

  formData.append(
    "ContributorCityMalayalam",
    storyPoetryData.contributorCityMalayalam,
  );

  formData.append("ContributorEmail", storyPoetryData.contributorEmail);

  formData.append("ContributorPhone", storyPoetryData.contributorPhone);

  // Only append image if user selected a new one

  if (storyPoetryData.contributorProfileImage) {
    formData.append(
      "ContributorProfileImage",
      storyPoetryData.contributorProfileImage,
    );
  }

  const response = await fetch(`${API_BASE_URL}/api/StoryPoetry/${id}`, {
    method: "PUT",

    headers: {
      Authorization: `Bearer ${token}`,
    },

    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to update Story/Poetry.");
  }

  return data;
};

// =========================================================
// DELETE STORY / POETRY
// =========================================================

export const deleteStoryPoetry = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/StoryPoetry/${id}`, {
    method: "DELETE",

    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to delete Story/Poetry.");
  }

  return data;
};

// =========================================================
// ADMIN - GET ALL
// =========================================================

export const getAllStoryPoetry = async () => {
  const response = await fetch(`${API_BASE_URL}/api/StoryPoetry/admin/all`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Failed to load Story/Poetry submissions.",
    );
  }

  return data;
};

// Get Story / Poetry / Special submission by ID
export const getStoryPoetryById = async (id) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("You are not logged in.");
  }

  const response = await fetch(`${API_BASE_URL}/api/StoryPoetry/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to load submission details.");
  }

  return data;
};

// =========================================================
// ADMIN - APPROVE
// =========================================================

export const approveStoryPoetry = async (id, adminRemarks) => {
  const response = await fetch(
    `${API_BASE_URL}/api/StoryPoetry/admin/${id}/approve`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },

      body: JSON.stringify(adminRemarks),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to approve submission.");
  }

  return data;
};

// =========================================================
// ADMIN - REJECT
// =========================================================

export const rejectStoryPoetry = async (id, adminRemarks) => {
  const response = await fetch(
    `${API_BASE_URL}/api/StoryPoetry/admin/${id}/reject`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },

      body: JSON.stringify(adminRemarks),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to reject submission.");
  }

  return data;
};

// =========================================================
// UPDATE BARCODE
// =========================================================

export const updateStoryPoetryBarcode = async (id, barcode) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/api/StoryPoetry/${id}/barcode`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        barcode: barcode.trim(),
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || data?.title || "Failed to update barcode.",
    );
  }

  return data;
};

// =========================================================
// ADMIN - UPDATE SP ORDER STATUS
// =========================================================

export const updateStoryPoetryOrderStatus = async (id, status) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/api/StoryPoetry/${id}/order-status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || data?.title || "Failed to update order status.",
    );
  }

  return data;
};

// =========================================================
// ADMIN - STORY / POETRY COPY SETTINGS
// =========================================================

export const getStoryPoetryCopySettings = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/api/StoryPoetryCopySetting`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Failed to load Story/Poetry copy settings.",
    );
  }

  return data;
};

// =========================================================
// ADMIN - UPDATE STORY / POETRY FREE COPIES
// =========================================================

export const updateStoryPoetryCopySetting = async (id, freeCopies) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/api/StoryPoetryCopySetting/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        freeCopies,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to update free copies.");
  }

  return data;
};

// =========================================================
// ADMIN - GET STORY POETRY + EVENT REPORT
// =========================================================

export const getStoryPoetryEventReport = async (fromDate, toDate) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("You are not logged in.");
  }

  const params = new URLSearchParams();

  if (fromDate) {
    params.append("fromDate", fromDate);
  }

  if (toDate) {
    params.append("toDate", toDate);
  }

  const queryString = params.toString();

  const response = await fetch(
    `${API_BASE_URL}/api/StoryPoetry/event-report${
      queryString ? `?${queryString}` : ""
    }`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.message || "Failed to load report.");
  }

  return result;
};

// =========================================================
// ADMIN - GET EVENT COPY PREPARATION REPORT
// =========================================================

export const getEventCopyPreparationReport = async (eventId) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("You are not logged in.");
  }

  if (!eventId) {
    throw new Error("Please select an event.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/StoryPoetry/event-copy-preparation-report?eventId=${eventId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message || "Failed to load event copy preparation report.",
    );
  }

  console.log("EVENT COPY REPORT SERVICE RESPONSE:", result);

  return Array.isArray(result) ? result : result?.data || [];
};
