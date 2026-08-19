import { API_BASE_URL } from "./api";

const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Register for an event
export const registerForEvent = async ({
  eventId,
  numberOfSeats,
}) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("You are not logged in.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/EventRegistration`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        eventId: Number(eventId),
        numberOfSeats: Number(numberOfSeats)
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Event registration failed."
    );
  }

  return data;
};

// Get logged-in user's registrations
export const getMyRegistrations = async () => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("You are not logged in.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/EventRegistration/MyRegistrations`,
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
      data?.message || "Failed to load registrations."
    );
  }

  return data;
};

// Get all event registrations - Admin only
export const getAllEventRegistrations = async () => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("You are not logged in.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/EventRegistration`,
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
      data?.message || "Failed to load event registrations."
    );
  }

  return data;
};

// Create Razorpay order for event payment
export const createEventPayment = async (eventRegistrationId) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("You are not logged in.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/Payment/event`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        eventRegistrationId: Number(eventRegistrationId),
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Failed to create payment order."
    );
  }

  return data;
};

// Verify Razorpay payment
export const verifyEventPayment = async ({
  paymentId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("You are not logged in.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/Payment/verify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        paymentId: Number(paymentId),
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Payment verification failed."
    );
  }

  return data;
};