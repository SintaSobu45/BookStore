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

                // Connected to Category table
                CategoryId = request.CategoryId,

                Content = request.Content,

                // New submission always starts as Pending
                Status = "Pending",

                CreatedDate = DateTime.UtcNow
            };

            var created = await _storyPoetryRepository
                .AddAsync(storyPoetry);

            var result = await _storyPoetryRepository
                .GetByIdAsync(created.StoryPoetryId);

            return new StoryPoetryResponse
            {
                StoryPoetryId = result!.StoryPoetryId,

                UserId = result.UserId,

                UserName = result.User != null
                    ? result.User.FirstName + " " + result.User.LastName
                    : string.Empty,

                Title = result.Title,

                Type = result.Type,

                CategoryId = result.CategoryId,

                CategoryName = result.Category != null
                    ? result.Category.CategoryName
                    : string.Empty,

                Content = result.Content,

                Status = result.Status,

                ReviewedDate = result.ReviewedDate,

                AdminRemarks = result.AdminRemarks,

                CreatedDate = result.CreatedDate,

                UpdatedDate = result.UpdatedDate
            };
        }


        // =========================================================
        // GET STORY / POETRY BY ID
        // =========================================================

        public async Task<StoryPoetryResponse?> GetByIdAsync(int id)
        {
            var storyPoetry =
                await _storyPoetryRepository.GetByIdAsync(id);

            if (storyPoetry == null)
                return null;

            return new StoryPoetryResponse
            {
                StoryPoetryId = storyPoetry.StoryPoetryId,

                UserId = storyPoetry.UserId,

                UserName = storyPoetry.User != null
                    ? storyPoetry.User.FirstName + " "
                      + storyPoetry.User.LastName
                    : string.Empty,

                Title = storyPoetry.Title,

                Type = storyPoetry.Type,

                CategoryId = storyPoetry.CategoryId,

                CategoryName = storyPoetry.Category != null
                    ? storyPoetry.Category.CategoryName
                    : string.Empty,

                Content = storyPoetry.Content,

                Status = storyPoetry.Status,

                ReviewedDate = storyPoetry.ReviewedDate,

                AdminRemarks = storyPoetry.AdminRemarks,

                CreatedDate = storyPoetry.CreatedDate,

                UpdatedDate = storyPoetry.UpdatedDate
            };
        }


        // =========================================================
        // GET ALL STORY / POETRY
        // ADMIN USE
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
                await _storyPoetryRepository.GetByIdAsync(id);

            if (storyPoetry == null)
                return null;


            // Only owner can update
            if (storyPoetry.UserId != userId)
                throw new UnauthorizedAccessException(
                    "You can only update your own submission.");


            // Only Pending submissions can be edited
            if (storyPoetry.Status != "Pending")
                throw new InvalidOperationException(
                    "Only pending submissions can be updated.");


            storyPoetry.Title = request.Title;

            storyPoetry.Type = request.Type;

            // Update Category using CategoryId
            storyPoetry.CategoryId = request.CategoryId;

            storyPoetry.Content = request.Content;

            storyPoetry.UpdatedDate = DateTime.UtcNow;


            await _storyPoetryRepository
                .UpdateAsync(storyPoetry);


            return await GetByIdAsync(id);
        }


        // =========================================================
        // APPROVE STORY / POETRY
        // =========================================================

        public async Task<bool> ApproveAsync(
            int id,
            string? adminRemarks)
        {
            var storyPoetry =
                await _storyPoetryRepository.GetByIdAsync(id);

            if (storyPoetry == null)
                return false;


            // Only Pending submissions can be approved
            if (storyPoetry.Status != "Pending")
                throw new InvalidOperationException(
                    "Only pending submissions can be approved or rejected.");


            storyPoetry.Status = "Approved";

            storyPoetry.ReviewedDate = DateTime.UtcNow;

            storyPoetry.AdminRemarks = adminRemarks;


            await _storyPoetryRepository
                .UpdateAsync(storyPoetry);


            return true;
        }


        // =========================================================
        // REJECT STORY / POETRY
        // =========================================================

        public async Task<bool> RejectAsync(
            int id,
            string? adminRemarks)
        {
            var storyPoetry =
                await _storyPoetryRepository.GetByIdAsync(id);

            if (storyPoetry == null)
                return false;


            // Only Pending submissions can be rejected
            if (storyPoetry.Status != "Pending")
                throw new InvalidOperationException(
                    "Only pending submissions can be approved or rejected.");


            storyPoetry.Status = "Rejected";

            storyPoetry.ReviewedDate = DateTime.UtcNow;

            storyPoetry.AdminRemarks = adminRemarks;


            await _storyPoetryRepository
                .UpdateAsync(storyPoetry);


            return true;
        }


        // =========================================================
        // DELETE STORY / POETRY
        // =========================================================

        public async Task<bool> DeleteAsync(
            int id,
            int userId)
        {
            var storyPoetry =
                await _storyPoetryRepository.GetByIdAsync(id);

            if (storyPoetry == null)
                return false;


            // Only owner can delete
            if (storyPoetry.UserId != userId)
                throw new UnauthorizedAccessException(
                    "You can only delete your own submission.");


            // Only Pending submissions can be deleted
            if (storyPoetry.Status != "Pending")
                throw new InvalidOperationException(
                    "Only pending submissions can be deleted.");


            await _storyPoetryRepository
                .DeleteAsync(storyPoetry);


            return true;
        }
    }
}