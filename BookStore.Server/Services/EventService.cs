using BookStore.Server.DTOs.Event;
using BookStore.Server.Models.Event;
using BookStore.Server.Repositories;

namespace BookStore.Server.Services
{
    public class EventService
    {
        private readonly EventRepository _eventRepository;
        private readonly CloudinaryService _cloudinaryService;
        private readonly EventImageService _eventImageService;

        public EventService(
            EventRepository eventRepository,
            CloudinaryService cloudinaryService,
            EventImageService eventImageService)
        {
            _eventRepository = eventRepository;
            _cloudinaryService = cloudinaryService;
            _eventImageService = eventImageService;
        }

        // =========================================================
        // GET ALL EVENTS
        // =========================================================

        public async Task<List<EventResponse>> GetAllAsync()
        {
            return await _eventRepository.GetAllAsync();
        }


        // =========================================================
        // GET EVENT BY ID
        // =========================================================

        public async Task<EventResponse?> GetByIdAsync(int id)
        {
            return await _eventRepository.GetResponseByIdAsync(id);
        }


        // =========================================================
        // ADD EVENT
        // =========================================================

        public async Task<EventResponse?> AddAsync(
            AddEventRequest request)
        {
            var eventItem = new Event
            {
                EventName = request.EventName,

                Description = request.Description,

                EventDate = request.EventDate,

                EventTime = request.EventTime,

                Venue = request.Venue,

                // Fixed registration fee for the event
                EntryFee = request.EntryFee,

                MaxSeats = request.MaxSeats,

                AvailableSeats = request.MaxSeats,

                IsActive = true,

                CreatedDate = DateTime.UtcNow
            };


            // Save Event
            eventItem = await _eventRepository.AddAsync(eventItem);


            // Upload Event Image
            if (request.Image != null)
            {
                var uploadResult =
                    await _cloudinaryService
                        .UploadImageAsync(request.Image);

                if (uploadResult != null)
                {
                    var eventImage = new EventImage
                    {
                        EventId = eventItem.EventId,

                        ImageUrl = uploadResult.ImageUrl,

                        IsPrimary = true
                    };

                    await _eventImageService
                        .AddAsync(eventImage);
                }
            }


            return await _eventRepository
                .GetResponseByIdAsync(eventItem.EventId);
        }


        // =========================================================
        // UPDATE EVENT
        // =========================================================

        public async Task<EventResponse?> UpdateAsync(
            int id,
            UpdateEventRequest request)
        {
            var eventItem =
                await _eventRepository.GetByIdAsync(id);

            if (eventItem == null)
                return null;


            eventItem.EventName = request.EventName;

            eventItem.Description = request.Description;

            eventItem.EventDate = request.EventDate;

            eventItem.EventTime = request.EventTime;

            eventItem.Venue = request.Venue;

            // Fixed registration fee
            eventItem.EntryFee = request.EntryFee;


            // Calculate already booked seats
            int bookedSeats =
                eventItem.MaxSeats -
                eventItem.AvailableSeats;


            eventItem.MaxSeats = request.MaxSeats;


            // Keep already booked seats
            eventItem.AvailableSeats =
                request.MaxSeats - bookedSeats;


            if (eventItem.AvailableSeats < 0)
                eventItem.AvailableSeats = 0;


            eventItem.IsActive = request.IsActive;

            eventItem.UpdatedDate = DateTime.UtcNow;


            await _eventRepository
                .UpdateAsync(eventItem);


            // =====================================================
            // REPLACE EVENT IMAGE
            // =====================================================

            if (request.Image != null)
            {
                var oldImage =
                    await _eventImageService
                        .GetPrimaryImageAsync(eventItem.EventId);


                if (oldImage != null)
                {
                    await _eventImageService
                        .DeleteAsync(oldImage);
                }


                var uploadResult =
                    await _cloudinaryService
                        .UploadImageAsync(request.Image);


                if (uploadResult != null)
                {
                    var newImage = new EventImage
                    {
                        EventId = eventItem.EventId,

                        ImageUrl = uploadResult.ImageUrl,

                        IsPrimary = true
                    };

                    await _eventImageService
                        .AddAsync(newImage);
                }
            }


            return await _eventRepository
                .GetResponseByIdAsync(eventItem.EventId);
        }


        // =========================================================
        // DELETE EVENT
        // =========================================================

        public async Task<bool> DeleteAsync(int id)
        {
            var eventItem =
                await _eventRepository.GetByIdAsync(id);

            if (eventItem == null)
                return false;


            return await _eventRepository
                .DeleteAsync(eventItem);
        }
    }
}