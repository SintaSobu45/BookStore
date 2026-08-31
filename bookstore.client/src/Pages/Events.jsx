import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  MapPin,
  Users,
  IndianRupee,
  Home,
  ChevronRight,
  Clock,
  ArrowRight,
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

  // ============================================
  // FORMAT TIME
  // ============================================

  const formatTime = (time) => {
    if (!time) return "N/A";

    const [hours, minutes] = time.split(":");

    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ============================================
  // FORMAT DATE
  // ============================================

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-stone-50">
        {/* ============================================
            HERO SECTION
        ============================================ */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-8">
          <section className="relative overflow-hidden rounded-3xl bg-[#1b3b2b] px-6 py-8 sm:px-10 sm:py-12 md:px-12">
            
            {/* Background decoration */}
            <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="absolute -left-16 -bottom-20 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              
              {/* Hero Content */}
              <div className="max-w-2xl">
                
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs sm:text-sm mb-5">
                  <Link
                    to="/"
                    className="flex items-center gap-1 text-emerald-200 hover:text-white transition-colors"
                  >
                    <Home className="w-4 h-4" />
                    Home
                  </Link>

                  <ChevronRight className="w-4 h-4 text-emerald-400/60" />

                  <span className="text-white font-medium">
                    Events
                  </span>
                </div>

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300 mb-3">
                  Discover & Participate
                </p>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                  Upcoming Events
                </h1>

                <p className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-emerald-100/80">
                  Discover book festivals, author meetups, poetry sessions,
                  workshops and other literary events happening around you.
                </p>
              </div>

              {/* Event Count */}
              <div className="shrink-0">
                <div className="bg-white/10 border border-white/10 backdrop-blur-sm rounded-2xl px-6 py-5 text-center">
                  <p className="text-3xl sm:text-4xl font-extrabold text-white">
                    {events.length}
                  </p>

                  <p className="text-xs uppercase tracking-wider font-semibold text-emerald-200 mt-1">
                    Events Available
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ============================================
            EVENTS SECTION
        ============================================ */}

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          
          {/* Loading */}
          {loading && (
            <div className="py-24 text-center">
              <div className="inline-flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-700 rounded-full animate-spin" />

                <p className="mt-4 text-sm font-medium text-stone-500">
                  Loading events...
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="py-24 text-center">
              <p className="text-red-600 font-medium">
                {error}
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && events.length === 0 && (
            <div className="py-24 text-center">
              <div className="text-6xl mb-5">
                📅
              </div>

              <h2 className="text-xl font-bold text-stone-800">
                No upcoming events
              </h2>

              <p className="text-sm text-stone-500 mt-2">
                Please check back later for upcoming events.
              </p>
            </div>
          )}

          {/* ============================================
              EVENT CARDS
          ============================================ */}

          {!loading && !error && events.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7 lg:gap-8">
              
              {events.map((event) => {
                const eventDate = new Date(event.eventDate);

                const isExpanded =
                  expandedEvent === event.eventId;

                return (
                  <article
                    key={event.eventId}
                    onClick={() =>
                      navigate(`/events/${event.eventId}`)
                    }
                    className="
                      group
                      bg-white
                      rounded-3xl
                      overflow-hidden
                      border
                      border-stone-200
                      shadow-sm
                      hover:shadow-xl
                      hover:-translate-y-1
                      transition-all
                      duration-300
                      cursor-pointer
                      flex
                      flex-col
                    "
                  >
                    {/* ========================================
                        EVENT IMAGE
                    ======================================== */}

                    <div className="relative h-64 sm:h-72 overflow-hidden bg-stone-100">
                      
                      {event.imageUrl ? (
                        <img
                          src={event.imageUrl}
                          alt={event.eventName}
                          className="
                            w-full
                            h-full
                            object-contain
                            transition-transform
                            duration-700
                            group-hover:scale-105
                          "
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                          🎉
                        </div>
                      )}

                      {/* Image Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

                      {/* Date Badge */}
                      <div className="
                        absolute
                        top-5
                        left-5
                        bg-white
                        rounded-2xl
                        min-w-[70px]
                        px-3
                        py-3
                        text-center
                        shadow-lg
                      ">
                        <p className="text-2xl font-extrabold text-emerald-900 leading-none">
                          {eventDate.getDate()}
                        </p>

                        <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                          {eventDate
                            .toLocaleString("en-IN", {
                              month: "short",
                            })
                            .toUpperCase()}
                        </p>
                      </div>

                      {/* Upcoming Label */}
                      <div className="
                        absolute
                        top-5
                        right-5
                        bg-emerald-900/90
                        backdrop-blur-md
                        text-white
                        px-3
                        py-1.5
                        rounded-full
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wider
                      ">
                        Upcoming
                      </div>

                      {/* Title on Image */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                          {event.eventName}
                        </h2>
                      </div>
                    </div>

                    {/* ========================================
                        EVENT CONTENT
                    ======================================== */}

                    <div className="p-5 sm:p-6 flex flex-col flex-1">
                      
                      {/* Description */}
                      <div className="mb-5">
                        <p
                          className={`
                            text-sm
                            text-stone-600
                            leading-6
                            ${!isExpanded ? "line-clamp-3" : ""}
                          `}
                        >
                          {event.description}
                        </p>

                        {event.description &&
                          event.description.length > 150 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();

                                setExpandedEvent(
                                  isExpanded
                                    ? null
                                    : event.eventId
                                );
                              }}
                              className="
                                mt-2
                                text-sm
                                font-semibold
                                text-emerald-800
                                hover:text-emerald-600
                                transition-colors
                              "
                            >
                              {isExpanded
                                ? "Show less"
                                : "Read more"}
                            </button>
                          )}
                      </div>

                      {/* ========================================
                          EVENT INFO GRID
                      ======================================== */}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        
                        {/* Date */}
                        <div className="
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          border
                          border-stone-100
                          bg-stone-50
                          p-3
                        ">
                          <div className="
                            w-10
                            h-10
                            shrink-0
                            rounded-xl
                            bg-emerald-50
                            flex
                            items-center
                            justify-center
                          ">
                            <CalendarDays className="w-4 h-4 text-emerald-700" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                              Date
                            </p>

                            <p className="text-sm font-semibold text-stone-700 truncate">
                              {formatDate(event.eventDate)}
                            </p>
                          </div>
                        </div>

                        {/* Time */}
                        <div className="
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          border
                          border-stone-100
                          bg-stone-50
                          p-3
                        ">
                          <div className="
                            w-10
                            h-10
                            shrink-0
                            rounded-xl
                            bg-emerald-50
                            flex
                            items-center
                            justify-center
                          ">
                            <Clock className="w-4 h-4 text-emerald-700" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                              Time
                            </p>

                            <p className="text-sm font-semibold text-stone-700">
                              {formatTime(event.eventTime)}
                            </p>
                          </div>
                        </div>

                        {/* Venue */}
                        <div className="
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          border
                          border-stone-100
                          bg-stone-50
                          p-3
                        ">
                          <div className="
                            w-10
                            h-10
                            shrink-0
                            rounded-xl
                            bg-emerald-50
                            flex
                            items-center
                            justify-center
                          ">
                            <MapPin className="w-4 h-4 text-emerald-700" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                              Venue
                            </p>

                            <p className="text-sm font-semibold text-stone-700 truncate">
                              {event.venue}
                            </p>
                          </div>
                        </div>

                        {/* Entry Fee */}
                        <div className="
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          border
                          border-stone-100
                          bg-stone-50
                          p-3
                        ">
                          <div className="
                            w-10
                            h-10
                            shrink-0
                            rounded-xl
                            bg-emerald-50
                            flex
                            items-center
                            justify-center
                          ">
                            <IndianRupee className="w-4 h-4 text-emerald-700" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                              Entry Fee
                            </p>

                            <p className="text-sm font-semibold text-stone-700">
                              {Number(event.entryFee) === 0
                                ? "Free"
                                : `₹${event.entryFee}`}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* ========================================
                          BUTTON
                      ======================================== */}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/events/${event.eventId}`);
                        }}
                        className="
                          mt-6
                          w-full
                          flex
                          items-center
                          justify-center
                          gap-2
                          bg-[#1b3b2b]
                          hover:bg-emerald-900
                          text-white
                          py-3.5
                          rounded-xl
                          text-sm
                          font-semibold
                          transition-all
                          duration-200
                          hover:shadow-lg
                          active:scale-[0.98]
                        "
                      >
                        View Event Details

                        <ArrowRight className="
                          w-4
                          h-4
                          transition-transform
                          group-hover:translate-x-1
                        " />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}