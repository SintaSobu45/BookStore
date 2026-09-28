using BookStore.Server.Data;
using BookStore.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Server.Repositories
{
    public class SPCourierEmailRepository
    {
        private readonly ApplicationDbContext _context;

        public SPCourierEmailRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // Check whether the user attended the selected event
        public async Task<bool> HasAttendedEventAsync(int userId, int eventId)
        {
            return await _context.EventRegistrations
                .AnyAsync(er =>
                    er.UserId == userId &&
                    er.EventId == eventId &&
                    er.AttendanceStatus == "Attended");
        }

        // Get StoryPoetry submissions of the user
        public async Task<List<StoryPoetry>> GetUserSubmissionsAsync(int userId)
        {
            return await _context.StoryPoetries
                .Where(sp => sp.UserId == userId)
                .ToListAsync();
        }
    }
}