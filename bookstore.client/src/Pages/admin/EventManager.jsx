import React, { useEffect, useState } from "react";
import {
  getEvents,
  deleteEvent
} from "../../services/eventService";
import EventModal from "./EventModal";

function EventManager() {

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {

    const result = events.filter(event =>
      event.eventName.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredEvents(result);

  }, [search, events]);

  const loadEvents = async () => {

    try {

      const data = await getEvents();

      setEvents(data);
      setFilteredEvents(data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  };

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

  return (

    <div>

      {/* Header */}

      <div className="flex flex-col md:flex-row justify-between items-center mb-6">

        <div>

          <h1 className="text-3xl font-bold">

            Event Management

          </h1>

          <p className="text-gray-500">

            Manage bookstore events

          </p>

        </div>

        <button
          onClick={handleAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl mt-4 md:mt-0"
        >
          + Add Event
        </button>

      </div>

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

      {loading && (

        <div className="text-center py-20">

          Loading...

        </div>

      )}

      {/* Empty */}

      {!loading && filteredEvents.length === 0 && (

        <div className="bg-white rounded-xl shadow p-10 text-center">

          <h3 className="text-xl font-semibold">

            No Events Found

          </h3>

        </div>

      )}

      {/* Table */}

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

              {filteredEvents.map(event => (

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

                  <td className="p-4 font-medium">

                    {event.eventName}

                  </td>

                  <td className="p-4">

                    {new Date(event.eventDate).toLocaleDateString()}

                  </td>

                  <td className="p-4">

                    {event.venue}

                  </td>

                  <td className="p-4">

                    {event.maxSeats}

                  </td>

                  <td className="p-4">

                    ₹{event.entryFee}

                  </td>

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