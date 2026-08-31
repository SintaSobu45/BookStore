import React, { useEffect, useState } from "react";
import { getEvents, deleteEvent } from "../../services/eventService";

import { getAllEventRegistrations } from "../../services/eventRegistrationService";

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

      setRegistrations(data);
    } catch (error) {
      console.error("Failed to load registrations:", error);

      setRegistrationError(
        error.message || "Unable to load event registrations.",
      );
    } finally {
      setRegistrationLoading(false);
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
    const searchTerm = registrationSearch.toLowerCase().trim();

    if (!searchTerm) return true;

    const userName = registration.userName?.toLowerCase() || "";

    const email = registration.email?.toLowerCase() || "";

    const event = registration.eventName?.toLowerCase() || "";

    return userName.includes(searchTerm) || email.includes(searchTerm) || event.includes(searchTerm);
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

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by registered user or email..."
              value={registrationSearch}
              onChange={(e) => setRegistrationSearch(e.target.value)}
              className="w-full md:w-96 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
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

                <div className="border-t border-gray-200 bg-gray-50 px-6 py-5 flex flex-col sm:flex-row justify-between sm:items-center gap-3" style={{marginTop:"50px"}}>
                  <div>
                    <p className="text-sm text-gray-500">
                      Total Amount Received
                    </p>

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
