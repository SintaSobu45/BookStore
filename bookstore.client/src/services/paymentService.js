import { API_BASE_URL } from "./api";


// =========================================================
// CREATE EVENT PAYMENT
// =========================================================

export const createEventPayment = async (eventRegistrationId) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_BASE_URL}/api/Payment/event`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          eventRegistrationId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Failed to create payment order."
      );
    }

    return data;

  } catch (error) {
    console.error(
      "Create event payment error:",
      error
    );

    throw new Error(
      error.message ||
        "Failed to create payment order."
    );
  }
};


// =========================================================
// VERIFY EVENT PAYMENT
// =========================================================

export const verifyPayment = async ({
  paymentId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_BASE_URL}/api/Payment/verify`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          paymentId,
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Payment verification failed."
      );
    }

    return data;

  } catch (error) {
    console.error(
      "Payment verification error:",
      error
    );

    throw new Error(
      error.message ||
        "Payment verification failed."
    );
  }
};


// =========================================================
// CREATE STORY / POETRY PAYMENT
// =========================================================

export const createStoryPoetryPayment = async (
  storyPoetryId
) => {
  try {
    console.log(
      "🚀 Creating Story/Poetry payment:",
      storyPoetryId
    );

    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error(
        "Please login before making payment."
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/api/StoryPoetryPayment`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          storyPoetryId,
        }),
      }
    );

    const data = await response.json();

    console.log(
      "📦 Story/Poetry payment response:",
      data
    );

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Failed to create Story/Poetry payment order."
      );
    }

    return data;

  } catch (error) {
    console.error(
      "❌ Create Story/Poetry payment error:",
      error
    );

    throw new Error(
      error.message ||
        "Failed to create Story/Poetry payment order."
    );
  }
};


// =========================================================
// VERIFY STORY / POETRY PAYMENT
// =========================================================

export const verifyStoryPoetryPayment = async ({
  paymentId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  try {
    console.log(
      "🚀 Verifying Story/Poetry payment..."
    );

    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error(
        "Please login before verifying payment."
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/api/StoryPoetryPayment/verify`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          paymentId,
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
        }),
      }
    );

    const data = await response.json();

    console.log(
      "📦 Payment verification response:",
      data
    );

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Story/Poetry payment verification failed."
      );
    }

    return data;

  } catch (error) {
    console.error(
      "❌ Story/Poetry payment verification error:",
      error
    );

    throw new Error(
      error.message ||
        "Story/Poetry payment verification failed."
    );
  }
};