using BookStore.Server.DTOs.Publisher;
using BookStore.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize(Roles = "Admin")]
    public class PublisherController : ControllerBase
    {
        private readonly PublisherService _service;

        public PublisherController(PublisherService service)
        {
            _service = service;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _service.GetAllAsync());
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var publisher = await _service.GetByIdAsync(id);

            if (publisher == null)
                return NotFound("Publisher not found");

            return Ok(publisher);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreatePublisherRequest request)
        {
            var result = await _service.CreateAsync(request);

            if (!result)
                return BadRequest("Publisher already exists");

            return Ok("Publisher created successfully");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdatePublisherRequest request)
        {
            var result = await _service.UpdateAsync(id, request);

            if (!result)
                return NotFound("Publisher not found");

            return Ok("Publisher updated successfully");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);

            if (!result)
                return NotFound("Publisher not found");

            return Ok("Publisher deleted successfully");
        }
    }
}