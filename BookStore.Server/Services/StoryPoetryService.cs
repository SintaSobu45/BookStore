using BookStore.Server.DTOs.StoryPoetry;
using BookStore.Server.Models;
using BookStore.Server.Repositories;

namespace BookStore.Server.Services
{
    public class StoryPoetryService
    {
        private readonly StoryPoetryRepository _storyPoetryRepository;

        public StoryPoetryService(
            StoryPoetryRepository storyPoetryRepository)
        {
            _storyPoetryRepository = storyPoetryRepository;
        }

        // =========================================================
        // ADD STORY / POETRY
        // =========================================================

        public async Task<StoryPoetryResponse> AddAsync(
            AddStoryPoetryRequest request,
            int userId)
        {
            var storyPoetry = new StoryPoetry
            {
                UserId = userId,

                Title = request.Title,

                Type = request.Type,

                Content = request.Content,

                CreatedDate = DateTime.UtcNow
            };

            var created =
                await _storyPoetryRepository
                    .AddAsync(storyPoetry);

            var result =
                await _storyPoetryRepository
                    .GetByIdAsync(created.StoryPoetryId);

            return MapToResponse(result!);
        }

        // =========================================================
        // GET STORY / POETRY BY ID
        // =========================================================

        public async Task<StoryPoetryResponse?> GetByIdAsync(int id)
        {
            var storyPoetry =
                await _storyPoetryRepository
                    .GetByIdAsync(id);

            if (storyPoetry == null)
                return null;

            return MapToResponse(storyPoetry);
        }

        // =========================================================
        // GET ALL STORY / POETRY
        // =========================================================

        public async Task<List<StoryPoetryResponse>> GetAllAsync()
        {
            return await _storyPoetryRepository
                .GetAllAsync();
        }

        // =========================================================
        // GET MY STORY / POETRY
        // =========================================================

        public async Task<List<StoryPoetryResponse>> GetMyAsync(
            int userId)
        {
            return await _storyPoetryRepository
                .GetByUserIdAsync(userId);
        }

        // =========================================================
        // UPDATE STORY / POETRY
        // =========================================================

        public async Task<StoryPoetryResponse?> UpdateAsync(
            int id,
            UpdateStoryPoetryRequest request,
            int userId)
        {
            var storyPoetry =
                await _storyPoetryRepository
                    .GetByIdAsync(id);

            if (storyPoetry == null)
                return null;

            // Only owner can update
            if (storyPoetry.UserId != userId)
            {
                throw new UnauthorizedAccessException(
                    "You can only update your own submission.");
            }

            storyPoetry.Title =
                request.Title;

            storyPoetry.Type =
                request.Type;

            storyPoetry.Content =
                request.Content;

            storyPoetry.UpdatedDate =
                DateTime.UtcNow;

            await _storyPoetryRepository
                .UpdateAsync(storyPoetry);

            return await GetByIdAsync(id);
        }

        // =========================================================
        // DELETE STORY / POETRY
        // =========================================================

        public async Task<bool> DeleteAsync(
            int id,
            int userId)
        {
            var storyPoetry =
                await _storyPoetryRepository
                    .GetByIdAsync(id);

            if (storyPoetry == null)
                return false;

            // Only owner can delete
            if (storyPoetry.UserId != userId)
            {
                throw new UnauthorizedAccessException(
                    "You can only delete your own submission.");
            }

            await _storyPoetryRepository
                .DeleteAsync(storyPoetry);

            return true;
        }

        // =========================================================
        // MAP ENTITY TO RESPONSE DTO
        // =========================================================

        private static StoryPoetryResponse MapToResponse(
            StoryPoetry storyPoetry)
        {
            return new StoryPoetryResponse
            {
                StoryPoetryId =
                    storyPoetry.StoryPoetryId,

                UserId =
                    storyPoetry.UserId,

                UserName =
                    storyPoetry.User != null
                        ? storyPoetry.User.FirstName + " " +
                          storyPoetry.User.LastName
                        : string.Empty,

                ProfileImageUrl =
                    storyPoetry.User?.ProfileImageUrl,

                Email =
                    storyPoetry.User?.Email ?? string.Empty,

                Phone =
                    storyPoetry.User?.Phone ?? string.Empty,

                Title =
                    storyPoetry.Title,

                Type =
                    storyPoetry.Type,

                Content =
                    storyPoetry.Content,

                CreatedDate =
                    storyPoetry.CreatedDate,

                UpdatedDate =
                    storyPoetry.UpdatedDate
            };
        }
    }
}