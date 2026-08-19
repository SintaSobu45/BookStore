import React, { useEffect, useState } from "react";
import { MapPin, ChevronRight, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getEvents } from "../services/eventService";

export default function EventsAndNewsletter() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Upcoming Events Section */}
      <section className="py-4">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8 pb-3 border-b border-stone-200/70">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 block mb-1">
              Gatherings & Workshops
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Upcoming Events
            </h2>
          </div>

          <Link
            to="/events"
            className="flex items-center gap-1 text-sm font-semibold text-stone-600 hover:text-emerald-700 transition-colors group"
          >
            <span>View All</span>
            <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Events Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => {
            const eventDateObj = new Date(event.eventDate);
            const day = eventDateObj.getDate();
            const month = eventDateObj
              .toLocaleString("default", { month: "short" })
              .toUpperCase();
            const formattedDate = eventDateObj.toLocaleDateString();
            const formattedTime = eventDateObj.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={event.eventId}
                onClick={() => navigate(`/events/${event.eventId}`)}
                className="
    group
    bg-white
    border
    border-stone-200
    rounded-3xl
    overflow-hidden
    cursor-pointer
    shadow-sm
    hover:shadow-xl
    hover:-translate-y-1
    transition-all
    duration-300
  "
              >
                {/* =========================
      EVENT BANNER
  ========================= */}

                <div className="w-full bg-stone-100 overflow-hidden">
                  {event?.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={event.eventName}
                      className="
          w-full
          h-auto
          block
          object-contain
          group-hover:scale-[1.02]
          transition-transform
          duration-500
        "
                    />
                  ) : (
                    <div className="h-32 flex items-center justify-center text-stone-300">
                      <span className="text-3xl">📅</span>
                    </div>
                  )}
                </div>

                {/* =========================
      EVENT INFORMATION
  ========================= */}

                <div className="p-5">
                  {/* Date + Venue */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-stone-500 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-emerald-800">
                        {formattedDate}
                      </span>

                      <span className="text-stone-300">•</span>

                      <span>{formattedTime}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-emerald-700" />

                      <span>{event.venue}</span>
                    </div>
                  </div>

                  {/* Event Title */}
                  <h3
                    className="
        text-base
        sm:text-lg
        font-bold
        text-stone-900
        line-clamp-2
        group-hover:text-emerald-800
        transition-colors
      "
                  >
                    {event.eventName}
                  </h3>

                  {/* Bottom */}
                  <div className="flex items-center justify-between mt-5">
                    <span className="text-[11px] text-stone-400 font-medium">
                      Upcoming Event
                    </span>

                    <button
                      type="button"
                      className="
          inline-flex
          items-center
          gap-1
          bg-emerald-900
          hover:bg-emerald-800
          text-white
          text-xs
          font-semibold
          px-4
          py-2.5
          rounded-xl
          transition-colors
        "
                    >
                      Book Now
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stay Updated / Newsletter Banner */}
      <section className="bg-[#F2F5F1] border border-emerald-900/10 rounded-3xl p-6 sm:p-8 md:p-10 flex flex-col lg:flex-row items-center justify-between shadow-sm">
        {/* Left Info */}
        <div className="flex items-center space-x-4 mb-6 lg:mb-0 w-full lg:w-auto">
          <div className="bg-emerald-900 text-white p-4 rounded-2xl shadow-sm shrink-0">
            <Mail className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Stay Updated
            </h3>
            <p className="text-gray-600 text-sm max-w-md">
              Subscribe to get updates on new books, events and exciting
              announcements.
            </p>
          </div>
        </div>

        {/* Right Input and Button */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">
          <input
            type="email"
            placeholder="Enter your email"
            className="bg-white border border-gray-300 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 outline-none px-4 py-3 rounded-xl text-sm w-full sm:w-80 shadow-sm"
          />
          <button className="bg-emerald-900 hover:bg-emerald-800 text-white font-medium text-sm px-6 py-3 rounded-xl transition-colors shadow-sm w-full sm:w-auto cursor-pointer">
            Subscribe
          </button>
        </div>
      </section>
    </div>
  );
}


