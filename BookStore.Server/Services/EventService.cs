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


        // Get All Events
        public async Task<List<EventResponse>> GetAllAsync()
        {
            return await _eventRepository.GetAllAsync();
        }


        // Get Event By Id
        public async Task<EventResponse?> GetByIdAsync(int id)
        {
            return await _eventRepository.GetResponseByIdAsync(id);
        }


        // Add Event
        public async Task<EventResponse?> AddAsync(AddEventRequest request)
        {
            var eventItem = new Event
            {
                EventName = request.EventName,
                Description = request.Description,
                EventDate = request.EventDate,
                Venue = request.Venue,

                // Fees
                EntryFee = request.EntryFee,
                BookPrice = request.BookPrice,

                MaxSeats = request.MaxSeats,
                AvailableSeats = request.MaxSeats,

                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };


            // Save Event
            eventItem = await _eventRepository.AddAsync(eventItem);


            // Upload Image
            if (request.Image != null)
            {
                var uploadResult = await _cloudinaryService.UploadImageAsync(request.Image);

                if (uploadResult != null)
                {
                    var eventImage = new EventImage
                    {
                        EventId = eventItem.EventId,
                        ImageUrl = uploadResult.ImageUrl,
                        IsPrimary = true
                    };

                    await _eventImageService.AddAsync(eventImage);
                }
            }


            return await _eventRepository.GetResponseByIdAsync(eventItem.EventId);
        }



        // Update Event
        public async Task<EventResponse?> UpdateAsync(int id, UpdateEventRequest request)
        {
            var eventItem = await _eventRepository.GetByIdAsync(id);

            if (eventItem == null)
                return null;


            eventItem.EventName = request.EventName;
            eventItem.Description = request.Description;
            eventItem.EventDate = request.EventDate;
            eventItem.Venue = request.Venue;

            // Fees
            eventItem.EntryFee = request.EntryFee;
            eventItem.BookPrice = request.BookPrice;


            // Keep AvailableSeats consistent if MaxSeats changes
            int bookedSeats = eventItem.MaxSeats - eventItem.AvailableSeats;


            eventItem.MaxSeats = request.MaxSeats;

            eventItem.AvailableSeats = request.MaxSeats - bookedSeats;


            if (eventItem.AvailableSeats < 0)
                eventItem.AvailableSeats = 0;


            eventItem.IsActive = request.IsActive;
            eventItem.UpdatedDate = DateTime.UtcNow;


            await _eventRepository.UpdateAsync(eventItem);



            // Replace Image
            if (request.Image != null)
            {
                var oldImage = await _eventImageService.GetPrimaryImageAsync(eventItem.EventId);


                if (oldImage != null)
                {
                    await _eventImageService.DeleteAsync(oldImage);
                }


                var uploadResult = await _cloudinaryService.UploadImageAsync(request.Image);


                if (uploadResult != null)
                {
                    var newImage = new EventImage
                    {
                        EventId = eventItem.EventId,
                        ImageUrl = uploadResult.ImageUrl,
                        IsPrimary = true
                    };


                    await _eventImageService.AddAsync(newImage);
                }
            }


            return await _eventRepository.GetResponseByIdAsync(eventItem.EventId);
        }



        // Delete Event
        public async Task<bool> DeleteAsync(int id)
        {
            var eventItem = await _eventRepository.GetByIdAsync(id);

            if (eventItem == null)
                return false;


            return await _eventRepository.DeleteAsync(eventItem);
        }
    }
}