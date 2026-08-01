using BookStore.Server.Data;
using BookStore.Server.DTOs.Review;
using BookStore.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Server.Repositories
{
    public class ReviewRepository
    {
        private readonly ApplicationDbContext _context;

        public ReviewRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // Get All Reviews
        public async Task<List<ReviewResponse>> GetAllAsync()
        {
            return await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Book)
                .Select(r => new ReviewResponse
                {
                    ReviewId = r.ReviewId,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    UserName = r.User!.FirstName + " " + r.User.LastName,
                    BookTitle = r.Book!.Title,
                    CreatedDate = r.CreatedDate
                })
                .ToListAsync();
        }

        // Get Review Entity By Id
        public async Task<Review?> GetByIdAsync(int id)
        {
            return await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Book)
                .FirstOrDefaultAsync(r => r.ReviewId == id);
        }

        // Get Review Response By Id
        public async Task<ReviewResponse?> GetResponseByIdAsync(int id)
        {
            return await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Book)
                .Where(r => r.ReviewId == id)
                .Select(r => new ReviewResponse
                {
                    ReviewId = r.ReviewId,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    UserName = r.User!.FirstName + " " + r.User.LastName,
                    BookTitle = r.Book!.Title,
                    CreatedDate = r.CreatedDate
                })
                .FirstOrDefaultAsync();
        }

        // Add Review
        public async Task<Review> AddAsync(Review review)
        {
            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            return review;
        }

        // Update Review
        public async Task<Review?> UpdateAsync(Review review)
        {
            _context.Reviews.Update(review);
            await _context.SaveChangesAsync();

            return review;
        }

        // Delete Review
        public async Task<bool> DeleteAsync(Review review)
        {
            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            return true;
        }

        // Exists
        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Reviews
                .AnyAsync(r => r.ReviewId == id);
        }

        // Get Reviews By Book
        public async Task<List<ReviewResponse>> GetByBookIdAsync(int bookId)
        {
            return await _context.Reviews
                .Where(r => r.BookId == bookId)
                .Include(r => r.User)
                .Include(r => r.Book)
                .Select(r => new ReviewResponse
                {
                    ReviewId = r.ReviewId,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    UserName = r.User!.FirstName + " " + r.User.LastName,
                    BookTitle = r.Book!.Title,
                    CreatedDate = r.CreatedDate
                })
                .ToListAsync();
        }
    }
}