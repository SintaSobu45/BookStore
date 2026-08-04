import { API_BASE_URL } from "./api";

const PUBLISHER_URL = `${API_BASE_URL}/Publisher`;

// GET all publishers
export const getPublishers = async () => {
  const response = await fetch(PUBLISHER_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch publishers");
  }

  return await response.json();
};

// GET publisher by ID
export const getPublisherById = async (id) => {
  const response = await fetch(`${PUBLISHER_URL}/${id}`);

  if (!response.ok) {
    throw new Error("Publisher not found");
  }

  return await response.json();
};

// CREATE publisher
export const createPublisher = async (publisher, token) => {
  const response = await fetch(PUBLISHER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(publisher),
  });

  if (!response.ok) {
    throw new Error("Failed to create publisher");
  }

  return await response.text();
};

// UPDATE publisher
export const updatePublisher = async (id, publisher, token) => {
  const response = await fetch(`${PUBLISHER_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(publisher),
  });

  if (!response.ok) {
    throw new Error("Failed to update publisher");
  }

  return await response.text();
};

// DELETE publisher
export const deletePublisher = async (id, token) => {
  const response = await fetch(`${PUBLISHER_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete publisher");
  }

  return await response.text();
};