using BookStore.Server.Data;
using BookStore.Server.DTOs.EventRegistration;
using BookStore.Server.Models.Event;
using BookStore.Server.Repositories;

namespace BookStore.Server.Services
{
    public class EventRegistrationService
    {
        private readonly EventRegistrationRepository _repository;
        private readonly StoryPoetryService _storyPoetryService;
        private readonly ApplicationDbContext _context;

        public EventRegistrationService(
            EventRegistrationRepository repository,
              StoryPoetryService storyPoetryService,
             ApplicationDbContext context
            )
        {
            _repository = repository;
            _storyPoetryService = storyPoetryService;
            _context = context;
        }


        // =========================================================
        // CREATE EVENT REGISTRATION
        // Registration remains PENDING until payment is successful
        // =========================================================

        public async Task<(bool Success, string Message, int? RegistrationId)>
            RegisterAsync(
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
                return (
                    false,
                    "You have already registered for this event.",
                    null
                );
            }


            // -----------------------------------------------------
            // 2. Get Event
            // -----------------------------------------------------

            var eventItem =
                await _repository.GetEventAsync(
                    request.EventId);

            if (eventItem == null)
            {
                return (
                    false,
                    "Event not found.",
                    null
                );
            }


            // -----------------------------------------------------
            // 3. Check Active
            // -----------------------------------------------------

            if (!eventItem.IsActive)
            {
                return (
                    false,
                    "Event is not active.",
                    null
                );
            }


            // -----------------------------------------------------
            // 4. Check Available Seats
            // -----------------------------------------------------

            if (request.NumberOfSeats <= 0)
            {
                return (
                    false,
                    "Number of seats must be greater than zero.",
                    null
                );
            }

            if (request.NumberOfSeats >
                eventItem.AvailableSeats)
            {
                return (
                    false,
                    "Requested seats are not available.",
                    null
                );
            }


            // -----------------------------------------------------
            // 5. Event Registration Amount
            // Fixed amount for the event
            // NOT calculated based on number of seats
            // -----------------------------------------------------

            decimal totalAmount =
                eventItem.EntryFee;


            // -----------------------------------------------------
            // 6. Create Pending Registration
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

                    // Payment is not completed yet
                    Status =
                        "Pending"
                };


            // -----------------------------------------------------
            // 7. Save Pending Registration
            // -----------------------------------------------------
            // IMPORTANT:
            // AvailableSeats is NOT reduced here.
            //
            // Seats will be reduced only after successful
            // Razorpay payment verification.
            // -----------------------------------------------------

            await _repository.AddAsync(
                registration);


            // -----------------------------------------------------
            // 8. Return Generated RegistrationId
            // -----------------------------------------------------

            return (
                true,
                "Event registration created. Please complete the payment.",
                registration.RegistrationId
            );
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


        // =========================================================
        // GET ALL EVENT REGISTRATIONS
        // ADMIN ONLY
        // =========================================================

        public async Task<List<EventRegistrationResponse>>
            GetAllRegistrationsAsync()
        {
            return await _repository
                .GetAllRegistrationsAsync();
        }


        // =========================================================
        // MARK EVENT REGISTRATION AS ATTENDED
        // =========================================================
        // Admin marks a specific event registration as Attended.
        //
        // When attendance is marked:
        // 1. Registration AttendanceStatus → Attended
        // 2. Same user's Paid + Prebook StoryPoetry
        //    → Dispatched
        //
        // Both operations happen inside ONE database transaction.
        //
        // PaymentStatus is never changed.
        // EventId is never added to StoryPoetry.
        // =========================================================

        public async Task<(bool Success, string Message, int DispatchedCount)>
            MarkAsAttendedAsync(int registrationId)
        {
            await using var transaction =
                await _context.Database.BeginTransactionAsync();

            try
            {
                // -----------------------------------------------------
                // 1. GET REGISTRATION
                // -----------------------------------------------------

                var registration =
                    await _repository.GetRegistrationAsync(
                        registrationId);

                if (registration == null)
                {
                    return (
                        false,
                        "Event registration not found.",
                        0
                    );
                }


                // -----------------------------------------------------
                // 2. ALREADY ATTENDED
                // -----------------------------------------------------

                if (string.Equals(
                        registration.AttendanceStatus,
                        "Attended",
                        StringComparison.OrdinalIgnoreCase))
                {
                    await transaction.CommitAsync();

                    return (
                        true,
                        "This registration is already marked as attended.",
                        0
                    );
                }


                // -----------------------------------------------------
                // 3. MARK ATTENDANCE
                // -----------------------------------------------------

                registration.AttendanceStatus = "Attended";


                // -----------------------------------------------------
                // 4. DISPATCH ELIGIBLE STORY / POETRY / SPECIAL
                // -----------------------------------------------------
                // Same UserId from EventRegistration.
                //
                // Only:
                // PaymentStatus = Paid
                // SpOrderStatus = Prebook
                //
                // Story, Poetry and Special are all included.

                int dispatchedCount =
                    await _storyPoetryService
                        .DispatchPaidPrebookSubmissionsForUserAsync(
                            registration.UserId);


                // -----------------------------------------------------
                // 5. SAVE EVERYTHING ONCE
                // -----------------------------------------------------

                await _context.SaveChangesAsync();


                // -----------------------------------------------------
                // 6. COMMIT TRANSACTION
                // -----------------------------------------------------

                await transaction.CommitAsync();


                return (
                    true,
                    "Attendance marked successfully.",
                    dispatchedCount
                );
            }
            catch
            {
                // -----------------------------------------------------
                // ANY ERROR
                // -----------------------------------------------------
                // Attendance remains Registered.
                // StoryPoetry remains Prebook.
                // -----------------------------------------------------

                await transaction.RollbackAsync();

                throw;
            }
        }
    }
}