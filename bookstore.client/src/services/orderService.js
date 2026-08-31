import { API_BASE_URL } from "./api";

const getToken = () => {
  return localStorage.getItem("token");
};

const getGuestCartId = () => {
  return localStorage.getItem("guestCartId");
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
// CREATE ORDER
// =========================================================

export const createOrder = async (orderData) => {
  const token = getToken();

  const requestBody = {
    ...orderData,

    // Send GuestCartId only when user is not logged in
    ...(!token && {
      guestCartId: getGuestCartId(),
    }),
  };

  const response = await fetch(`${API_BASE_URL}/api/Order`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create order");
  }

  return data;
};


// =========================================================
// GET MY ORDERS
// =========================================================

export const getMyOrders = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("Please login to view your orders.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/Order/my-orders`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load orders"
    );
  }

  return data;
};


// =========================================================
// GET ORDER BY ID
// LOGGED-IN USER
// =========================================================

export const getOrderById = async (orderId) => {
  const token = getToken();

  if (!token) {
    throw new Error("Please login to view this order.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/Order/${orderId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load order.",
    );
  }

  return data;
};


// =========================================================
// GET GUEST ORDER
// =========================================================

export const getGuestOrder = async (guestOrderId) => {
  const response = await fetch(
    `${API_BASE_URL}/api/Order/guest/${guestOrderId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load guest order.",
    );
  }

  return data;
};


// =========================================================
// GET ALL ORDERS - ADMIN
// =========================================================

export const getAllOrders = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication required.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/Order`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load all orders.",
    );
  }

  return data;
};


// =========================================================
// UPDATE ORDER STATUS - ADMIN
// =========================================================

export const updateOrderStatus = async (
  orderId,
  status,
) => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication required.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/Order/${orderId}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(status),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to update order status.",
    );
  }

  return data;
};