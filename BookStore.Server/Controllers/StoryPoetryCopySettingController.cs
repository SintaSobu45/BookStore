using BookStore.Server.DTOs.StoryPoetryCopySetting;
using BookStore.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class StoryPoetryCopySettingController : ControllerBase
    {
        private readonly StoryPoetryCopySettingService _service;

        public StoryPoetryCopySettingController(
            StoryPoetryCopySettingService service)
        {
            _service = service;
        }

        // GET: api/StoryPoetryCopySetting
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var settings = await _service.GetAllAsync();

            return Ok(settings);
        }

        // GET: api/StoryPoetryCopySetting/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var setting = await _service.GetByIdAsync(id);

            if (setting == null)
            {
                return NotFound(new
                {
                    message = "Copy setting not found."
                });
            }

            return Ok(setting);
        }

        // GET: api/StoryPoetryCopySetting/type/Story
        [HttpGet("type/{type}")]
        public async Task<IActionResult> GetByType(string type)
        {
            try
            {
                var setting = await _service.GetByTypeAsync(type);

                if (setting == null)
                {
                    return NotFound(new
                    {
                        message = $"Copy setting not found for type '{type}'."
                    });
                }

                return Ok(setting);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        // POST: api/StoryPoetryCopySetting
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Add(
            [FromBody] AddStoryPoetryCopySettingRequest request)
        {
            try
            {
                var result = await _service.AddAsync(request);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = result.StoryPoetryCopySettingId },
                    result);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    message = ex.Message
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        // PUT: api/StoryPoetryCopySetting/1
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] UpdateStoryPoetryCopySettingRequest request)
        {
            try
            {
                var result = await _service.UpdateAsync(id, request);

                if (result == null)
                {
                    return NotFound(new
                    {
                        message = "Copy setting not found."
                    });
                }

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }
    }
}