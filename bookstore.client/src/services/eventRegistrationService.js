import { API_BASE_URL } from "./api";

const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Register for an event
export const registerForEvent = async ({
  eventId,
  numberOfSeats,
  bookCopies,
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
        numberOfSeats: Number(numberOfSeats),
        bookCopies: Number(bookCopies),
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