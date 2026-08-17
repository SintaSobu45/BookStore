using BookStore.Server.DTOs.StoryPoetry;
using BookStore.Server.Models;
using BookStore.Server.Repositories;

namespace BookStore.Server.Services
{
    public class StoryPoetryService
    {
        private readonly StoryPoetryRepository _storyPoetryRepository;
        private readonly ProfileRepository _profileRepository;
        private readonly CloudinaryService _cloudinaryService;

        public StoryPoetryService(
            StoryPoetryRepository storyPoetryRepository,
            ProfileRepository profileRepository,
            CloudinaryService cloudinaryService)
        {
            _storyPoetryRepository = storyPoetryRepository;
            _profileRepository = profileRepository;
            _cloudinaryService = cloudinaryService;
        }


        // =========================================================
        // ADD STORY / POETRY / SPECIAL
        // =========================================================

        public async Task<StoryPoetryResponse> AddAsync(
            AddStoryPoetryRequest request,
            int userId)
        {
            // -----------------------------------------------------
            // GET LOGGED-IN USER PROFILE
            // -----------------------------------------------------

            var user = await _profileRepository
                .GetUserByIdAsync(userId);

            if (user == null)
            {
                throw new UnauthorizedAccessException(
                    "User profile not found.");
            }


            // -----------------------------------------------------
            // IMAGE IS REQUIRED
            // -----------------------------------------------------

            if (request.ContributorProfileImage == null ||
                request.ContributorProfileImage.Length == 0)
            {
                throw new ArgumentException(
                    "Contributor profile image is required.");
            }


            // =====================================================
            // CONTRIBUTOR DETAILS
            // =====================================================

            var contributorNameMalayalam =
                request.ContributorNameMalayalam;

            var contributorAddressMalayalam =
                request.ContributorAddressMalayalam;

            var contributorDistrictMalayalam =
                request.ContributorDistrictMalayalam;

            var contributorCityMalayalam =
                request.ContributorCityMalayalam;

            var contributorEmail =
                request.ContributorEmail;

            var contributorPhone =
                request.ContributorPhone;


            // =====================================================
            // VALIDATE CONTRIBUTOR DETAILS
            // =====================================================

            if (string.IsNullOrWhiteSpace(
                contributorNameMalayalam))
            {
                throw new ArgumentException(
                    "Contributor Malayalam name is required.");
            }

            if (string.IsNullOrWhiteSpace(
                contributorAddressMalayalam))
            {
                throw new ArgumentException(
                    "Contributor Malayalam address is required.");
            }

            if (string.IsNullOrWhiteSpace(
                contributorDistrictMalayalam))
            {
                throw new ArgumentException(
                    "Contributor Malayalam district is required.");
            }

            if (string.IsNullOrWhiteSpace(
                contributorCityMalayalam))
            {
                throw new ArgumentException(
                    "Contributor Malayalam city is required.");
            }

            if (string.IsNullOrWhiteSpace(
                contributorEmail))
            {
                throw new ArgumentException(
                    "Contributor email is required.");
            }

            if (string.IsNullOrWhiteSpace(
                contributorPhone))
            {
                throw new ArgumentException(
                    "Contributor phone number is required.");
            }


            // =====================================================
            // UPLOAD PROFILE IMAGE TO CLOUDINARY
            // =====================================================

            var uploadedImage =
                await _cloudinaryService.UploadImageAsync(
                    request.ContributorProfileImage);

            if (uploadedImage == null ||
                string.IsNullOrWhiteSpace(
                    uploadedImage.ImageUrl))
            {
                throw new Exception(
                    "Contributor profile image upload failed.");
            }


            // =====================================================
            // CREATE STORY / POETRY
            // =====================================================

            var storyPoetry = new StoryPoetry
            {
                // Logged-in user
                UserId = userId,

                // Story / Poetry details
                Title = request.Title,

                Type = request.Type,

                Content = request.Content,

                // Contributor snapshot
                ContributorNameMalayalam =
                    contributorNameMalayalam,

                ContributorAddressMalayalam =
                    contributorAddressMalayalam,

                ContributorDistrictMalayalam =
                    contributorDistrictMalayalam,

                ContributorCityMalayalam =
                    contributorCityMalayalam,

                ContributorEmail =
                    contributorEmail,

                ContributorPhone =
                    contributorPhone,

                // Cloudinary image
                ContributorProfileImageUrl =
                    uploadedImage.ImageUrl,

                // =================================================
                // PAYMENT STATUS
                // =================================================
                //
                // Story/Poetry is created first.
                // Payment is completed separately.
                //
                PaymentStatus = "Pending",

                // Date
                CreatedDate = DateTime.UtcNow
            };


            // =====================================================
            // SAVE STORY / POETRY
            // =====================================================

            var created =
                await _storyPoetryRepository
                    .AddAsync(storyPoetry);


            // =====================================================
            // GET SAVED RECORD
            // =====================================================

            var result =
                await _storyPoetryRepository
                    .GetByIdAsync(
                        created.StoryPoetryId);


            return MapToResponse(result!);
        }


        // =========================================================
        // GET BY ID
        // =========================================================

        public async Task<StoryPoetryResponse?> GetByIdAsync(
            int id)
        {
            var storyPoetry =
                await _storyPoetryRepository
                    .GetByIdAsync(id);

            if (storyPoetry == null)
            {
                return null;
            }

            return MapToResponse(storyPoetry);
        }


        // =========================================================
        // GET ALL SUBMISSIONS
        // =========================================================

        public async Task<List<StoryPoetryResponse>> GetAllAsync()
        {
            return await _storyPoetryRepository
                .GetAllAsync();
        }


        // =========================================================
        // GET MY SUBMISSIONS
        // =========================================================

        public async Task<List<StoryPoetryResponse>> GetMyAsync(
            int userId)
        {
            return await _storyPoetryRepository
                .GetByUserIdAsync(userId);
        }


        // =========================================================
        // UPDATE
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
            {
                return null;
            }


            // -----------------------------------------------------
            // ONLY OWNER CAN UPDATE
            // -----------------------------------------------------

            if (storyPoetry.UserId != userId)
            {
                throw new UnauthorizedAccessException(
                    "You can only update your own submission.");
            }


            // -----------------------------------------------------
            // UPDATE STORY DETAILS
            // -----------------------------------------------------

            storyPoetry.Title =
                request.Title;

            storyPoetry.Type =
                request.Type;

            storyPoetry.Content =
                request.Content;

            storyPoetry.UpdatedDate =
                DateTime.UtcNow;


            // -----------------------------------------------------
            // CONTRIBUTOR DETAILS AND IMAGE
            // ARE NOT UPDATED
            // -----------------------------------------------------

            await _storyPoetryRepository
                .UpdateAsync(storyPoetry);


            return await GetByIdAsync(id);
        }


        // =========================================================
        // DELETE
        // =========================================================

        public async Task<bool> DeleteAsync(
            int id,
            int userId)
        {
            var storyPoetry =
                await _storyPoetryRepository
                    .GetByIdAsync(id);

            if (storyPoetry == null)
            {
                return false;
            }


            // -----------------------------------------------------
            // ONLY OWNER CAN DELETE
            // -----------------------------------------------------

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


                // -------------------------------------------------
                // STORY / POETRY DETAILS
                // -------------------------------------------------

                Title =
                    storyPoetry.Title,

                Type =
                    storyPoetry.Type,

                Content =
                    storyPoetry.Content,

                // -------------------------------------------------
                // PAYMENT STATUS
                // -------------------------------------------------

                PaymentStatus =
                    storyPoetry.PaymentStatus,


                // -------------------------------------------------
                // CONTRIBUTOR DETAILS
                // -------------------------------------------------

                ContributorNameMalayalam =
                    storyPoetry
                        .ContributorNameMalayalam,

                ContributorAddressMalayalam =
                    storyPoetry
                        .ContributorAddressMalayalam,

                ContributorDistrictMalayalam =
                    storyPoetry
                        .ContributorDistrictMalayalam,

                ContributorCityMalayalam =
                    storyPoetry
                        .ContributorCityMalayalam,

                ContributorEmail =
                    storyPoetry
                        .ContributorEmail,

                ContributorPhone =
                    storyPoetry
                        .ContributorPhone,


                // -------------------------------------------------
                // PROFILE IMAGE
                // -------------------------------------------------

                ContributorProfileImageUrl =
                    storyPoetry
                        .ContributorProfileImageUrl,


                // -------------------------------------------------
                // DATES
                // -------------------------------------------------

                CreatedDate =
                    storyPoetry.CreatedDate,

                UpdatedDate =
                    storyPoetry.UpdatedDate
            };
        }
    }
}