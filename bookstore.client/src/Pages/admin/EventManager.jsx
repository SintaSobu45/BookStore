import React, { useEffect, useState, useMemo } from "react";
import { getEvents, deleteEvent } from "../../services/eventService";

import {
  getAllEventRegistrations,
  markAttendance,
} from "../../services/eventRegistrationService";

import EventModal from "./EventModal";

function EventManager() {
  // =====================================================
  // ACTIVE SECTION
  // =====================================================

  const [activeTab, setActiveTab] = useState("events");

  // =====================================================
  // EVENTS
  // =====================================================

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [loading, setLoading] = useState(true);

  // =====================================================
  // EVENT REGISTRATIONS
  // =====================================================

  const [registrations, setRegistrations] = useState([]);
  const [registrationSearch, setRegistrationSearch] = useState("");
  const [registrationLoading, setRegistrationLoading] = useState(false);

  const [registrationError, setRegistrationError] = useState("");
  //attendance
  const [selectedRegistrations, setSelectedRegistrations] = useState([]);
  const [selectedRegistrationEvent, setSelectedRegistrationEvent] =
    useState("All");
  const [attendanceLoading, setAttendanceLoading] = useState(null);

  // =====================================================
  // LOAD EVENTS
  // =====================================================

  useEffect(() => {
    loadEvents();
  }, []);

  // =====================================================
  // FILTER EVENTS
  // =====================================================

  useEffect(() => {
    const result = events.filter((event) =>
      event.eventName.toLowerCase().includes(search.toLowerCase()),
    );

    setFilteredEvents(result);
  }, [search, events]);

  // =====================================================
  // LOAD EVENTS
  // =====================================================

  const loadEvents = async () => {
    try {
      setLoading(true);

      const data = await getEvents();

      setEvents(data);
      setFilteredEvents(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD ALL REGISTRATIONS
  // =====================================================

  const loadRegistrations = async () => {
    try {
      setRegistrationLoading(true);
      setRegistrationError("");

      const data = await getAllEventRegistrations();

      console.log("All event registrations:", data);

      // Only show successful/paid registrations
      const paidRegistrations = data.filter((registration) => {
        const status = registration.paymentStatus?.toLowerCase();

        return status === "paid" || status === "completed";
      });

      console.log("Paid registrations:", paidRegistrations);

      setRegistrations(paidRegistrations);

      // Select all registrations that are not already attended
      setSelectedRegistrations(
        paidRegistrations
          .filter(
            (registration) =>
              registration.attendanceStatus?.toLowerCase() !== "attended",
          )
          .map((registration) => registration.registrationId),
      );
    } catch (error) {
      console.error("Failed to load registrations:", error);

      setRegistrationError(
        error.message || "Unable to load event registrations.",
      );
    } finally {
      setRegistrationLoading(false);
    }
  };

  const registrationEventOptions = useMemo(() => {
    const events = new Map();

    registrations.forEach((registration) => {
      const eventId = registration?.eventId;
      const eventName = registration?.eventName;

      if (eventId && eventName) {
        events.set(String(eventId), eventName);
      }
    });

    return Array.from(events.entries()).map(([eventId, eventName]) => ({
      eventId,
      eventName,
    }));
  }, [registrations]);

  // =====================================================
  // MARK ATTENDANCE
  // =====================================================

  const handleMarkAttendance = async (registrationId) => {
    try {
      setAttendanceLoading(registrationId);

      await markAttendance(registrationId);

      // Refetch registrations after successful update
      await loadRegistrations();
    } catch (error) {
      console.error("Failed to mark attendance:", error);

      alert(error.message || "Failed to mark attendance.");
    } finally {
      setAttendanceLoading(null);
    }
  };

  // =====================================================
  // ATTENDANCE SELECTION
  // =====================================================

  const handleSelectRegistration = (registrationId) => {
    setSelectedRegistrations((previous) => {
      if (previous.includes(registrationId)) {
        return previous.filter((id) => id !== registrationId);
      }

      return [...previous, registrationId];
    });
  };

  const handleSelectAll = () => {
    const selectableRegistrations = filteredRegistrations
      .filter(
        (registration) =>
          registration.attendanceStatus?.toLowerCase() !== "attended",
      )
      .map((registration) => registration.registrationId);

    const allSelected = selectableRegistrations.every((id) =>
      selectedRegistrations.includes(id),
    );

    if (allSelected) {
      setSelectedRegistrations([]);
    } else {
      setSelectedRegistrations(selectableRegistrations);
    }
  };

  // =====================================================
  // MARK SELECTED AS ATTENDED
  // =====================================================

  const handleMarkSelectedAttended = async () => {
    if (selectedRegistrations.length === 0) {
      alert("Please select at least one registration.");
      return;
    }

    try {
      setAttendanceLoading(true);

      await Promise.all(
        selectedRegistrations.map((registrationId) =>
          markAttendance(registrationId),
        ),
      );

      await loadRegistrations();

      alert("Selected registrations marked as attended.");
    } catch (error) {
      console.error("Failed to mark attendance:", error);

      alert(error.message || "Failed to mark attendance.");
    } finally {
      setAttendanceLoading(false);
    }
  };

  // =====================================================
  // SWITCH TAB
  // =====================================================

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    if (tab === "registrations") {
      loadRegistrations();
    }
  };

  // =====================================================
  // EVENT ACTIONS
  // =====================================================

  const handleAdd = () => {
    setSelectedEvent(null);
    setShowModal(true);
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;

    try {
      await deleteEvent(id);

      loadEvents();
    } catch {
      alert("Unable to delete.");
    }
  };

  // =====================================================
  // PAYMENT STATUS BADGE
  // =====================================================

  const getPaymentStatusBadge = (status) => {
    const normalizedStatus = status?.toLowerCase() || "";

    if (normalizedStatus === "paid" || normalizedStatus === "completed") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          Paid
        </span>
      );
    }

    if (normalizedStatus === "pending") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
          Pending
        </span>
      );
    }

    if (normalizedStatus === "failed" || normalizedStatus === "cancelled") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
          {status}
        </span>
      );
    }

    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
        {status || "Unknown"}
      </span>
    );
  };

  // =====================================================
  // FILTER REGISTRATIONS
  // =====================================================

  const filteredRegistrations = registrations.filter((registration) => {
    // Event filter
    if (
      selectedRegistrationEvent !== "All" &&
      String(registration.eventId) !== String(selectedRegistrationEvent)
    ) {
      return false;
    }

    // Search filter
    const searchTerm = registrationSearch.toLowerCase().trim();

    if (!searchTerm) return true;

    const userName = registration.userName?.toLowerCase() || "";

    const email = registration.email?.toLowerCase() || "";

    const event = registration.eventName?.toLowerCase() || "";

    return (
      userName.includes(searchTerm) ||
      email.includes(searchTerm) ||
      event.includes(searchTerm)
    );
  });

  // =====================================================
  // TOTAL EVENT AMOUNT
  // =====================================================

  const totalEventAmount = registrations.reduce((total, registration) => {
    const amount = Number(registration.totalAmount) || 0;

    return total + amount;
  }, 0);

  return (
    <div className="mt-5">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Event Management</h1>

          <p className="text-gray-500">
            Manage bookstore events and registrations
          </p>
        </div>

        {activeTab === "events" && (
          <button
            onClick={handleAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl mt-4 md:mt-0"
          >
            + Add Event
          </button>
        )}
      </div>

      {/* =====================================================
          TABS
      ===================================================== */}

      <div className="flex gap-2 border-b border-gray-200 mb-6">
        <button
          onClick={() => handleTabChange("events")}
          className={`px-5 py-3 font-medium transition-colors ${
            activeTab === "events"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Events
        </button>

        <button
          onClick={() => handleTabChange("registrations")}
          className={`px-5 py-3 font-medium transition-colors ${
            activeTab === "registrations"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Event Registrations
        </button>
      </div>

      {/* =====================================================
          EVENTS TAB
      ===================================================== */}

      {activeTab === "events" && (
        <>
          {/* Search */}

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search event..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-96 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Loading */}

          {loading && <div className="text-center py-20">Loading...</div>}

          {/* Empty */}

          {!loading && filteredEvents.length === 0 && (
            <div className="bg-white rounded-xl shadow p-10 text-center">
              <h3 className="text-xl font-semibold">No Events Found</h3>
            </div>
          )}

          {/* Events Table */}

          {!loading && filteredEvents.length > 0 && (
            <div className="bg-white rounded-2xl shadow overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-4 text-left">Image</th>

                    <th className="p-4 text-left">Event</th>

                    <th className="p-4 text-left">Date</th>

                    <th className="p-4 text-left">Venue</th>

                    <th className="p-4 text-left">Seats</th>

                    <th className="p-4 text-left">Fee</th>

                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEvents.map((event) => (
                    <tr
                      key={event.eventId}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="p-4">
                        <img
                          src={event.imageUrl}
                          alt=""
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      </td>

                      <td className="p-4 font-medium">{event.eventName}</td>

                      <td className="p-4">
                        {new Date(event.eventDate).toLocaleDateString()}
                      </td>

                      <td className="p-4">{event.venue}</td>

                      <td className="p-4">{event.maxSeats}</td>

                      <td className="p-4">₹{event.entryFee}</td>

                      <td className="p-4">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleEdit(event)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded-lg"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(event.eventId)}
                            className="bg-red-600 text-white px-3 py-1 rounded-lg"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* =====================================================
    REGISTRATIONS TAB
===================================================== */}

      {activeTab === "registrations" && (
        <>
          {/* =====================================================
        SEARCH REGISTRATIONS
    ===================================================== */}

          <div className="mb-6 flex flex-col md:flex-row gap-3">
            {/* Search */}
            <input
              type="text"
              placeholder="Search by registered user or email..."
              value={registrationSearch}
              onChange={(e) => setRegistrationSearch(e.target.value)}
              className="w-full md:w-96 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {/* Event Filter */}
            <select
              value={selectedRegistrationEvent}
              onChange={(e) => setSelectedRegistrationEvent(e.target.value)}
              className="w-full md:w-72 border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Events</option>

              {registrationEventOptions.map((event) => (
                <option key={event.eventId} value={event.eventId}>
                  {event.eventName}
                </option>
              ))}
            </select>
          </div>

          {/* =====================================================
        LOADING
    ===================================================== */}

          {registrationLoading && (
            <div className="text-center py-20">Loading registrations...</div>
          )}

          {/* =====================================================
        ERROR
    ===================================================== */}

          {!registrationLoading && registrationError && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-5">
              {registrationError}
            </div>
          )}

          {/* =====================================================
        EMPTY - NO REGISTRATIONS
    ===================================================== */}

          {!registrationLoading &&
            !registrationError &&
            registrations.length === 0 && (
              <div className="bg-white rounded-xl shadow p-10 text-center">
                <h3 className="text-xl font-semibold">
                  No Event Registrations Found
                </h3>

                <p className="text-gray-500 mt-2">
                  No users have registered for events yet.
                </p>
              </div>
            )}

          {/* =====================================================
        NO SEARCH RESULTS
    ===================================================== */}

          {!registrationLoading &&
            !registrationError &&
            registrations.length > 0 &&
            filteredRegistrations.length === 0 && (
              <div className="bg-white rounded-xl shadow p-10 text-center">
                <h3 className="text-xl font-semibold">
                  No Registrations Found
                </h3>

                <p className="text-gray-500 mt-2">
                  No registered user or email matches your search.
                </p>
              </div>
            )}

          {/* =====================================================
    ATTENDANCE CONTROLS
===================================================== */}

          {!registrationLoading &&
            !registrationError &&
            registrations.length > 0 && (
              <div className="bg-white rounded-2xl shadow p-5 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={
                        filteredRegistrations.filter(
                          (registration) =>
                            registration.attendanceStatus?.toLowerCase() !==
                            "attended",
                        ).length > 0 &&
                        filteredRegistrations
                          .filter(
                            (registration) =>
                              registration.attendanceStatus?.toLowerCase() !==
                              "attended",
                          )
                          .every((registration) =>
                            selectedRegistrations.includes(
                              registration.registrationId,
                            ),
                          )
                      }
                      onChange={handleSelectAll}
                      className="w-5 h-5 cursor-pointer"
                    />

                    <span className="font-medium text-gray-700">
                      Select All
                    </span>

                    <span className="text-sm text-gray-500">
                      ({selectedRegistrations.length} selected)
                    </span>
                  </div>

                  <button
                    onClick={handleMarkSelectedAttended}
                    disabled={
                      attendanceLoading || selectedRegistrations.length === 0
                    }
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-5 py-2.5 rounded-xl font-medium"
                  >
                    {attendanceLoading
                      ? "Marking Attendance..."
                      : "Mark Selected as Attended"}
                  </button>
                </div>
              </div>
            )}

          {/* =====================================================
        REGISTRATIONS TABLE
    ===================================================== */}

          {!registrationLoading &&
            !registrationError &&
            filteredRegistrations.length > 0 && (
              <div className="bg-white rounded-2xl shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full whitespace-nowrap">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-4 text-left"></th>

                        <th className="p-4 text-left">Attendance</th>

                        <th className="p-4 text-left">User</th>

                        <th className="p-4 text-left">Contact</th>

                        <th className="p-4 text-left">Event</th>

                        <th className="p-4 text-left">Seats</th>

                        <th className="p-4 text-left">Amount</th>

                        <th className="p-4 text-left">Payment</th>

                        <th className="p-4 text-left">Method</th>

                        <th className="p-4 text-left">Registered On</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredRegistrations.map((registration) => (
                        <tr
                          key={registration.registrationId}
                          className="border-t hover:bg-gray-50"
                        >
                          {/* SELECT */}

                          <td className="p-4 text-center">
                            {registration.attendanceStatus?.toLowerCase() ===
                            "attended" ? (
                              <span className="text-gray-400">—</span>
                            ) : (
                              <input
                                type="checkbox"
                                checked={selectedRegistrations.includes(
                                  registration.registrationId,
                                )}
                                onChange={() =>
                                  handleSelectRegistration(
                                    registration.registrationId,
                                  )
                                }
                                className="w-5 h-5 cursor-pointer"
                              />
                            )}
                          </td>

                          {/* ATTENDANCE */}

                          <td className="p-4">
                            {registration.attendanceStatus?.toLowerCase() ===
                            "attended" ? (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                Attended
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                                Registered
                              </span>
                            )}
                          </td>

                          {/* USER */}

                          <td className="p-4">
                            <p className="font-semibold text-gray-900">
                              {registration.userName}
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                              {registration.email}
                            </p>
                          </td>

                          {/* PHONE */}

                          <td className="p-4 text-sm">
                            {registration.phone || "-"}
                          </td>

                          {/* EVENT */}

                          <td className="p-4">
                            <p className="font-medium">
                              {registration.eventName}
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(
                                registration.eventDate,
                              ).toLocaleDateString()}
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                              {registration.venue}
                            </p>
                          </td>

                          {/* SEATS */}

                          <td className="p-4">{registration.numberOfSeats}</td>

                          {/* AMOUNT */}

                          <td className="p-4 font-semibold">
                            ₹
                            {Number(registration.totalAmount).toLocaleString(
                              "en-IN",
                            )}
                          </td>

                          {/* PAYMENT STATUS */}

                          <td className="p-4">
                            {getPaymentStatusBadge(registration.paymentStatus)}
                          </td>

                          {/* PAYMENT METHOD */}

                          <td className="p-4 text-sm">
                            {registration.paymentMethod || "-"}
                          </td>

                          {/* REGISTRATION DATE */}

                          <td className="p-4 text-sm text-gray-600">
                            {registration.registrationDate
                              ? new Date(
                                  registration.registrationDate,
                                ).toLocaleString("en-IN")
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          {/* =====================================================
              TOTAL AMOUNT
          ===================================================== */}

          <div
            className="border-t border-gray-200 bg-gray-50 px-6 py-5 flex flex-col sm:flex-row justify-between sm:items-center gap-3"
            style={{ marginTop: "50px" }}
          >
            <div>
              <p className="text-sm text-gray-500">Total Amount Received</p>

              <p className="text-xs text-gray-400 mt-1">
                From all event registrations
              </p>
            </div>

            <p className="text-2xl font-bold text-green-700">
              ₹{totalEventAmount.toLocaleString("en-IN")}
            </p>
          </div>
        </>
      )}

      {/* =====================================================
          EVENT MODAL
      ===================================================== */}

      <EventModal
        show={showModal}
        onClose={() => setShowModal(false)}
        eventData={selectedEvent}
        refresh={loadEvents}
      />
    </div>
  );
}

export default EventManager;
