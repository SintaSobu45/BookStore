import React, { useEffect, useState } from "react";
import { createEvent, updateEvent } from "../../services/eventService";

function EventModal({ show, onClose, eventData, refresh }) {
  const [form, setForm] = useState({
    eventName: "",
    description: "",
    eventDate: "",
    eventTime: "",
    venue: "",
    entryFee: "",
    maxSeats: "",
    isActive: true,
    image: null,
    bannerImage: null,
  });

  const [imagePreview, setImagePreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");

  // =====================================================
  // LOAD EVENT DATA FOR EDITING
  // =====================================================

  useEffect(() => {
    console.log("EVENT DATA RECEIVED FOR EDIT:", eventData);
    if (eventData) {
      setForm({
        eventName: eventData.eventName || "",
        description: eventData.description || "",

        eventDate: eventData.eventDate?.split("T")[0] || "",

        // Convert backend TimeSpan to HH:mm for input[type="time"]
        eventTime: eventData.eventTime
          ? eventData.eventTime.substring(0, 5)
          : "",

        venue: eventData.venue || "",
        entryFee: eventData.entryFee ?? "",
        maxSeats: eventData.maxSeats || "",
        isActive: eventData.isActive ?? true,
        image: null,
        bannerImage: null,
      });

      setImagePreview(eventData.imageUrl || "");
      setBannerPreview(eventData.bannerImageUrl || "");
    } else {
      setForm({
        eventName: "",
        description: "",
        eventDate: "",
        eventTime: "",
        venue: "",
        entryFee: "",
        maxSeats: "",
        isActive: true,
        image: null,
        bannerImage: null,
      });

      setImagePreview("");
      setBannerPreview("");
    }
  }, [eventData]);

  // =====================================================
  // HANDLE INPUT CHANGES
  // =====================================================

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const file = files[0];

      if (!file) return;

      setForm({
        ...form,
        [name]: file,
      });

      if (name === "image") {
        setImagePreview(URL.createObjectURL(file));
      }

      if (name === "bannerImage") {
        setBannerPreview(URL.createObjectURL(file));
      }

      return;
    }

    setForm({
      ...form,
      [name]: value,
    });
  };

  // =====================================================
  // HANDLE ACTIVE STATUS
  // =====================================================

  const handleActiveChange = (e) => {
    setForm({
      ...form,
      isActive: e.target.checked,
    });
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("EventName", form.eventName);
    formData.append("Description", form.description);
    formData.append("EventDate", form.eventDate);

    // Convert HH:mm → HH:mm:ss for ASP.NET TimeSpan
    if (form.eventTime) {
      formData.append("EventTime", `${form.eventTime}:00`);
    }

    formData.append("Venue", form.venue);
    formData.append("EntryFee", form.entryFee);
    formData.append("MaxSeats", form.maxSeats);

    // Always send IsActive
    formData.append("IsActive", form.isActive.toString());

    if (form.image) {
      formData.append("Image", form.image);
    }
    if (form.bannerImage) {
      formData.append("BannerImage", form.bannerImage);
    }

    try {
      if (eventData) {
        await updateEvent(eventData.eventId, formData);
      } else {
        await createEvent(formData);
      }

      refresh();
      onClose();
    } catch (err) {
      alert("Something went wrong.");

      console.log(err);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8">
        {/* HEADER */}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {eventData ? "Edit Event" : "Add Event"}
          </h2>

          <button type="button" onClick={onClose} className="text-2xl">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-5">
          {/* EVENT NAME */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Event Name
            </label>

            <input
              type="text"
              name="eventName"
              value={form.eventName}
              onChange={handleChange}
              placeholder="Enter event name"
              className="w-full border rounded-lg p-3"
              required
            />
          </div>

          {/* EVENT DATE */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Event Date
            </label>

            <input
              type="date"
              name="eventDate"
              value={form.eventDate}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              required
            />
          </div>

          {/* EVENT TIME */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Event Time
            </label>

            <input
              type="time"
              name="eventTime"
              value={form.eventTime}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              required
            />
          </div>

          {/* VENUE */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Venue
            </label>

            <input
              type="text"
              name="venue"
              value={form.venue}
              onChange={handleChange}
              placeholder="Enter event venue"
              className="w-full border rounded-lg p-3"
              required
            />
          </div>

          {/* MAX SEATS */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Maximum Seats
            </label>

            <input
              type="number"
              name="maxSeats"
              value={form.maxSeats}
              onChange={handleChange}
              placeholder="Enter maximum seats"
              min="1"
              className="w-full border rounded-lg p-3"
              required
            />
          </div>

          {/* ENTRY FEE */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Entry Fee
            </label>

            <input
              type="number"
              name="entryFee"
              value={form.entryFee}
              onChange={handleChange}
              placeholder="Enter entry fee"
              min="0"
              className="w-full border rounded-lg p-3"
            />
          </div>

          {/* EVENT STATUS */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Event Status
            </label>

            <div className="flex items-center justify-between border rounded-lg px-4 py-3 min-h-[50px]">
              <div>
                <p className="font-medium text-gray-800">
                  {form.isActive ? "Active" : "Inactive"}
                </p>

                <p className="text-sm text-gray-500">
                  {form.isActive
                    ? "Event is currently active"
                    : "Event is currently inactive"}
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={handleActiveChange}
                  className="sr-only peer"
                />

                <div
                  className="
            w-12 h-6
            bg-gray-300
            rounded-full
            peer
            peer-checked:bg-green-600
            after:content-['']
            after:absolute
            after:top-[2px]
            after:left-[2px]
            after:bg-white
            after:border
            after:rounded-full
            after:h-5
            after:w-5
            after:transition-all
            peer-checked:after:translate-x-6
          "
                />
              </label>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter event description"
              rows="5"
              className="w-full border rounded-lg p-3"
              required
            />
          </div>

          {/* EVENT IMAGE */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Event Image
            </label>

            <p className="text-xs text-gray-500 mb-2">
              Upload the image shown on the event card and event details.
            </p>

            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full border rounded-lg p-3 text-sm"
            />

            {imagePreview && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">
                  Event Image Preview
                </p>

                <div className="w-full h-40 rounded-xl overflow-hidden border bg-gray-50">
                  <img
                    src={imagePreview}
                    alt="Event preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          {/* BANNER IMAGE */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Banner Image
            </label>

            <p className="text-xs text-gray-500 mb-2">
              Upload a wide image for the website event banner.
            </p>

            <input
              type="file"
              name="bannerImage"
              accept="image/*"
              onChange={handleChange}
              className="w-full border rounded-lg p-3 text-sm"
            />

            {bannerPreview && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">Banner Preview</p>

                <div className="w-full aspect-[16/6] rounded-xl overflow-hidden border bg-gray-50">
                  <img
                    src={bannerPreview}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div className="md:col-span-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 border rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              {eventData ? "Update Event" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventModal;
