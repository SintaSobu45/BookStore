import { API_BASE_URL } from "./api";

const EVENT_URL = `${API_BASE_URL}/api/Event`;

// Get all events
export const getEvents = async () => {
    const response = await fetch(EVENT_URL);

    if (!response.ok) {
        throw new Error("Failed to fetch events");
    }

    return await response.json();
};

// Get event by id
export const getEventById = async (id) => {
    const response = await fetch(`${EVENT_URL}/${id}`);

    if (!response.ok) {
        throw new Error("Failed to fetch event");
    }

    return await response.json();
};

// Create Event
export const createEvent = async (formData) => {
    const token = localStorage.getItem("token");

    const response = await fetch(EVENT_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error("Failed to create event");
    }

    return await response.json();
};

// Update Event
export const updateEvent = async (id, formData) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${EVENT_URL}/${id}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error("Failed to update event");
    }

    return await response.json();
};

// Delete Event
export const deleteEvent = async (id) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${EVENT_URL}/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to delete event");
    }

    return await response.json();
};