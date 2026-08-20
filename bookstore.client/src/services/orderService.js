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