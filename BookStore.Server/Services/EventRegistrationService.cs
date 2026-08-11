using BookStore.Server.DTOs.EventRegistration;
using BookStore.Server.Models.Event;
using BookStore.Server.Repositories;

namespace BookStore.Server.Services
{
    public class EventRegistrationService
    {
        private readonly EventRegistrationRepository _repository;
        private readonly EventContributorRepository _eventContributorRepository;

        public EventRegistrationService(
            EventRegistrationRepository repository,
            EventContributorRepository eventContributorRepository)
        {
            _repository = repository;
            _eventContributorRepository = eventContributorRepository;
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
            // 5. Check Event Contributor
            // -----------------------------------------------------

            bool isEventContributor =
                await _eventContributorRepository
                    .IsContributorAsync(
                        userId,
                        request.EventId);


            // -----------------------------------------------------
            // 6. Normal users cannot request books
            // -----------------------------------------------------

            if (!isEventContributor &&
                request.BookCopies > 0)
            {
                return
                    "Only event contributors can request book copies.";
            }


            // -----------------------------------------------------
            // 7. Calculate Free and Paid Copies
            // -----------------------------------------------------

            int freeBookCopies = 0;

            int paidBookCopies = 0;


            if (isEventContributor)
            {
                // First 2 copies are FREE
                freeBookCopies =
                    Math.Min(
                        request.BookCopies,
                        2);

                // Remaining copies are PAID
                paidBookCopies =
                    Math.Max(
                        request.BookCopies - 2,
                        0);
            }


            // -----------------------------------------------------
            // 8. Calculate Event Fee
            // -----------------------------------------------------

            decimal eventAmount =
                eventItem.EntryFee *
                request.NumberOfSeats;


            // -----------------------------------------------------
            // 9. Calculate Extra Book Fee
            // -----------------------------------------------------

            decimal bookAmount =
                eventItem.BookPrice *
                paidBookCopies;


            // -----------------------------------------------------
            // 10. Calculate Final Amount
            // -----------------------------------------------------

            decimal totalAmount =
                eventAmount +
                bookAmount;


            // -----------------------------------------------------
            // 11. Create Registration
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

                    BookCopies =
                        request.BookCopies,

                    FreeBookCopies =
                        freeBookCopies,

                    PaidBookCopies =
                        paidBookCopies,

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
            // 12. Reduce Available Seats
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