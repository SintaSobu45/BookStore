import { API_BASE_URL } from "./api";

const CATEGORY_URL = `${API_BASE_URL}/api/Category`;

export const getCategories = async () => {
  const response = await fetch(CATEGORY_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return await response.json();
};

export const getCategoryById = async (id) => {
  const response = await fetch(`${CATEGORY_URL}/api/${id}`);

  if (!response.ok) {
    throw new Error("Category not found");
  }

  return await response.json();
};

export const createCategory = async (category, token) => {
  const response = await fetch(CATEGORY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(category),
  });

  if (!response.ok) {
    throw new Error("Failed to create category");
  }

  return await response.text();
};

export const updateCategory = async (id, category, token) => {
  const response = await fetch(`${CATEGORY_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(category),
  });

  if (!response.ok) {
    throw new Error("Failed to update category");
  }

  return await response.text();
};

export const deleteCategory = async (id, token) => {
  const response = await fetch(`${CATEGORY_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete category");
  }

  return await response.text();
};