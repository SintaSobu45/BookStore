import React, { useEffect, useState } from "react";
import { CalendarDays, MapPin, Users, IndianRupee } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

import { getEvents } from "../services/eventService";

export default function Events() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await getEvents();

        setEvents(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-stone-50">
        {/* Hero */}
        <div className="bg-[#1b3b2b] text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl font-extrabold mb-3">Upcoming Events</h1>

            <p className="text-emerald-100 max-w-2xl">
              Participate in book festivals, author meetups, poetry competitions
              and literary events happening across Kerala.
            </p>
          </div>
        </div>

        <div className="max-w-7x1 mx-auto px-4 py-12">
          {loading && (
            <div className="text-center py-20">Loading events...</div>
          )}

          {error && (
            <div className="text-center text-red-600 py-20">{error}</div>
          )}

          {!loading && events.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              No upcoming events available.
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {events.map((event) => (
              <div
                key={event.eventId}
                onClick={() => navigate(`/events/${event.eventId}`)}
                className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* Event Image */}
                <div className="h-80 bg-stone-100 flex items-center justify-center overflow-hidden shrink-0">
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={event.eventName}
                      className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      🎉
                    </div>
                  )}
                </div>

                {/* Event Details */}
                <div className="p-6 flex flex-col flex-1">
                  {/* Event Title */}
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    {event.eventName}
                  </h2>

                  {/* Full Description */}
                  <p className="text-sm text-gray-600 leading-6 mb-6">
                    {event.description}
                  </p>

                  {/* Event Information */}
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2 text-emerald-700 shrink-0" />

                      <span>
                        {new Date(event.eventDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-emerald-700 shrink-0" />

                      <span>{event.venue}</span>
                    </div>

                    <div className="flex items-center">
                      <IndianRupee className="h-4 w-4 mr-2 text-emerald-700 shrink-0" />

                      <span>₹{event.entryFee}</span>
                    </div>

                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-emerald-700 shrink-0" />

                      <span>{event.availableSeats} seats left</span>
                    </div>
                  </div>

                  {/* Button pushed to bottom */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/events/${event.eventId}`);
                    }}
                    className="mt-auto pt-6"
                  >
                    <span className="block w-full bg-[#1b3b2b] hover:bg-emerald-900 text-white py-3 rounded-xl font-semibold transition-colors">
                      View Details
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
