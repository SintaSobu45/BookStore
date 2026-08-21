import React, { useEffect, useState } from "react";
import {
  createEvent,
  updateEvent,
} from "../../services/eventService";

function EventModal({
  show,
  onClose,
  eventData,
  refresh,
}) {
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
  });

  const [preview, setPreview] = useState("");

  // =====================================================
  // LOAD EVENT DATA FOR EDITING
  // =====================================================

  useEffect(() => {
    if (eventData) {
      setForm({
        eventName: eventData.eventName || "",
        description: eventData.description || "",

        eventDate:
          eventData.eventDate?.split("T")[0] || "",

        // Convert backend TimeSpan to HH:mm for input[type="time"]
        eventTime:
          eventData.eventTime
            ? eventData.eventTime.substring(0, 5)
            : "",

        venue: eventData.venue || "",
        entryFee: eventData.entryFee ?? "",
        maxSeats: eventData.maxSeats || "",
        isActive: eventData.isActive ?? true,
        image: null,
      });

      setPreview(eventData.imageUrl || "");
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
      });

      setPreview("");
    }
  }, [eventData]);

  // =====================================================
  // HANDLE INPUT CHANGES
  // =====================================================

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      setForm({
        ...form,
        image: files[0],
      });

      setPreview(
        URL.createObjectURL(files[0])
      );
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
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
      formData.append(
        "EventTime",
        `${form.eventTime}:00`
      );
    }

    formData.append("Venue", form.venue);
    formData.append("EntryFee", form.entryFee);
    formData.append("MaxSeats", form.maxSeats);

    // Always send IsActive
    formData.append(
      "IsActive",
      form.isActive.toString()
    );

    if (form.image) {
      formData.append("Image", form.image);
    }

    try {
      if (eventData) {
        await updateEvent(
          eventData.eventId,
          formData
        );
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
            {eventData
              ? "Edit Event"
              : "Add Event"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-2xl"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid md:grid-cols-2 gap-5"
        >
          {/* EVENT NAME */}

          <input
            type="text"
            name="eventName"
            value={form.eventName}
            onChange={handleChange}
            placeholder="Event Name"
            className="border rounded-lg p-3"
            required
          />

          {/* EVENT DATE */}

          <input
            type="date"
            name="eventDate"
            value={form.eventDate}
            onChange={handleChange}
            className="border rounded-lg p-3"
            required
          />

          {/* EVENT TIME */}

          <input
            type="time"
            name="eventTime"
            value={form.eventTime}
            onChange={handleChange}
            className="border rounded-lg p-3"
            required
          />

          {/* VENUE */}

          <input
            type="text"
            name="venue"
            value={form.venue}
            onChange={handleChange}
            placeholder="Venue"
            className="border rounded-lg p-3"
            required
          />

          {/* MAX SEATS */}

          <input
            type="number"
            name="maxSeats"
            value={form.maxSeats}
            onChange={handleChange}
            placeholder="Maximum Seats"
            className="border rounded-lg p-3"
            required
          />

          {/* ENTRY FEE */}

          <input
            type="number"
            name="entryFee"
            value={form.entryFee}
            onChange={handleChange}
            placeholder="Entry Fee"
            className="border rounded-lg p-3"
          />

          {/* EVENT STATUS */}

          <div className="flex items-center justify-between border rounded-lg px-4 py-3">
            <div>
              <p className="font-medium text-gray-800">
                Event Status
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

          {/* DESCRIPTION */}

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            rows="5"
            className="border rounded-lg p-3 md:col-span-2"
            required
          />

          {/* IMAGE */}

          <div className="md:col-span-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleChange}
            />
          </div>

          {/* IMAGE PREVIEW */}

          {preview && (
            <div className="md:col-span-2">
              <img
                src={preview}
                alt="Event preview"
                className="w-40 h-40 object-cover rounded-xl"
              />
            </div>
          )}

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
              {eventData
                ? "Update Event"
                : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventModal;