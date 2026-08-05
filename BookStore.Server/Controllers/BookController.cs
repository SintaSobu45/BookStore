using BookStore.Server.DTOs.Book;
using BookStore.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize(Roles = "Admin")]
    public class BookController : ControllerBase
    {
        private readonly BookService _bookService;

        public BookController(BookService bookService)
        {
            _bookService = bookService;
        }

        // GET: api/Book
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var books = await _bookService.GetAllAsync();
            return Ok(books);
        }

        // GET: api/Book/search?keyword=harry
        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> Search(string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
                return BadRequest("Search keyword is required.");

            var books = await _bookService.SearchAsync(keyword);

            return Ok(books);
        }

        // GET: api/Book/filter
        [HttpGet("filter")]
        [AllowAnonymous]
        public async Task<IActionResult> Filter(
            int? categoryId,
            int? authorId,
            int? publisherId,
            decimal? minPrice,
            decimal? maxPrice,
            string? sortBy)
        {
            var books = await _bookService.FilterAsync(
                categoryId,
                authorId,
                publisherId,
                minPrice,
                maxPrice,
                sortBy);

            return Ok(books);
        }

        // GET: api/Book/5
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var book = await _bookService.GetByIdAsync(id);

            if (book == null)
                return NotFound("Book not found.");

            return Ok(book);
        }

        // POST: api/Book
        [HttpPost]
        public async Task<IActionResult> Add([FromForm] AddBookRequest request)
        {
            var book = await _bookService.AddAsync(request);

            return Ok(new
            {
                Message = "Book added successfully.",
                Data = book
            });
        }

        // PUT: api/Book/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] UpdateBookRequest request)
        {
            var book = await _bookService.UpdateAsync(id, request);

            if (book == null)
                return NotFound("Book not found.");

            return Ok(new
            {
                Message = "Book updated successfully.",
                Data = book
            });
        }

        // DELETE: api/Book/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _bookService.DeleteAsync(id);

            if (!result)
                return NotFound("Book not found.");

            return Ok(new
            {
                Message = "Book deleted successfully."
            });
        }
    }
}