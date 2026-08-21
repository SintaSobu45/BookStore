using BookStore.Server.Models.Event;
using BookStore.Server.Repositories;

namespace BookStore.Server.Services
{
    public class EventImageService
    {
        private readonly EventImageRepository _repository;

        public EventImageService(EventImageRepository repository)
        {
            _repository = repository;
        }

        // Add Image
        public async Task AddAsync(EventImage eventImage)
        {
            await _repository.AddAsync(eventImage);
        }

        // Get Primary Image
        public async Task<EventImage?> GetPrimaryImageAsync(int eventId)
        {
            return await _repository.GetPrimaryImageAsync(eventId);
        }

        // Get Banner Image
        public async Task<EventImage?> GetBannerImageAsync(int eventId)
        {
            return await _repository.GetBannerImageAsync(eventId);
        }

        // Delete Image
        public async Task DeleteAsync(EventImage eventImage)
        {
            await _repository.DeleteAsync(eventImage);
        }
    }
}