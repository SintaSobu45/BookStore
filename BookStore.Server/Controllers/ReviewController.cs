using BookStore.Server.DTOs.Review;
using BookStore.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize]
    public class ReviewController : ControllerBase
    {
        private readonly ReviewService _reviewService;

        public ReviewController(ReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        // GET: api/Review
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var reviews = await _reviewService.GetAllAsync();
            return Ok(reviews);
        }

        // GET: api/Review/5
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var review = await _reviewService.GetByIdAsync(id);

            if (review == null)
                return NotFound("Review not found.");

            return Ok(review);
        }

        // GET: api/Review/book/1
        [HttpGet("book/{bookId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByBookId(int bookId)
        {
            var reviews = await _reviewService.GetByBookIdAsync(bookId);
            return Ok(reviews);
        }

        // POST: api/Review
        [HttpPost]
        public async Task<IActionResult> Add(AddReviewRequest request)
        {
            var review = await _reviewService.AddAsync(request);

            return Ok(new
            {
                Message = "Review added successfully.",
                Data = review
            });
        }

        // PUT: api/Review/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateReviewRequest request)
        {
            var review = await _reviewService.UpdateAsync(id, request);

            if (review == null)
                return NotFound("Review not found.");

            return Ok(new
            {
                Message = "Review updated successfully.",
                Data = review
            });
        }

        // DELETE: api/Review/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _reviewService.DeleteAsync(id);

            if (!result)
                return NotFound("Review not found.");

            return Ok(new
            {
                Message = "Review deleted successfully."
            });
        }
    }
}