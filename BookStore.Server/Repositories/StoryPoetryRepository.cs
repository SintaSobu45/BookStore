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

        // Add Story/Poetry
        public async Task<StoryPoetry> AddAsync(StoryPoetry storyPoetry)
        {
            _context.StoryPoetries.Add(storyPoetry);
            await _context.SaveChangesAsync();

            return storyPoetry;
        }

        // Get by Id
        public async Task<StoryPoetry?> GetByIdAsync(int id)
        {
            return await _context.StoryPoetries
                .Include(s => s.User)
                .Include(s => s.Category)
                .FirstOrDefaultAsync(s => s.StoryPoetryId == id);
        }

        // Get all submissions
        public async Task<List<StoryPoetryResponse>> GetAllAsync()
        {
            return await _context.StoryPoetries
                .Include(s => s.User)
                .Include(s => s.Category)
                .Select(s => new StoryPoetryResponse
                {
                    StoryPoetryId = s.StoryPoetryId,

                    UserId = s.UserId,

                    UserName = s.User != null
                        ? s.User.FirstName + " " + s.User.LastName
                        : string.Empty,

                    ProfileImageUrl = s.User != null
                        ? s.User.ProfileImageUrl
                        : null,

                    Email = s.User != null
    ? s.User.Email
    : string.Empty,

                    Phone = s.User != null
    ? s.User.Phone
    : string.Empty,




                    Title = s.Title,

                    Type = s.Type,

                    CategoryId = s.CategoryId,

                    CategoryName = s.Category != null
                        ? s.Category.CategoryName
                        : string.Empty,

                    Content = s.Content,

                    Status = s.Status,

                    ReviewedDate = s.ReviewedDate,

                    AdminRemarks = s.AdminRemarks,

                    CreatedDate = s.CreatedDate,

                    UpdatedDate = s.UpdatedDate
                })
                .OrderByDescending(s => s.CreatedDate)
                .ToListAsync();
        }

        // Get user's own submissions
        public async Task<List<StoryPoetryResponse>> GetByUserIdAsync(int userId)
        {
            return await _context.StoryPoetries
                .Include(s => s.User)
                .Include(s => s.Category)
                .Where(s => s.UserId == userId)
                .Select(s => new StoryPoetryResponse
                {
                    StoryPoetryId = s.StoryPoetryId,

                    UserId = s.UserId,

                    UserName = s.User != null
                        ? s.User.FirstName + " " + s.User.LastName
                        : string.Empty,

                    ProfileImageUrl = s.User != null
                        ? s.User.ProfileImageUrl
                        : null,

                    Title = s.Title,

                    Type = s.Type,

                    CategoryId = s.CategoryId,

                    CategoryName = s.Category != null
                        ? s.Category.CategoryName
                        : string.Empty,

                    Content = s.Content,

                    Status = s.Status,

                    ReviewedDate = s.ReviewedDate,

                    AdminRemarks = s.AdminRemarks,

                    CreatedDate = s.CreatedDate,

                    UpdatedDate = s.UpdatedDate
                })
                .OrderByDescending(s => s.CreatedDate)
                .ToListAsync();
        }

        // Update
        public async Task<StoryPoetry?> UpdateAsync(StoryPoetry storyPoetry)
        {
            _context.StoryPoetries.Update(storyPoetry);

            await _context.SaveChangesAsync();

            return storyPoetry;
        }

        // Delete
        public async Task<bool> DeleteAsync(StoryPoetry storyPoetry)
        {
            _context.StoryPoetries.Remove(storyPoetry);

            await _context.SaveChangesAsync();

            return true;
        }

        // Check existence
        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.StoryPoetries
                .AnyAsync(s => s.StoryPoetryId == id);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();


        }
    }
}