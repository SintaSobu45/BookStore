using BookStore.Server.DTOs.EventRegistration;
using BookStore.Server.Models.Event;
using BookStore.Server.Repositories;

namespace BookStore.Server.Services
{
    public class EventRegistrationService
    {
        private readonly EventRegistrationRepository _repository;

        public EventRegistrationService(EventRegistrationRepository repository)
        {
            _repository = repository;
        }


        // Register Event
        public async Task<string> RegisterAsync(int userId, AddEventRegistrationRequest request)
        {
            // Check Duplicate Registration
            if (await _repository.AlreadyRegisteredAsync(userId, request.EventId))
            {
                return "You have already registered for this event.";
            }


            // Get Event
            var eventItem = await _repository.GetEventAsync(request.EventId);


            if (eventItem == null)
            {
                return "Event not found.";
            }


            // Check Active
            if (!eventItem.IsActive)
            {
                return "Event is not active.";
            }


            // Check Seats
            if (request.NumberOfSeats > eventItem.AvailableSeats)
            {
                return "Requested seats are not available.";
            }


            // Calculate Amount
            decimal eventAmount = eventItem.EntryFee * request.NumberOfSeats;

            decimal bookAmount = eventItem.BookPrice * request.AdditionalBookCopies;

            decimal totalAmount = eventAmount + bookAmount;



            var registration = new EventRegistration
            {
                UserId = userId,

                EventId = request.EventId,

                NumberOfSeats = request.NumberOfSeats,


                // Extra books for contributors
                AdditionalBookCopies = request.AdditionalBookCopies,


                TotalAmount = totalAmount,


                RegistrationDate = DateTime.UtcNow,

                Status = "Registered"
            };


            await _repository.AddAsync(registration);



            // Reduce Available Seats
            eventItem.AvailableSeats -= request.NumberOfSeats;


            await _repository.SaveChangesAsync();



            return "Event registration successful.";
        }



        // My Registrations
        public async Task<List<EventRegistrationResponse>> GetMyRegistrationsAsync(int userId)
        {
            return await _repository.GetMyRegistrationsAsync(userId);
        }
    }
}