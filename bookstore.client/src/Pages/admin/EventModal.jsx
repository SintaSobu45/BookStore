import React, { useEffect, useState } from "react";
import { createEvent, updateEvent } from "../../services/eventService";

function EventModal({ show, onClose, eventData, refresh }) {

  const [form, setForm] = useState({
    eventName: "",
    description: "",
    eventDate: "",
    venue: "",
    entryFee: "",
    bookPrice: "",
    maxSeats: "",
    image: null
  });

  const [preview, setPreview] = useState("");

  useEffect(() => {

    if (eventData) {

      setForm({
        eventName: eventData.eventName,
        description: eventData.description,
        eventDate: eventData.eventDate?.split("T")[0],
        venue: eventData.venue,
        entryFee: eventData.entryFee,
        bookPrice: eventData.bookPrice,
        maxSeats: eventData.maxSeats,
        image: null
      });

      setPreview(eventData.imageUrl);

    } else {

      setForm({
        eventName: "",
        description: "",
        eventDate: "",
        venue: "",
        entryFee: "",
        bookPrice: "",
        maxSeats: "",
        image: null
      });

      setPreview("");

    }

  }, [eventData]);

  const handleChange = (e) => {

    const { name, value, files } = e.target;

    if (files) {

      setForm({
        ...form,
        image: files[0]
      });

      setPreview(URL.createObjectURL(files[0]));

    } else {

      setForm({
        ...form,
        [name]: value
      });

    }

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    const formData = new FormData();

    formData.append("EventName", form.eventName);
    formData.append("Description", form.description);
    formData.append("EventDate", form.eventDate);
    formData.append("Venue", form.venue);
    formData.append("EntryFee", form.entryFee);
    formData.append("BookPrice", form.bookPrice);
    formData.append("MaxSeats", form.maxSeats);

    if (form.image) {

      formData.append("Image", form.image);

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

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold">

            {eventData ? "Edit Event" : "Add Event"}

          </h2>

          <button
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

          <input
            type="text"
            name="eventName"
            value={form.eventName}
            onChange={handleChange}
            placeholder="Event Name"
            className="border rounded-lg p-3"
            required
          />

          <input
            type="date"
            name="eventDate"
            value={form.eventDate}
            onChange={handleChange}
            className="border rounded-lg p-3"
            required
          />

          <input
            type="text"
            name="venue"
            value={form.venue}
            onChange={handleChange}
            placeholder="Venue"
            className="border rounded-lg p-3"
            required
          />

          <input
            type="number"
            name="maxSeats"
            value={form.maxSeats}
            onChange={handleChange}
            placeholder="Maximum Seats"
            className="border rounded-lg p-3"
            required
          />

          <input
            type="number"
            name="entryFee"
            value={form.entryFee}
            onChange={handleChange}
            placeholder="Entry Fee"
            className="border rounded-lg p-3"
          />

          <input
            type="number"
            name="bookPrice"
            value={form.bookPrice}
            onChange={handleChange}
            placeholder="Book Price"
            className="border rounded-lg p-3"
          />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            rows="5"
            className="border rounded-lg p-3 md:col-span-2"
            required
          />

          <div className="md:col-span-2">

            <input
              type="file"
              accept="image/*"
              onChange={handleChange}
            />

          </div>

          {preview && (

            <div className="md:col-span-2">

              <img
                src={preview}
                alt=""
                className="w-40 h-40 object-cover rounded-xl"
              />

            </div>

          )}

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