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

        // =========================================================
        // GET ALL REVIEWS
        // =========================================================

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

                    UserName = r.User!.Name,

                    BookTitle = r.Book!.Title,

                    CreatedDate = r.CreatedDate
                })
                .ToListAsync();
        }


        // =========================================================
        // GET REVIEW ENTITY BY ID
        // =========================================================

        public async Task<Review?> GetByIdAsync(int id)
        {
            return await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Book)
                .FirstOrDefaultAsync(
                    r => r.ReviewId == id);
        }


        // =========================================================
        // GET REVIEW RESPONSE BY ID
        // =========================================================

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

                    UserName = r.User!.Name,

                    BookTitle = r.Book!.Title,

                    CreatedDate = r.CreatedDate
                })
                .FirstOrDefaultAsync();
        }


        // =========================================================
        // ADD REVIEW
        // =========================================================

        public async Task<Review> AddAsync(Review review)
        {
            _context.Reviews.Add(review);

            await _context.SaveChangesAsync();

            return review;
        }


        // =========================================================
        // UPDATE REVIEW
        // =========================================================

        public async Task<Review?> UpdateAsync(Review review)
        {
            _context.Reviews.Update(review);

            await _context.SaveChangesAsync();

            return review;
        }


        // =========================================================
        // DELETE REVIEW
        // =========================================================

        public async Task<bool> DeleteAsync(Review review)
        {
            _context.Reviews.Remove(review);

            await _context.SaveChangesAsync();

            return true;
        }


        // =========================================================
        // EXISTS
        // =========================================================

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Reviews
                .AnyAsync(r => r.ReviewId == id);
        }


        // =========================================================
        // GET REVIEWS BY BOOK
        // =========================================================

        public async Task<List<ReviewResponse>> GetByBookIdAsync(
            int bookId)
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

                    UserName = r.User!.Name,

                    BookTitle = r.Book!.Title,

                    CreatedDate = r.CreatedDate
                })
                .ToListAsync();
        }
    }
}