using BookStore.Server.Data;
using BookStore.Server.DTOs.EventContributor;
using BookStore.Server.Models.Event;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Server.Repositories
{
    public class EventContributorRepository
    {
        private readonly ApplicationDbContext _context;

        public EventContributorRepository(
            ApplicationDbContext context)
        {
            _context = context;
        }

        // =========================================================
        // ADD CONTRIBUTOR
        // =========================================================

        public async Task<EventContributor> AddAsync(
            EventContributor contributor)
        {
            _context.EventContributors.Add(contributor);

            await _context.SaveChangesAsync();

            return contributor;
        }


        // =========================================================
        // CHECK DUPLICATE CONTRIBUTOR
        // Used when Admin adds a contributor to an Event
        // =========================================================

        public async Task<bool> AlreadyAddedAsync(
            int eventId,
            int userId)
        {
            return await _context.EventContributors
                .AnyAsync(ec =>
                    ec.EventId == eventId &&
                    ec.UserId == userId);
        }


        // =========================================================
        // CHECK EVENT CONTRIBUTOR
        // Used during Event Registration
        // =========================================================

        public async Task<bool> IsContributorAsync(
            int userId,
            int eventId)
        {
            return await _context.EventContributors
                .AnyAsync(ec =>
                    ec.UserId == userId &&
                    ec.EventId == eventId);
        }


        // =========================================================
        // GET BY ID
        // =========================================================

        public async Task<EventContributor?> GetByIdAsync(
            int id)
        {
            return await _context.EventContributors
                .Include(ec => ec.Event)
                .Include(ec => ec.User)
                .Include(ec => ec.StoryPoetry)
                .FirstOrDefaultAsync(
                    ec => ec.EventContributorId == id);
        }


        // =========================================================
        // GET CONTRIBUTORS OF EVENT
        // Admin can see contributors of a particular event
        // =========================================================

        public async Task<List<EventContributorResponse>>
            GetByEventIdAsync(int eventId)
        {
            return await _context.EventContributors
                .Include(ec => ec.Event)
                .Include(ec => ec.User)
                .Include(ec => ec.StoryPoetry)
                .Where(ec => ec.EventId == eventId)
                .Select(ec => new EventContributorResponse
                {
                    EventContributorId =
                        ec.EventContributorId,

                    EventId =
                        ec.EventId,

                    EventName =
                        ec.Event != null
                            ? ec.Event.EventName
                            : string.Empty,

                    UserId =
                        ec.UserId,

                    UserName =
                        ec.User != null
                            ? ec.User.FirstName + " " +
                              ec.User.LastName
                            : string.Empty,

                    StoryPoetryId =
                        ec.StoryPoetryId,

                    StoryPoetryTitle =
                        ec.StoryPoetry != null
                            ? ec.StoryPoetry.Title
                            : string.Empty,

                    Type =
                        ec.StoryPoetry != null
                            ? ec.StoryPoetry.Type
                            : string.Empty,

                    AddedDate =
                        ec.AddedDate
                })
                .OrderByDescending(
                    ec => ec.AddedDate)
                .ToListAsync();
        }


        // =========================================================
        // GET USER'S CONTRIBUTOR EVENTS
        // User can see events where they are contributors
        // =========================================================

        public async Task<List<EventContributorResponse>>
            GetByUserIdAsync(int userId)
        {
            return await _context.EventContributors
                .Include(ec => ec.Event)
                .Include(ec => ec.User)
                .Include(ec => ec.StoryPoetry)
                .Where(ec => ec.UserId == userId)
                .Select(ec => new EventContributorResponse
                {
                    EventContributorId =
                        ec.EventContributorId,

                    EventId =
                        ec.EventId,

                    EventName =
                        ec.Event != null
                            ? ec.Event.EventName
                            : string.Empty,

                    UserId =
                        ec.UserId,

                    UserName =
                        ec.User != null
                            ? ec.User.FirstName + " " +
                              ec.User.LastName
                            : string.Empty,

                    StoryPoetryId =
                        ec.StoryPoetryId,

                    StoryPoetryTitle =
                        ec.StoryPoetry != null
                            ? ec.StoryPoetry.Title
                            : string.Empty,

                    Type =
                        ec.StoryPoetry != null
                            ? ec.StoryPoetry.Type
                            : string.Empty,

                    AddedDate =
                        ec.AddedDate
                })
                .OrderByDescending(
                    ec => ec.AddedDate)
                .ToListAsync();
        }


        // =========================================================
        // DELETE CONTRIBUTOR
        // =========================================================

        public async Task<bool> DeleteAsync(
            EventContributor contributor)
        {
            _context.EventContributors.Remove(contributor);

            await _context.SaveChangesAsync();

            return true;
        }
    }
}