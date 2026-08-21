import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  MapPin,
  Users,
  IndianRupee,
  Home,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

import { getEvents } from "../services/eventService";

export default function Events() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [expandedEvent, setExpandedEvent] = useState(null);

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

      <div className="container min-h-screen bg-stone-50">
        {/* Hero */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
          <div className="bg-[#1b3b2b] border border-emerald-800/40 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-12 flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-sm">
            {/* Decorative ambient background glow */}
            <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Hero Text & Breadcrumbs */}
            <div className="max-w-xl z-10 mb-6 md:mb-0">
              {/* Breadcrumb */}
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-emerald-200/80 font-medium mb-3 sm:mb-4">
                <Link
                  to="/"
                  className="hover:text-white flex items-center transition-colors"
                >
                  <Home className="h-4 w-4 mr-1" />
                  Home
                </Link>
                <ChevronRight className="h-3.5 w-3.5 text-emerald-400/60" />
                <span className="text-white font-semibold">Events</span>
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2 sm:mb-3">
                Upcoming Events
              </h1>

              <p className="text-emerald-100/90 text-xs sm:text-base leading-relaxed max-w-md font-medium">
                Participate in book festivals, author meetups, poetry
                competitions and literary events happening across Kerala.
              </p>
            </div>

            {/* Hero Image */}
            <div className="relative z-10 w-full md:w-[40%] flex justify-center">
              <div className="relative group w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-2xl blur opacity-20 group-hover:opacity-35 transition duration-300"></div>
                <img
                  src="https://www.oyorooms.com/blog/wp-content/uploads/2018/02/type-of-event.jpg"
                  alt="Literary events and festivals"
                  className="relative rounded-xl sm:rounded-2xl object-cover w-full h-[130px] sm:h-[180px] md:h-[220px] shadow-md border border-white/10"
                />
              </div>
            </div>
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

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {events.map((event) => (
              <div
                key={event.eventId}
                onClick={() => navigate(`/events/${event.eventId}`)}
                className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col min-h-[520px]"
              >
                {/* Event Image */}
                <div className="w-full bg-stone-100 overflow-hidden">
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={event.eventName}
                      className="w-full h-auto object-contain transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      🎉
                    </div>
                  )}
                </div>

                {/* Event Details */}
                <div className="p-5 sm:p-6 flex flex-col flex-1">
                  {/* Event Title */}
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                    {event.eventName}
                  </h2>

                  {/* Description */}
                  <div className="mb-6">
                    <p
                      className={`text-sm text-gray-600 leading-6 ${
                        expandedEvent !== event.eventId ? "line-clamp-3" : ""
                      }`}
                    >
                      {event.description}
                    </p>

                    {event.description && event.description.length > 150 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedEvent(
                            expandedEvent === event.eventId
                              ? null
                              : event.eventId,
                          );
                        }}
                        className="mt-2 text-sm font-semibold text-[#1b3b2b] hover:text-emerald-800 transition-colors"
                      >
                        {expandedEvent === event.eventId
                          ? "Show less"
                          : "Show more"}
                      </button>
                    )}
                  </div>

                  {/* Event Information - 2 Columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {/* Date */}
                    <div className="flex items-center gap-3 bg-stone-50 border border-stone-100 rounded-xl p-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                        <CalendarDays className="h-4 w-4 text-emerald-700" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                          Date
                        </p>

                        <p className="text-sm text-gray-700 font-semibold truncate">
                          {new Date(event.eventDate).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-3 bg-stone-50 border border-stone-100 rounded-xl p-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                        <Clock className="h-4 w-4 text-emerald-700" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                          Time
                        </p>

                        <p className="text-sm text-gray-700 font-semibold">
                          {event.eventTime
                            ? new Date(
                                `1970-01-01T${event.eventTime}`,
                              ).toLocaleTimeString("en-IN", {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Venue */}
                    <div className="flex items-center gap-3 bg-stone-50 border border-stone-100 rounded-xl p-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                        <MapPin className="h-4 w-4 text-emerald-700" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                          Venue
                        </p>

                        <p className="text-sm text-gray-700 font-semibold truncate">
                          {event.venue}
                        </p>
                      </div>
                    </div>

                    {/* Entry Fee */}
                    <div className="flex items-center gap-3 bg-stone-50 border border-stone-100 rounded-xl p-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                        <IndianRupee className="h-4 w-4 text-emerald-700" />
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                          Entry Fee
                        </p>

                        <p className="text-sm text-gray-700 font-semibold">
                          ₹{event.entryFee}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/events/${event.eventId}`);
                    }}
                    className="mt-auto"
                  >
                    <span className="block w-full bg-[#1b3b2b] hover:bg-emerald-900 text-white py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-md">
                      View Details →
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
