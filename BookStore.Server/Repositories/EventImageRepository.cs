using BookStore.Server.Data;
using BookStore.Server.Models.Event;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Server.Repositories
{
    public class EventImageRepository
    {
        private readonly ApplicationDbContext _context;

        public EventImageRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // Add Image
        public async Task AddAsync(EventImage eventImage)
        {
            _context.EventImages.Add(eventImage);
            await _context.SaveChangesAsync();
        }

        // Get Primary Image
        public async Task<EventImage?> GetPrimaryImageAsync(int eventId)
        {
            return await _context.EventImages
                .FirstOrDefaultAsync(i =>
                    i.EventId == eventId &&
                    i.ImageType == "Primary");
        }

        // Get Banner Image
        public async Task<EventImage?> GetBannerImageAsync(int eventId)
        {
            return await _context.EventImages
                .FirstOrDefaultAsync(i =>
                    i.EventId == eventId &&
                    i.ImageType == "Banner");
        }

        // Delete Image
        public async Task DeleteAsync(EventImage eventImage)
        {
            _context.EventImages.Remove(eventImage);
            await _context.SaveChangesAsync();
        }
    }
}