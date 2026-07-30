using BookStore.Server.DTOs.Category;
using BookStore.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class CategoryController : ControllerBase
    {
        private readonly CategoryService _service;

        public CategoryController(CategoryService service)
        {
            _service = service;
        }


        // GET: api/Category
        // Public access
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _service.GetAllAsync();

            return Ok(categories);
        }


        // GET: api/Category/5
        // Public access
        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var category = await _service.GetByIdAsync(id);

            if (category == null)
            {
                return NotFound("Category not found");
            }

            return Ok(category);
        }


        // POST: api/Category
        // Admin only
        [HttpPost]
        public async Task<IActionResult> Create(
            CreateCategoryRequest request)
        {
            var result = await _service.CreateAsync(request);

            if (!result)
            {
                return BadRequest("Category already exists");
            }

            return Ok("Category created successfully");
        }


        // PUT: api/Category/5
        // Admin only
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            UpdateCategoryRequest request)
        {
            var result = await _service.UpdateAsync(id, request);

            if (!result)
            {
                return NotFound("Category not found");
            }

            return Ok("Category updated successfully");
        }


        // DELETE: api/Category/5
        // Admin only
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);

            if (!result)
            {
                return NotFound("Category not found");
            }

            return Ok("Category deleted successfully");
        }
    }
}