using BookStore.Server.DTOs.StoryPoetryParticular;
using BookStore.Server.Models;
using BookStore.Server.Repositories;

namespace BookStore.Server.Services
{
    public class StoryPoetryParticularService
    {
        private readonly StoryPoetryParticularRepository _repository;

        public StoryPoetryParticularService(
            StoryPoetryParticularRepository repository)
        {
            _repository = repository;
        }


        // =========================================================
        // GET ALL PARTICULARS
        // =========================================================

        public async Task<List<StoryPoetryParticularResponse>> GetAllAsync()
        {
            var particulars = await _repository.GetAllAsync();

            return particulars.Select(MapToResponse).ToList();
        }


        // =========================================================
        // GET ACTIVE PARTICULARS BY TYPE
        // =========================================================

        public async Task<List<StoryPoetryParticularResponse>>
            GetActiveByTypeAsync(string type)
        {
            if (string.IsNullOrWhiteSpace(type))
                throw new ArgumentException("Type is required.");

            type = type.Trim();

            if (!IsValidType(type))
                throw new ArgumentException(
                    "Type must be Story, Poetry, or Special.");

            var particulars =
                await _repository.GetActiveByTypeAsync(type);

            return particulars.Select(MapToResponse).ToList();
        }


        // =========================================================
        // GET BY ID
        // =========================================================

        public async Task<StoryPoetryParticularResponse?> GetByIdAsync(
            int id)
        {
            var particular = await _repository.GetByIdAsync(id);

            if (particular == null)
                return null;

            return MapToResponse(particular);
        }


        // =========================================================
        // ADD PARTICULAR
        // =========================================================

        public async Task<StoryPoetryParticularResponse>
            AddAsync(AddStoryPoetryParticularRequest request)
        {
            var type = request.Type.Trim();
            var name = request.Name.Trim();

            if (!IsValidType(type))
                throw new ArgumentException(
                    "Type must be Story, Poetry, or Special.");

            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException(
                    "Particular name is required.");

            if (request.ExtraCopyPrice < 0)
                throw new ArgumentException(
                    "Extra copy price cannot be negative.");

            // Check duplicate within the same Type
            var exists =
                await _repository.ExistsByNameAndTypeAsync(
                    type,
                    name);

            if (exists)
                throw new InvalidOperationException(
                    $"The particular '{name}' already exists under {type}.");

            var particular = new StoryPoetryParticular
            {
                Type = type,
                Name = name,
                ExtraCopyPrice = request.ExtraCopyPrice,
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };

            await _repository.AddAsync(particular);

            return MapToResponse(particular);
        }


        // =========================================================
        // DEACTIVATE PARTICULAR
        // =========================================================

        public async Task<StoryPoetryParticularResponse?>
            DeactivateAsync(int id)
        {
            var particular = await _repository.GetByIdAsync(id);

            if (particular == null)
                return null;

            if (!particular.IsActive)
                throw new InvalidOperationException(
                    "This particular is already inactive.");

            particular.IsActive = false;
            particular.UpdatedDate = DateTime.UtcNow;

            await _repository.UpdateAsync(particular);

            return MapToResponse(particular);
        }


        // =========================================================
        // VALIDATE TYPE
        // =========================================================

        private static bool IsValidType(string type)
        {
            return type.Equals(
                       "Story",
                       StringComparison.OrdinalIgnoreCase)
                   ||
                   type.Equals(
                       "Poetry",
                       StringComparison.OrdinalIgnoreCase)
                   ||
                   type.Equals(
                       "Special",
                       StringComparison.OrdinalIgnoreCase);
        }


        // =========================================================
        // MAP MODEL → RESPONSE
        // =========================================================

        private static StoryPoetryParticularResponse MapToResponse(
            StoryPoetryParticular particular)
        {
            return new StoryPoetryParticularResponse
            {
                StoryPoetryParticularId =
                    particular.StoryPoetryParticularId,

                Type =
                    particular.Type,

                Name =
                    particular.Name,

                ExtraCopyPrice =
                    particular.ExtraCopyPrice,

                IsActive =
                    particular.IsActive,

                CreatedDate =
                    particular.CreatedDate,

                UpdatedDate =
                    particular.UpdatedDate
            };
        }
    }
}