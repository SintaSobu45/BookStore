import { API_BASE_URL } from "./api";

const getToken = () => {
  return localStorage.getItem("token");
};

const getGuestCartId = () => {
  let guestCartId = localStorage.getItem("guestCartId");

  if (!guestCartId) {
    guestCartId = crypto.randomUUID();
    localStorage.setItem("guestCartId", guestCartId);
  }

  return guestCartId;
};

const getHeaders = () => {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
};

// =========================================================
// GET CART
// =========================================================

export const getCart = async () => {
  const guestCartId = getGuestCartId();

  const response = await fetch(
    `${API_BASE_URL}/api/Cart?guestCartId=${guestCartId}`,
    {
      headers: getHeaders(),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load cart");
  }

  return data;
};

// =========================================================
// ADD TO CART
// =========================================================

export const addToCart = async (bookId, quantity = 1) => {
  const response = await fetch(`${API_BASE_URL}/api/Cart/add`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      bookId,
      quantity,
      guestCartId: getGuestCartId(),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to add book to cart");
  }

  return data;
};

// =========================================================
// UPDATE QUANTITY
// =========================================================

export const updateCartQuantity = async (cartItemId, quantity) => {
  const guestCartId = getGuestCartId();

  const response = await fetch(
    `${API_BASE_URL}/api/Cart/item/${cartItemId}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({
        quantity,
        guestCartId,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update quantity");
  }

  return data;
};

// =========================================================
// REMOVE ITEM
// =========================================================

export const removeCartItem = async (cartItemId) => {
  const guestCartId = getGuestCartId();

  const response = await fetch(
    `${API_BASE_URL}/api/Cart/item/${cartItemId}?guestCartId=${guestCartId}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to remove item");
  }

  return data;
};

// =========================================================
// CLEAR CART
// =========================================================

export const clearCart = async () => {
  const guestCartId = getGuestCartId();

  const response = await fetch(
    `${API_BASE_URL}/api/Cart/clear?guestCartId=${guestCartId}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to clear cart");
  }

  return data;
};

// =========================================================
// MERGE GUEST CART AFTER LOGIN
// =========================================================

export const mergeGuestCart = async () => {
  const guestCartId = localStorage.getItem("guestCartId");

  if (!guestCartId) return null;

  const response = await fetch(
    `${API_BASE_URL}/api/Cart/merge?guestCartId=${guestCartId}`,
    {
      method: "POST",
      headers: getHeaders(),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to merge guest cart");
  }

  localStorage.removeItem("guestCartId");

  return data;
};