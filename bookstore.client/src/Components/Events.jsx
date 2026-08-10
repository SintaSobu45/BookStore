import React, { useEffect, useState } from 'react';
import { MapPin, ChevronRight, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getEvents } from '../services/eventService';



export default function EventsAndNewsletter() {

  const navigate = useNavigate()

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
      <section>
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
          <Link to={'/events'} className="flex items-center text-emerald-700 hover:text-emerald-800 font-medium text-sm group">
            <span>View All</span>
            <ChevronRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Events Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <div
              key={event.eventId}
              className="bg-[#FAF8F5] border border-stone-200/80 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-center relative overflow-hidden shadow-sm" onClick={()=>navigate(`/events/${event.eventId}`)}>
              <div className="flex-1 pr-0 sm:pr-4 mb-6 sm:mb-0 w-full">

                {/* Date Badge & Title */}
                <div className="flex items-start space-x-4 mb-4">
                  <div className="bg-emerald-900 text-white rounded-xl p-2.5 text-center min-w-[52px] shadow-sm">
                    <span className="block text-lg font-bold leading-none">
                      {new Date(event.eventDate).getDate()}
                    </span>
                    <span className="block text-[10px] tracking-wider uppercase mt-1 font-semibold">
                      {new Date(event.eventDate)
                        .toLocaleString("default", { month: "short" })
                        .toUpperCase()}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-snug">
                    {event.eventName}
                  </h3>
                </div>

                {/* Event Details */}
                <div className="space-y-1.5 text-sm text-gray-600 mb-6 pl-1">
                  <p className="font-medium text-gray-700">
                    {new Date(event.eventDate).toLocaleDateString()} |{" "}
                    {new Date(event.eventDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  <div className="flex items-center text-gray-500">
                    <MapPin className="h-4 w-4 text-emerald-700 mr-1.5 shrink-0" />
                    <span>{event.venue}</span>
                  </div>
                </div>

                {/* Book Now */}
                <button
                  to={`/events/${event.eventId}`}
                  className="inline-block bg-emerald-900 hover:bg-emerald-800 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors shadow-sm"
                >
                  Book Now
                </button>
              </div>

              {/* Event Image */}
              <div className="w-full sm:w-40 h-44 rounded-2xl overflow-hidden shrink-0 bg-stone-200/50 flex items-center justify-center border border-stone-100">
                <img
                  src={
                    event?.imageUrl
                  }
                  alt={event?.eventName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
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
            <h3 className="text-xl font-bold text-gray-900 mb-1">Stay Updated</h3>
            <p className="text-gray-600 text-sm max-w-md">
              Subscribe to get updates on new books, events and exciting announcements.
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