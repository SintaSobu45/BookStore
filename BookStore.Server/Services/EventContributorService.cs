using BookStore.Server.Data;
using BookStore.Server.DTOs.EventContributor;
using BookStore.Server.Models.Event;
using BookStore.Server.Repositories;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Server.Services
{
    public class EventContributorService
    {
        private readonly EventContributorRepository _repository;
        private readonly ApplicationDbContext _context;

        public EventContributorService(
            EventContributorRepository repository,
            ApplicationDbContext context)
        {
            _repository = repository;
            _context = context;
        }


        // =========================================================
        // ADD CONTRIBUTOR TO EVENT
        // =========================================================

        public async Task<string> AddAsync(
            AddEventContributorRequest request)
        {
            // -----------------------------------------------------
            // 1. Check Event
            // -----------------------------------------------------

            var eventItem =
                await _context.Events
                    .FirstOrDefaultAsync(
                        e => e.EventId == request.EventId);

            if (eventItem == null)
            {
                return "Event not found.";
            }


            // -----------------------------------------------------
            // 2. Check Story/Poetry
            // -----------------------------------------------------

            var storyPoetry =
                await _context.StoryPoetries
                    .FirstOrDefaultAsync(
                        s => s.StoryPoetryId ==
                             request.StoryPoetryId);

            if (storyPoetry == null)
            {
                return "Story/Poetry submission not found.";
            }


            // -----------------------------------------------------
            // 3. Only Approved Story/Poetry
            // -----------------------------------------------------

            if (storyPoetry.Status != "Approved")
            {
                return
                    "Only approved Story/Poetry submissions can be added to an event.";
            }


            // -----------------------------------------------------
            // 4. Get User From Story/Poetry
            // -----------------------------------------------------

            int userId = storyPoetry.UserId;


            // -----------------------------------------------------
            // 5. Check Duplicate
            // -----------------------------------------------------

            if (await _repository.AlreadyAddedAsync(
                request.EventId,
                userId))
            {
                return
                    "This contributor is already added to this event.";
            }


            // -----------------------------------------------------
            // 6. Create EventContributor
            // -----------------------------------------------------

            var contributor = new EventContributor
            {
                EventId =
                    request.EventId,

                UserId =
                    userId,

                StoryPoetryId =
                    request.StoryPoetryId,

                AddedDate =
                    DateTime.UtcNow
            };


            await _repository.AddAsync(
                contributor);


            return
                "Contributor added to event successfully.";
        }


        // =========================================================
        // GET EVENT CONTRIBUTORS
        // =========================================================

        public async Task<List<EventContributorResponse>>
            GetByEventIdAsync(int eventId)
        {
            return await _repository
                .GetByEventIdAsync(eventId);
        }


        // =========================================================
        // GET MY CONTRIBUTOR EVENTS
        // =========================================================

        public async Task<List<EventContributorResponse>>
            GetMyEventsAsync(int userId)
        {
            return await _repository
                .GetByUserIdAsync(userId);
        }


        // =========================================================
        // REMOVE CONTRIBUTOR
        // =========================================================

        public async Task<bool> DeleteAsync(int id)
        {
            var contributor =
                await _repository.GetByIdAsync(id);

            if (contributor == null)
            {
                return false;
            }

            await _repository.DeleteAsync(
                contributor);

            return true;
        }
    }
}