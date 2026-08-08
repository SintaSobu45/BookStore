using BookStore.Server.Data;
using BookStore.Server.DTOs.EventRegistration;
using BookStore.Server.Models.Event;
using BookStore.Server.Repositories;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Server.Services
{
    public class EventRegistrationService
    {
        private readonly EventRegistrationRepository _repository;
        private readonly ApplicationDbContext _context;

        public EventRegistrationService(
            EventRegistrationRepository repository,
            ApplicationDbContext context)
        {
            _repository = repository;
            _context = context;
        }


        // Register Event
        public async Task<string> RegisterAsync(
            int userId,
            AddEventRegistrationRequest request)
        {
            // Check Duplicate Registration
            if (await _repository.AlreadyRegisteredAsync(
                userId,
                request.EventId))
            {
                return "You have already registered for this event.";
            }


            // Get Event
            var eventItem = await _repository.GetEventAsync(
                request.EventId);

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


            // Check whether user has an Approved Story/Poetry
            bool isApprovedContributor =
                await _context.StoryPoetries
                    .AnyAsync(s =>
                        s.UserId == userId &&
                        s.Status == "Approved");


            // Normal users cannot request book copies
            if (!isApprovedContributor &&
                request.BookCopies > 0)
            {
                return "Only approved Story/Poetry contributors can request book copies.";
            }


            // Calculate free and paid copies
            int freeBookCopies = 0;
            int paidBookCopies = 0;


            if (isApprovedContributor)
            {
                // First 2 copies are free
                freeBookCopies = Math.Min(
                    request.BookCopies,
                    2);

                // Remaining copies are paid
                paidBookCopies =
                    Math.Max(
                        request.BookCopies - 2,
                        0);
            }


            // Calculate Event Fee
            decimal eventAmount =
                eventItem.EntryFee *
                request.NumberOfSeats;


            // Calculate Extra Book Fee
            decimal bookAmount =
                eventItem.BookPrice *
                paidBookCopies;


            // Final Amount
            decimal totalAmount =
                eventAmount +
                bookAmount;


            // Create Registration
            var registration = new EventRegistration
            {
                UserId = userId,

                EventId = request.EventId,

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

                Status = "Registered"
            };


            await _repository.AddAsync(registration);


            // Reduce Available Seats
            eventItem.AvailableSeats -=
                request.NumberOfSeats;


            await _repository.SaveChangesAsync();


            return "Event registration successful.";
        }


        // My Registrations
        public async Task<List<EventRegistrationResponse>>
            GetMyRegistrationsAsync(int userId)
        {
            return await _repository
                .GetMyRegistrationsAsync(userId);
        }
    }
}