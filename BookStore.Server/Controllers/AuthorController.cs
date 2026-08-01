using BookStore.Server.DTOs.Author;
using BookStore.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize(Roles = "Admin")]
    public class AuthorController : ControllerBase
    {
        private readonly AuthorService _service;

        public AuthorController(AuthorService service)
        {
            _service = service;
        }


        // GET: api/Author
        // Public access
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var authors = await _service.GetAllAsync();

            return Ok(authors);
        }


        // GET: api/Author/5
        // Public access
        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var author = await _service.GetByIdAsync(id);

            if (author == null)
            {
                return NotFound("Author not found");
            }

            return Ok(author);
        }


        // POST: api/Author
        // Admin only
        [HttpPost]
        public async Task<IActionResult> Create(
            CreateAuthorRequest request)
        {
            var result = await _service.CreateAsync(request);

            if (!result)
            {
                return BadRequest("Author already exists");
            }

            return Ok("Author created successfully");
        }


        // PUT: api/Author/5
        // Admin only
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            UpdateAuthorRequest request)
        {
            var result = await _service.UpdateAsync(id, request);

            if (!result)
            {
                return NotFound("Author not found");
            }

            return Ok("Author updated successfully");
        }


        // DELETE: api/Author/5
        // Admin only
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);

            if (!result)
            {
                return NotFound("Author not found");
            }

            return Ok("Author deleted successfully");
        }
    }
}