import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEvents } from "../services/eventService";

export default function HeroSection() {
  const [events, setEvents] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // =========================
  // LOAD EVENTS
  // =========================

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await getEvents();

        const bannerEvents = data.filter(
          (event) => event.bannerImageUrl
        );

        setEvents(bannerEvents);
      } catch (error) {
        console.error("Failed to load events:", error);
      }
    };

    loadEvents();
  }, []);

  // =========================
  // AUTO SLIDE
  // =========================

  useEffect(() => {
    if (events.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === events.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [events.length]);

  // =========================
  // RESET SLIDE IF NEEDED
  // =========================

  useEffect(() => {
    if (
      events.length > 0 &&
      currentSlide > events.length - 1
    ) {
      setCurrentSlide(0);
    }
  }, [events.length, currentSlide]);

  if (events.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">

      {/* BANNER SLIDER */}
      <div className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl shadow-md">

        {/* 
          IMPORTANT:
          No fixed height.
          No forced aspect ratio.
          The actual banner image controls its own height.
        */}
        <div className="relative w-full">

          {events.map((item, index) => (
            <Link
              key={item.eventId}
              to={`/events/${item.eventId}`}
              className={`
                absolute inset-0
                w-full
                transition-opacity duration-700 ease-in-out
                ${
                  index === currentSlide
                    ? "opacity-100 z-10 relative"
                    : "opacity-0 z-0 pointer-events-none"
                }
              `}
            >
              <img
                src={item.bannerImageUrl}
                alt={item.eventName || "Event Banner"}
                className="w-full h-auto block"
              />
            </Link>
          ))}

          {/* SLIDE INDICATORS */}
          {events.length > 1 && (
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">

              {events.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to event ${index + 1}`}
                  className={`
                    rounded-full transition-all duration-300
                    ${
                      index === currentSlide
                        ? "w-5 h-2 bg-emerald-600"
                        : "w-2 h-2 bg-white/70 hover:bg-white"
                    }
                  `}
                />
              ))}

            </div>
          )}

        </div>
      </div>
    </section>
  );
}