using BookStore.Server.DTOs.StoryPoetryCopySetting;
using BookStore.Server.Models;
using BookStore.Server.Repositories;

namespace BookStore.Server.Services
{
    public class StoryPoetryCopySettingService
    {
        private readonly StoryPoetryCopySettingRepository _repository;

        public StoryPoetryCopySettingService(
            StoryPoetryCopySettingRepository repository)
        {
            _repository = repository;
        }

        // Get all settings
        public async Task<List<StoryPoetryCopySettingResponse>> GetAllAsync()
        {
            var settings = await _repository.GetAllAsync();

            return settings.Select(MapToResponse).ToList();
        }

        // Get setting by ID
        public async Task<StoryPoetryCopySettingResponse?> GetByIdAsync(int id)
        {
            var setting = await _repository.GetByIdAsync(id);

            if (setting == null)
                return null;

            return MapToResponse(setting);
        }

        // Get setting by Type
        public async Task<StoryPoetryCopySettingResponse?> GetByTypeAsync(
            string type)
        {
            var normalizedType = NormalizeType(type);

            var setting = await _repository.GetByTypeAsync(normalizedType);

            if (setting == null)
                return null;

            return MapToResponse(setting);
        }

        // Add new setting
        public async Task<StoryPoetryCopySettingResponse> AddAsync(
            AddStoryPoetryCopySettingRequest request)
        {
            var normalizedType = NormalizeType(request.Type);

            // Check whether this Type already exists
            var existingSetting = await _repository.GetByTypeAsync(
                normalizedType);

            if (existingSetting != null)
            {
                throw new InvalidOperationException(
                    $"A copy setting already exists for {normalizedType}.");
            }

            var setting = new StoryPoetryCopySetting
            {
                Type = normalizedType,
                FreeCopies = request.FreeCopies,
                CreatedDate = DateTime.UtcNow
            };

            var createdSetting = await _repository.AddAsync(setting);

            return MapToResponse(createdSetting);
        }

        // Update existing setting
        public async Task<StoryPoetryCopySettingResponse?> UpdateAsync(
            int id,
            UpdateStoryPoetryCopySettingRequest request)
        {
            var setting = await _repository.GetByIdAsync(id);

            if (setting == null)
                return null;

            setting.FreeCopies = request.FreeCopies;
            setting.UpdatedDate = DateTime.UtcNow;

            var updatedSetting = await _repository.UpdateAsync(setting);

            return MapToResponse(updatedSetting);
        }

        // Convert entity to response DTO
        private static StoryPoetryCopySettingResponse MapToResponse(
            StoryPoetryCopySetting setting)
        {
            return new StoryPoetryCopySettingResponse
            {
                StoryPoetryCopySettingId =
                    setting.StoryPoetryCopySettingId,

                Type = setting.Type,

                FreeCopies = setting.FreeCopies,

                CreatedDate = setting.CreatedDate,

                UpdatedDate = setting.UpdatedDate
            };
        }

        // Normalize and validate Type
        private static string NormalizeType(string type)
        {
            if (string.IsNullOrWhiteSpace(type))
            {
                throw new ArgumentException("Type is required.");
            }

            if (type.Equals("Story", StringComparison.OrdinalIgnoreCase))
                return "Story";

            if (type.Equals("Poetry", StringComparison.OrdinalIgnoreCase))
                return "Poetry";

            if (type.Equals("Special", StringComparison.OrdinalIgnoreCase))
                return "Special";

            throw new ArgumentException(
                "Type must be either Story, Poetry, or Special.");
        }
    }
}