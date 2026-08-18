using BookStore.Server.Data;
using BookStore.Server.DTOs.EventRegistration;
using BookStore.Server.Models.Event;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Server.Repositories
{
    public class EventRegistrationRepository
    {
        private readonly ApplicationDbContext _context;

        public EventRegistrationRepository(
            ApplicationDbContext context)
        {
            _context = context;
        }


        // =========================================================
        // GET REGISTRATION BY ID
        // Used for Payment / Payment Verification
        // =========================================================

        public async Task<EventRegistration?> GetRegistrationAsync(
            int registrationId)
        {
            return await _context.EventRegistrations
                .Include(r => r.Event)
                .FirstOrDefaultAsync(
                    r => r.RegistrationId == registrationId);
        }


        // =========================================================
        // GET REGISTRATION BY ID
        // Used when payment is successfully verified
        // =========================================================

        public async Task<EventRegistration?> GetByIdAsync(
            int registrationId)
        {
            return await _context.EventRegistrations
                .Include(r => r.Event)
                .FirstOrDefaultAsync(
                    r => r.RegistrationId == registrationId);
        }


        // =========================================================
        // CHECK DUPLICATE REGISTRATION
        // =========================================================

        public async Task<bool> AlreadyRegisteredAsync(
            int userId,
            int eventId)
        {
            return await _context.EventRegistrations
                .AnyAsync(r =>
                    r.UserId == userId &&
                    r.EventId == eventId &&
                    r.Status == "Registered");
        }


        // =========================================================
        // GET EVENT
        // =========================================================

        public async Task<Event?> GetEventAsync(
            int eventId)
        {
            return await _context.Events
                .FirstOrDefaultAsync(
                    e => e.EventId == eventId);
        }


        // =========================================================
        // ADD REGISTRATION
        // =========================================================

        public async Task AddAsync(
            EventRegistration registration)
        {
            _context.EventRegistrations.Add(registration);

            await _context.SaveChangesAsync();
        }


        // =========================================================
        // GET MY REGISTRATIONS
        // =========================================================
        // Logged-in user only
        // Includes payment status and payment method
        // =========================================================

        public async Task<List<EventRegistrationResponse>>
            GetMyRegistrationsAsync(int userId)
        {
            return await _context.EventRegistrations
                .Include(r => r.User)
                .Include(r => r.Event)
                .Where(r => r.UserId == userId)
                .Select(r => new EventRegistrationResponse
                {
                    RegistrationId =
                        r.RegistrationId,

                    UserName =
                        r.User!.Name,

                    Email =
                        r.User.Email,

                    Phone =
                        r.User.Phone,

                    EventName =
                        r.Event!.EventName,

                    EventDate =
                        r.Event.EventDate,

                    Venue =
                        r.Event.Venue,

                    NumberOfSeats =
                        r.NumberOfSeats,

                    TotalAmount =
                        r.TotalAmount,

                    Status =
                        r.Status,

                    PaymentStatus =
                        _context.Payments
                            .Where(p =>
                                p.EventRegistrationId ==
                                r.RegistrationId)
                            .OrderByDescending(p => p.CreatedDate)
                            .Select(p => p.Status)
                            .FirstOrDefault()
                        ?? "Not Paid",

                    PaymentMethod =
                        _context.Payments
                            .Where(p =>
                                p.EventRegistrationId ==
                                r.RegistrationId)
                            .OrderByDescending(p => p.CreatedDate)
                            .Select(p => p.PaymentMethod)
                            .FirstOrDefault()
                        ?? string.Empty,

                    RegistrationDate =
                        r.RegistrationDate
                })
                .ToListAsync();
        }


        // =========================================================
        // GET ALL EVENT REGISTRATIONS
        // =========================================================
        // ADMIN ONLY
        // Includes user, event and payment details
        // =========================================================

        public async Task<List<EventRegistrationResponse>>
            GetAllRegistrationsAsync()
        {
            return await _context.EventRegistrations
                .Include(r => r.User)
                .Include(r => r.Event)
                .Select(r => new EventRegistrationResponse
                {
                    RegistrationId =
                        r.RegistrationId,

                    UserName =
                        r.User!.Name,

                    Email =
                        r.User.Email,

                    Phone =
                        r.User.Phone,

                    EventName =
                        r.Event!.EventName,

                    EventDate =
                        r.Event.EventDate,

                    Venue =
                        r.Event.Venue,

                    NumberOfSeats =
                        r.NumberOfSeats,

                    TotalAmount =
                        r.TotalAmount,

                    Status =
                        r.Status,

                    PaymentStatus =
                        _context.Payments
                            .Where(p =>
                                p.EventRegistrationId ==
                                r.RegistrationId)
                            .OrderByDescending(p => p.CreatedDate)
                            .Select(p => p.Status)
                            .FirstOrDefault()
                        ?? "Not Paid",

                    PaymentMethod =
                        _context.Payments
                            .Where(p =>
                                p.EventRegistrationId ==
                                r.RegistrationId)
                            .OrderByDescending(p => p.CreatedDate)
                            .Select(p => p.PaymentMethod)
                            .FirstOrDefault()
                        ?? string.Empty,

                    RegistrationDate =
                        r.RegistrationDate
                })
                .ToListAsync();
        }


        // =========================================================
        // SAVE CHANGES
        // =========================================================

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}