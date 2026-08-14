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
        // CHECK DUPLICATE REGISTRATION
        // =========================================================

        public async Task<bool> AlreadyRegisteredAsync(
            int userId,
            int eventId)
        {
            return await _context.EventRegistrations
                .AnyAsync(r =>
                    r.UserId == userId &&
                    r.EventId == eventId);
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
                        r.User!.FirstName +
                        " " +
                        r.User.LastName,

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