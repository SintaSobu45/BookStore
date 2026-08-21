using BookStore.Server.Data;
using BookStore.Server.DTOs.Event;
using BookStore.Server.Models.Event;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Server.Repositories
{
    public class EventRepository
    {
        private readonly ApplicationDbContext _context;

        public EventRepository(ApplicationDbContext context)
        {
            _context = context;
        }


        // =========================================================
        // GET ALL EVENTS
        // =========================================================

        public async Task<List<EventResponse>> GetAllAsync()
        {
            return await _context.Events
                .Include(e => e.EventImages)
                .Select(e => new EventResponse
                {
                    EventId = e.EventId,
                    EventName = e.EventName,
                    Description = e.Description,
                    EventDate = e.EventDate,
                    EventTime = e.EventTime,
                    Venue = e.Venue,
                    EntryFee = e.EntryFee,

                    MaxSeats = e.MaxSeats,
                    AvailableSeats = e.AvailableSeats,
                    IsActive = e.IsActive,

                    // Event Card Image
                    ImageUrl = e.EventImages
                        .Where(i => i.ImageType == "Primary")
                        .Select(i => i.ImageUrl)
                        .FirstOrDefault(),

                    // Website Banner Image
                    BannerImageUrl = e.EventImages
                        .Where(i => i.ImageType == "Banner")
                        .Select(i => i.ImageUrl)
                        .FirstOrDefault()
                })
                .ToListAsync();
        }


        // =========================================================
        // GET EVENT ENTITY BY ID
        // =========================================================

        public async Task<Event?> GetByIdAsync(int id)
        {
            return await _context.Events
                .Include(e => e.EventImages)
                .FirstOrDefaultAsync(e => e.EventId == id);
        }


        // =========================================================
        // GET EVENT RESPONSE BY ID
        // =========================================================

        public async Task<EventResponse?> GetResponseByIdAsync(int id)
        {
            return await _context.Events
                .Include(e => e.EventImages)
                .Where(e => e.EventId == id)
                .Select(e => new EventResponse
                {
                    EventId = e.EventId,
                    EventName = e.EventName,
                    Description = e.Description,
                    EventDate = e.EventDate,
                    EventTime = e.EventTime,
                    Venue = e.Venue,
                    EntryFee = e.EntryFee,

                    MaxSeats = e.MaxSeats,
                    AvailableSeats = e.AvailableSeats,
                    IsActive = e.IsActive,

                    // Event Card Image
                    ImageUrl = e.EventImages
                        .Where(i => i.ImageType == "Primary")
                        .Select(i => i.ImageUrl)
                        .FirstOrDefault(),

                    // Website Banner Image
                    BannerImageUrl = e.EventImages
                        .Where(i => i.ImageType == "Banner")
                        .Select(i => i.ImageUrl)
                        .FirstOrDefault()
                })
                .FirstOrDefaultAsync();
        }


        // =========================================================
        // ADD EVENT
        // =========================================================

        public async Task<Event> AddAsync(Event eventItem)
        {
            _context.Events.Add(eventItem);
            await _context.SaveChangesAsync();

            return eventItem;
        }


        // =========================================================
        // UPDATE EVENT
        // =========================================================

        public async Task<Event?> UpdateAsync(Event eventItem)
        {
            _context.Events.Update(eventItem);
            await _context.SaveChangesAsync();

            return eventItem;
        }


        // =========================================================
        // DELETE EVENT
        // =========================================================

        public async Task<bool> DeleteAsync(Event eventItem)
        {
            _context.Events.Remove(eventItem);
            await _context.SaveChangesAsync();

            return true;
        }


        // =========================================================
        // CHECK EVENT EXISTS
        // =========================================================

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Events
                .AnyAsync(e => e.EventId == id);
        }
    }
}