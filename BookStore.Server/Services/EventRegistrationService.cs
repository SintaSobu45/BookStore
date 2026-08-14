using BookStore.Server.DTOs.EventRegistration;
using BookStore.Server.Models.Event;
using BookStore.Server.Repositories;

namespace BookStore.Server.Services
{
    public class EventRegistrationService
    {
        private readonly EventRegistrationRepository _repository;

        public EventRegistrationService(
            EventRegistrationRepository repository)
        {
            _repository = repository;
        }


        // =========================================================
        // REGISTER EVENT
        // =========================================================

        public async Task<string> RegisterAsync(
            int userId,
            AddEventRegistrationRequest request)
        {
            // -----------------------------------------------------
            // 1. Check Duplicate Registration
            // -----------------------------------------------------

            if (await _repository.AlreadyRegisteredAsync(
                userId,
                request.EventId))
            {
                return "You have already registered for this event.";
            }


            // -----------------------------------------------------
            // 2. Get Event
            // -----------------------------------------------------

            var eventItem =
                await _repository.GetEventAsync(
                    request.EventId);

            if (eventItem == null)
            {
                return "Event not found.";
            }


            // -----------------------------------------------------
            // 3. Check Active
            // -----------------------------------------------------

            if (!eventItem.IsActive)
            {
                return "Event is not active.";
            }


            // -----------------------------------------------------
            // 4. Check Available Seats
            // -----------------------------------------------------

            if (request.NumberOfSeats >
                eventItem.AvailableSeats)
            {
                return "Requested seats are not available.";
            }


            // -----------------------------------------------------
            // 5. Event Registration Amount
            // Fixed amount for the event
            // NOT calculated based on number of seats
            // -----------------------------------------------------

            decimal totalAmount =
                eventItem.EntryFee;


            // -----------------------------------------------------
            // 6. Create Registration
            // -----------------------------------------------------

            var registration =
                new EventRegistration
                {
                    UserId =
                        userId,

                    EventId =
                        request.EventId,

                    NumberOfSeats =
                        request.NumberOfSeats,

                    TotalAmount =
                        totalAmount,

                    RegistrationDate =
                        DateTime.UtcNow,

                    Status =
                        "Registered"
                };


            await _repository.AddAsync(
                registration);


            // -----------------------------------------------------
            // 7. Reduce Available Seats
            // -----------------------------------------------------

            eventItem.AvailableSeats -=
                request.NumberOfSeats;


            await _repository.SaveChangesAsync();


            return
                "Event registration successful.";
        }


        // =========================================================
        // MY REGISTRATIONS
        // =========================================================

        public async Task<List<EventRegistrationResponse>>
            GetMyRegistrationsAsync(int userId)
        {
            return await _repository
                .GetMyRegistrationsAsync(userId);
        }
    }
}