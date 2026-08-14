using BookStore.Server.DTOs.StoryPoetry;
using BookStore.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookStore.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class StoryPoetryController : ControllerBase
    {
        private readonly StoryPoetryService _storyPoetryService;

        public StoryPoetryController(
            StoryPoetryService storyPoetryService)
        {
            _storyPoetryService = storyPoetryService;
        }


        // =========================================================
        // GET USER ID FROM JWT
        // =========================================================

        private int GetUserId()
        {
            var userIdClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                throw new UnauthorizedAccessException(
                    "User ID not found.");

            return int.Parse(userIdClaim);
        }


        // =========================================================
        // USER
        // =========================================================

        // POST: api/StoryPoetry
        // Add Story / Poetry
        [HttpPost]
        public async Task<IActionResult> Add(
            [FromBody] AddStoryPoetryRequest request)
        {
            try
            {
                var userId = GetUserId();

                var result =
                    await _storyPoetryService
                        .AddAsync(request, userId);

                return Ok(new
                {
                    message = "Story/Poetry submitted successfully.",
                    data = result
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new
                {
                    message = "User ID not found."
                });
            }
        }


        // GET: api/StoryPoetry/my
        // Get My Story / Poetry
        [HttpGet("my")]
        public async Task<IActionResult> GetMy()
        {
            try
            {
                var userId = GetUserId();

                var result =
                    await _storyPoetryService
                        .GetMyAsync(userId);

                return Ok(result);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new
                {
                    message = "User ID not found."
                });
            }
        }


        // GET: api/StoryPoetry/{id}
        // Get Story / Poetry by Id
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var userId = GetUserId();

                var result =
                    await _storyPoetryService
                        .GetByIdAsync(id);

                if (result == null)
                {
                    return NotFound(new
                    {
                        message = "Story/Poetry not found."
                    });
                }


                // Admin can view any submission
                if (User.IsInRole("Admin"))
                {
                    return Ok(result);
                }


                // Normal user can view only own submission
                if (result.UserId != userId)
                {
                    return Forbid();
                }


                return Ok(result);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new
                {
                    message = "User ID not found."
                });
            }
        }


        // PUT: api/StoryPoetry/{id}
        // Update My Story / Poetry
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] UpdateStoryPoetryRequest request)
        {
            try
            {
                var userId = GetUserId();

                var result =
                    await _storyPoetryService
                        .UpdateAsync(
                            id,
                            request,
                            userId);

                if (result == null)
                {
                    return NotFound(new
                    {
                        message = "Story/Poetry not found."
                    });
                }


                return Ok(new
                {
                    message = "Story/Poetry updated successfully.",
                    data = result
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }


        // DELETE: api/StoryPoetry/{id}
        // Delete My Story / Poetry
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var userId = GetUserId();

                var result =
                    await _storyPoetryService
                        .DeleteAsync(id, userId);

                if (!result)
                {
                    return NotFound(new
                    {
                        message = "Story/Poetry not found."
                    });
                }


                return Ok(new
                {
                    message =
                        "Story/Poetry deleted successfully."
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }


        // =========================================================
        // ADMIN
        // =========================================================

        // GET: api/StoryPoetry/admin/all
        // Get All Story / Poetry
        [HttpGet("admin/all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var result =
                await _storyPoetryService
                    .GetAllAsync();

            return Ok(result);
        }
    }
}