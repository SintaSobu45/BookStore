using BookStore.Server.DTOs.Review;
using BookStore.Server.Models;
using BookStore.Server.Repositories;

namespace BookStore.Server.Services
{
    public class ReviewService
    {
        private readonly ReviewRepository _reviewRepository;

        public ReviewService(ReviewRepository reviewRepository)
        {
            _reviewRepository = reviewRepository;
        }

        // Get All Reviews
        public async Task<List<ReviewResponse>> GetAllAsync()
        {
            return await _reviewRepository.GetAllAsync();
        }

        // Get Review By Id
        public async Task<ReviewResponse?> GetByIdAsync(int id)
        {
            return await _reviewRepository.GetResponseByIdAsync(id);
        }

        // Get Reviews By Book
        public async Task<List<ReviewResponse>> GetByBookIdAsync(int bookId)
        {
            return await _reviewRepository.GetByBookIdAsync(bookId);
        }

        // Add Review
        public async Task<ReviewResponse?> AddAsync(AddReviewRequest request)
        {
            var review = new Review
            {
                Rating = request.Rating,
                Comment = request.Comment,
                BookId = request.BookId,
                UserId = request.UserId,
                CreatedDate = DateTime.UtcNow
            };

            review = await _reviewRepository.AddAsync(review);

            return await _reviewRepository.GetResponseByIdAsync(review.ReviewId);
        }

        // Update Review
        public async Task<ReviewResponse?> UpdateAsync(int id, UpdateReviewRequest request)
        {
            var review = await _reviewRepository.GetByIdAsync(id);

            if (review == null)
                return null;

            review.Rating = request.Rating;
            review.Comment = request.Comment;
            review.BookId = request.BookId;
            review.UserId = request.UserId;
            review.UpdatedDate = DateTime.UtcNow;

            await _reviewRepository.UpdateAsync(review);

            return await _reviewRepository.GetResponseByIdAsync(review.ReviewId);
        }

        // Delete Review
        public async Task<bool> DeleteAsync(int id)
        {
            var review = await _reviewRepository.GetByIdAsync(id);

            if (review == null)
                return false;

            return await _reviewRepository.DeleteAsync(review);
        }
    }
}