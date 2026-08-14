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
        // GET ALL SUBMISSIONS
        // =========================================================

        public async Task<List<StoryPoetryResponse>>
            GetAllAsync()
        {
            return await _context.StoryPoetries
                .Include(s => s.User)
                .Select(s => new StoryPoetryResponse
                {
                    StoryPoetryId =
                        s.StoryPoetryId,

                    UserId =
                        s.UserId,

                    UserName =
                        s.User != null
                            ? s.User.FirstName +
                              " " +
                              s.User.LastName
                            : string.Empty,

                    ProfileImageUrl =
                        s.User != null
                            ? s.User.ProfileImageUrl
                            : null,

                    Email =
                        s.User != null
                            ? s.User.Email
                            : string.Empty,

                    Phone =
                        s.User != null
                            ? s.User.Phone
                            : string.Empty,

                    Title =
                        s.Title,

                    Type =
                        s.Type,

                    Content =
                        s.Content,

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

        public async Task<List<StoryPoetryResponse>>
            GetByUserIdAsync(int userId)
        {
            return await _context.StoryPoetries
                .Include(s => s.User)
                .Where(s => s.UserId == userId)
                .Select(s => new StoryPoetryResponse
                {
                    StoryPoetryId =
                        s.StoryPoetryId,

                    UserId =
                        s.UserId,

                    UserName =
                        s.User != null
                            ? s.User.FirstName +
                              " " +
                              s.User.LastName
                            : string.Empty,

                    ProfileImageUrl =
                        s.User != null
                            ? s.User.ProfileImageUrl
                            : null,

                    Email =
                        s.User != null
                            ? s.User.Email
                            : string.Empty,

                    Phone =
                        s.User != null
                            ? s.User.Phone
                            : string.Empty,

                    Title =
                        s.Title,

                    Type =
                        s.Type,

                    Content =
                        s.Content,

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
            _context.StoryPoetries.Update(
                storyPoetry);

            await _context.SaveChangesAsync();

            return storyPoetry;
        }

        // =========================================================
        // DELETE
        // =========================================================

        public async Task<bool> DeleteAsync(
            StoryPoetry storyPoetry)
        {
            _context.StoryPoetries.Remove(
                storyPoetry);

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