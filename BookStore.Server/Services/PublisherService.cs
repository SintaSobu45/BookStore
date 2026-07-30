using BookStore.Server.DTOs.Publisher;
using BookStore.Server.Models;
using BookStore.Server.Repositories;

namespace BookStore.Server.Services
{
    public class PublisherService
    {
        private readonly PublisherRepository _repository;

        public PublisherService(PublisherRepository repository)
        {
            _repository = repository;
        }

        // Get All Publishers
        public async Task<List<PublisherResponse>> GetAllAsync()
        {
            var publishers = await _repository.GetAllAsync();

            return publishers.Select(p => new PublisherResponse
            {
                PublisherId = p.PublisherId,
                PublisherName = p.PublisherName,
                Description = p.Description,
                IsActive = p.IsActive,
                CreatedDate = p.CreatedDate,
                UpdatedDate = p.UpdatedDate
            }).ToList();
        }

        // Get Publisher By Id
        public async Task<PublisherResponse?> GetByIdAsync(int id)
        {
            var publisher = await _repository.GetByIdAsync(id);

            if (publisher == null)
                return null;

            return new PublisherResponse
            {
                PublisherId = publisher.PublisherId,
                PublisherName = publisher.PublisherName,
                Description = publisher.Description,
                IsActive = publisher.IsActive,
                CreatedDate = publisher.CreatedDate,
                UpdatedDate = publisher.UpdatedDate
            };
        }

        // Create Publisher
        public async Task<bool> CreateAsync(CreatePublisherRequest request)
        {
            if (await _repository.ExistsAsync(request.PublisherName))
                return false;

            var publisher = new Publisher
            {
                PublisherName = request.PublisherName,
                Description = request.Description,
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };

            await _repository.AddAsync(publisher);

            return true;
        }

        // Update Publisher
        public async Task<bool> UpdateAsync(int id, UpdatePublisherRequest request)
        {
            var publisher = await _repository.GetByIdAsync(id);

            if (publisher == null)
                return false;

            publisher.PublisherName = request.PublisherName;
            publisher.Description = request.Description;
            publisher.IsActive = request.IsActive;
            publisher.UpdatedDate = DateTime.UtcNow;

            await _repository.UpdateAsync(publisher);

            return true;
        }

        // Delete Publisher
        public async Task<bool> DeleteAsync(int id)
        {
            var publisher = await _repository.GetByIdAsync(id);

            if (publisher == null)
                return false;

            await _repository.DeleteAsync(publisher);

            return true;
        }
    }
}