using BookStore.Server.Data;
using BookStore.Server.DTOs.StoryPoetry;
using BookStore.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Server.Repositories
{
    public class StoryPoetryRepository
    {
        private readonly ApplicationDbContext _context;

        public StoryPoetryRepository(ApplicationDbContext context)
        {
            _context = context;
        }


        // =========================================================
        // ADD STORY / POETRY / SPECIAL
        // =========================================================

        public async Task<StoryPoetry> AddAsync(
            StoryPoetry storyPoetry)
        {
            _context.StoryPoetries.Add(storyPoetry);

            await _context.SaveChangesAsync();

            return storyPoetry;
        }


        // =========================================================
        // GET BY ID
        // =========================================================

        public async Task<StoryPoetry?> GetByIdAsync(int id)
        {
            return await _context.StoryPoetries
                .Include(s => s.User)
                .FirstOrDefaultAsync(
                    s => s.StoryPoetryId == id);
        }


        // =========================================================
        // GET PAYMENT NOTIFICATION PENDING
        // =========================================================
        // Used by PaymentNotificationBackgroundService.
        //
        // Returns submissions where:
        //
        // 1. Payment is still Pending
        // 2. PaymentEnabledAt has a value
        // 3. PaymentEnabledAt has already passed
        // 4. Payment Available email has not been sent
        //
        // User is included because the background service
        // needs the user's email address.
        // =========================================================

        public async Task<List<StoryPoetry>> GetPaymentNotificationPendingAsync()
        {
            var now = DateTime.UtcNow;

            return await _context.StoryPoetries
                .Include(s => s.User)
                .Where(s =>
                    s.PaymentStatus == "Pending" &&
                    s.PaymentEnabledAt.HasValue &&
                    s.PaymentEnabledAt.Value <= now &&
                    !s.PaymentNotificationSent)
                .OrderBy(s => s.PaymentEnabledAt)
                .ToListAsync();
        }


        // =========================================================
        // GET ALL STORY / POETRY ENTITIES
        // =========================================================
        // Used internally by CertificateService.
        // Returns actual StoryPoetry entities instead of DTOs.
        // =========================================================

        public async Task<List<StoryPoetry>> GetAllEntitiesAsync()
        {
            return await _context.StoryPoetries
                .OrderByDescending(s => s.CreatedDate)
                .ToListAsync();
        }


        // =========================================================
        // GET ALL SUBMISSIONS
        // =========================================================
        // Used by Admin
        // Returns all Story / Poetry submissions.
        // =========================================================

        public async Task<List<StoryPoetryResponse>> GetAllAsync()
        {
            return await _context.StoryPoetries
                .Select(s => new StoryPoetryResponse
                {
                    // -------------------------------------------------
                    // SUBMISSION
                    // -------------------------------------------------

                    StoryPoetryId =
                        s.StoryPoetryId,

                    UserId =
                        s.UserId,


                    // -------------------------------------------------
                    // STORY / POETRY DETAILS
                    // -------------------------------------------------

                    Title =
                        s.Title,

                    Type =
                        s.Type,

                    Content =
                        s.Content,


                    // -------------------------------------------------
                    // CONTRIBUTOR DETAILS
                    // -------------------------------------------------

                    ContributorNameMalayalam =
                        s.ContributorNameMalayalam,

                    ContributorAddressMalayalam =
                        s.ContributorAddressMalayalam,

                    ContributorDistrictMalayalam =
                        s.ContributorDistrictMalayalam,

                    ContributorCityMalayalam =
                        s.ContributorCityMalayalam,

                    ContributorEmail =
                        s.ContributorEmail,

                    ContributorPhone =
                        s.ContributorPhone,


                    // -------------------------------------------------
                    // CONTRIBUTOR PROFILE IMAGE
                    // -------------------------------------------------

                    ContributorProfileImageUrl =
                        s.ContributorProfileImageUrl,


                    // -------------------------------------------------
                    // PAYMENT STATUS
                    // -------------------------------------------------

                    PaymentStatus =
                        s.PaymentStatus,

                    PaymentEnabledAt =
    s.PaymentEnabledAt,


                    // -------------------------------------------------
                    // DATES
                    // -------------------------------------------------

                    CreatedDate =
                        s.CreatedDate,

                    UpdatedDate =
                        s.UpdatedDate
                })
                .OrderByDescending(
                    s => s.CreatedDate)
                .ToListAsync();
        }


        // =========================================================
        // GET USER'S OWN SUBMISSIONS
        // =========================================================
        // Used by logged-in users.
        // Returns only submissions belonging to the given UserId.
        // =========================================================

        public async Task<List<StoryPoetryResponse>> GetByUserIdAsync(
            int userId)
        {
            return await _context.StoryPoetries
                .Where(s => s.UserId == userId)
                .Select(s => new StoryPoetryResponse
                {
                    // -------------------------------------------------
                    // SUBMISSION
                    // -------------------------------------------------

                    StoryPoetryId =
                        s.StoryPoetryId,

                    UserId =
                        s.UserId,


                    // -------------------------------------------------
                    // STORY / POETRY DETAILS
                    // -------------------------------------------------

                    Title =
                        s.Title,

                    Type =
                        s.Type,

                    Content =
                        s.Content,


                    // -------------------------------------------------
                    // CONTRIBUTOR DETAILS
                    // -------------------------------------------------

                    ContributorNameMalayalam =
                        s.ContributorNameMalayalam,

                    ContributorAddressMalayalam =
                        s.ContributorAddressMalayalam,

                    ContributorDistrictMalayalam =
                        s.ContributorDistrictMalayalam,

                    ContributorCityMalayalam =
                        s.ContributorCityMalayalam,

                    ContributorEmail =
                        s.ContributorEmail,

                    ContributorPhone =
                        s.ContributorPhone,


                    // -------------------------------------------------
                    // CONTRIBUTOR PROFILE IMAGE
                    // -------------------------------------------------

                    ContributorProfileImageUrl =
                        s.ContributorProfileImageUrl,


                    // -------------------------------------------------
                    // PAYMENT STATUS
                    // -------------------------------------------------

                    PaymentStatus =
                        s.PaymentStatus,
                    PaymentEnabledAt =
    s.PaymentEnabledAt,


                    // -------------------------------------------------
                    // DATES
                    // -------------------------------------------------

                    CreatedDate =
                        s.CreatedDate,

                    UpdatedDate =
                        s.UpdatedDate
                })
                .OrderByDescending(
                    s => s.CreatedDate)
                .ToListAsync();
        }


        // =========================================================
        // UPDATE
        // =========================================================

        public async Task<StoryPoetry?> UpdateAsync(
            StoryPoetry storyPoetry)
        {
            _context.StoryPoetries.Update(storyPoetry);

            await _context.SaveChangesAsync();

            return storyPoetry;
        }


        // =========================================================
        // DELETE
        // =========================================================

        public async Task<bool> DeleteAsync(
            StoryPoetry storyPoetry)
        {
            _context.StoryPoetries.Remove(storyPoetry);

            await _context.SaveChangesAsync();

            return true;
        }


        // =========================================================
        // CHECK EXISTENCE
        // =========================================================

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.StoryPoetries
                .AnyAsync(
                    s => s.StoryPoetryId == id);
        }


        // =========================================================
        // SAVE CHANGES
        // =========================================================

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}