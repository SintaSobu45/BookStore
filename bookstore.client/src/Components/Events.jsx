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
        {/* Events Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {loading ? (
            <p className="text-sm text-stone-500">Loading events...</p>
          ) : events.length === 0 ? (
            <p className="text-sm text-stone-500">
              No upcoming events available.
            </p>
          ) : (
            events.slice(0, 4).map((event) => {
              const eventDateObj = new Date(event.eventDate);

              const day = eventDateObj.getDate();

              const month = eventDateObj
                .toLocaleString("en-IN", {
                  month: "short",
                })
                .toUpperCase();

              const formattedDate = eventDateObj.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              const formatTime = (time) => {
                if (!time) return "";

                const [hours, minutes] = time.split(":");

                const date = new Date();
                date.setHours(Number(hours), Number(minutes), 0);

                return date.toLocaleTimeString("en-IN", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                });
              };

              const formattedTime = formatTime(event.eventTime);

              return (
                <div
                  key={event.eventId}
                  onClick={() => navigate(`/events/${event.eventId}`)}
                  className="
            group
            relative
            min-h-[190px]
            bg-white
            border
            border-stone-200
            rounded-2xl
            overflow-hidden
            cursor-pointer
            shadow-sm
            hover:shadow-lg
            hover:-translate-y-1
            transition-all
            duration-300
            flex
          "
                >
                  {/* LEFT CONTENT */}
                  <div className="flex-1 p-5 pr-3 flex flex-col relative z-10">
                    {/* DATE + TITLE */}
                    <div className="flex items-start gap-3">
                      {/* DATE BOX */}
                      <div
                        className="
                shrink-0
                w-11
                rounded-lg
                bg-emerald-900
                text-white
                text-center
                py-2
                shadow-sm
              "
                      >
                        <p className="text-sm font-extrabold leading-none">
                          {day}
                        </p>

                        <p className="text-[9px] font-bold uppercase tracking-wide mt-1">
                          {month}
                        </p>
                      </div>

                      {/* TITLE */}
                      <div>
                        <h3
                          className="
                  text-base
                  font-bold
                  text-stone-900
                  leading-snug
                  line-clamp-2
                  group-hover:text-emerald-800
                  transition-colors
                "
                        >
                          {event.eventName}
                        </h3>
                      </div>
                    </div>

                    {/* DATE & TIME */}
                    <div className="mt-4">
                      <p className="text-xs font-medium text-stone-500">
                        {formattedDate}
                        <span className="mx-1">|</span>
                        {formattedTime || "Time not available"}
                      </p>
                    </div>

                    {/* VENUE */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <MapPin className="h-3.5 w-3.5 text-emerald-700 shrink-0" />

                      <p className="text-xs text-stone-500 line-clamp-1">
                        {event.venue}
                      </p>
                    </div>

                    {/* BOTTOM */}
                    <div className="mt-auto pt-4 flex items-center gap-3">
                      {/* BUTTON */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/events/${event.eventId}`);
                        }}
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
                  py-2
                  rounded-lg
                  transition-colors
                "
                      >
                        View Event
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>

                      
                    </div>
                  </div>

                  {/* RIGHT EVENT IMAGE */}
                  <div
                    className="
            w-[38%]
            sm:w-[40%]
            min-h-full
            bg-stone-100
            relative
            overflow-hidden
          "
                  >
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.eventName}
                        className="
                  absolute
                  inset-0
                  w-full
                  h-full
                  object-cover
                  transition-transform
                  duration-500
                  group-hover:scale-105
                "
                      />
                    ) : (
                      <div
                        className="
                absolute
                inset-0
                flex
                items-center
                justify-center
                text-4xl
              "
                      >
                        📅
                      </div>
                    )}

                    {/* Slight gradient for better blending */}
                    <div
                      className="
              absolute
              inset-0
              bg-gradient-to-r
              from-white/20
              to-transparent
              pointer-events-none
            "
                    />
                  </div>
                </div>
              );
            })
          )}
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
