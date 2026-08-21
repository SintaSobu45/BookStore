using BookStore.Server.DTOs.Event;
using BookStore.Server.Models.Event;
using BookStore.Server.Repositories;

namespace BookStore.Server.Services
{
    public class EventService
    {
        private readonly EventRepository _eventRepository;
        private readonly FtpImageService _ftpImageService;
        private readonly EventImageService _eventImageService;

        public EventService(
            EventRepository eventRepository,
            FtpImageService ftpImageService,
            EventImageService eventImageService)
        {
            _eventRepository = eventRepository;
            _ftpImageService = ftpImageService;
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
            return await _eventRepository
                .GetResponseByIdAsync(id);
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
                // Same amount regardless of number of seats
                EntryFee = request.EntryFee,

                MaxSeats = request.MaxSeats,

                // Initially all seats are available
                AvailableSeats = request.MaxSeats,

                IsActive = true,

                CreatedDate = DateTime.UtcNow
            };


            // -----------------------------------------------------
            // SAVE EVENT
            // -----------------------------------------------------

            eventItem =
                await _eventRepository
                    .AddAsync(eventItem);


            // -----------------------------------------------------
            // UPLOAD EVENT IMAGE TO FTP
            // -----------------------------------------------------

            if (request.Image != null)
            {
                var imageUrl =
                    await _ftpImageService
                        .UploadImageAsync(request.Image);

                if (imageUrl != null)
                {
                    var eventImage = new EventImage
                    {
                        EventId = eventItem.EventId,

                        ImageUrl = imageUrl,

                        IsPrimary = true
                    };

                    await _eventImageService
                        .AddAsync(eventImage);
                }
            }


            return await _eventRepository
                .GetResponseByIdAsync(
                    eventItem.EventId);
        }


        // =========================================================
        // UPDATE EVENT
        // =========================================================

        public async Task<EventResponse?> UpdateAsync(
            int id,
            UpdateEventRequest request)
        {
            var eventItem =
                await _eventRepository
                    .GetByIdAsync(id);

            if (eventItem == null)
                return null;


            // -----------------------------------------------------
            // CALCULATE ALREADY BOOKED SEATS
            // -----------------------------------------------------

            int bookedSeats =
                eventItem.MaxSeats -
                eventItem.AvailableSeats;


            // -----------------------------------------------------
            // VALIDATE NEW MAX SEATS
            // -----------------------------------------------------

            // Admin cannot reduce MaxSeats below
            // the number of already booked seats.

            if (request.MaxSeats < bookedSeats)
            {
                throw new ArgumentException(
                    $"Max seats cannot be less than already booked seats ({bookedSeats}).");
            }


            // -----------------------------------------------------
            // UPDATE EVENT DETAILS
            // -----------------------------------------------------

            eventItem.EventName =
                request.EventName;

            eventItem.Description =
                request.Description;

            eventItem.EventDate =
                request.EventDate;

            eventItem.EventTime =
                request.EventTime;

            eventItem.Venue =
                request.Venue;

            // Fixed registration fee
            // Same amount regardless of number of seats
            eventItem.EntryFee =
                request.EntryFee;


            // -----------------------------------------------------
            // UPDATE SEAT INFORMATION
            // -----------------------------------------------------

            eventItem.MaxSeats =
                request.MaxSeats;

            eventItem.AvailableSeats =
                request.MaxSeats - bookedSeats;


            // -----------------------------------------------------
            // UPDATE STATUS AND DATE
            // -----------------------------------------------------

            eventItem.IsActive =
                request.IsActive;

            eventItem.UpdatedDate =
                DateTime.UtcNow;


            // -----------------------------------------------------
            // SAVE EVENT
            // -----------------------------------------------------

            await _eventRepository
                .UpdateAsync(eventItem);


            // =====================================================
            // REPLACE EVENT IMAGE
            // =====================================================

            if (request.Image != null)
            {
                // Get old primary image
                var oldImage =
                    await _eventImageService
                        .GetPrimaryImageAsync(
                            eventItem.EventId);


                // Delete old image record
                if (oldImage != null)
                {
                    await _eventImageService
                        .DeleteAsync(oldImage);
                }


                // Upload new image to FTP
                var imageUrl =
                    await _ftpImageService
                        .UploadImageAsync(request.Image);


                if (imageUrl != null)
                {
                    var newImage = new EventImage
                    {
                        EventId =
                            eventItem.EventId,

                        ImageUrl =
                            imageUrl,

                        IsPrimary = true
                    };

                    await _eventImageService
                        .AddAsync(newImage);
                }
            }


            return await _eventRepository
                .GetResponseByIdAsync(
                    eventItem.EventId);
        }


        // =========================================================
        // DELETE EVENT
        // =========================================================

        public async Task<bool> DeleteAsync(int id)
        {
            var eventItem =
                await _eventRepository
                    .GetByIdAsync(id);

            if (eventItem == null)
                return false;


            return await _eventRepository
                .DeleteAsync(eventItem);
        }
    }
}