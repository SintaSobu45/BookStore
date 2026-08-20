import { API_BASE_URL } from "./api";

const getToken = () => {
  return localStorage.getItem("token");
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
// CREATE BOOK PAYMENT
// =========================================================

export const createBookPayment = async (orderId) => {
  const response = await fetch(
    `${API_BASE_URL}/api/BookPayment/create`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        orderId,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create payment");
  }

  return data;
};

// =========================================================
// VERIFY BOOK PAYMENT
// =========================================================

export const verifyBookPayment = async (paymentData) => {
  const response = await fetch(
    `${API_BASE_URL}/api/BookPayment/verify`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(paymentData),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Payment verification failed");
  }

  return data;
};