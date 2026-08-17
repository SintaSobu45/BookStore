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
            {
                throw new UnauthorizedAccessException(
                    "User ID not found.");
            }

            if (!int.TryParse(userIdClaim, out int userId))
            {
                throw new UnauthorizedAccessException(
                    "Invalid User ID.");
            }

            return userId;
        }


        // =========================================================
        // ADD STORY / POETRY / SPECIAL
        // =========================================================

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Add(
            [FromForm] AddStoryPoetryRequest request)
        {
            try
            {
                var userId = GetUserId();

                var result =
                    await _storyPoetryService
                        .AddAsync(request, userId);

                return Ok(new
                {
                    message =
                        "Story/Poetry submitted successfully.",

                    data = result
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new
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


        // =========================================================
        // GET MY SUBMISSIONS
        // =========================================================

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
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new
                {
                    message = ex.Message
                });
            }
        }


        // =========================================================
        // GET BY ID
        // =========================================================

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var result =
                    await _storyPoetryService
                        .GetByIdAsync(id);

                if (result == null)
                {
                    return NotFound(new
                    {
                        message =
                            "Story/Poetry not found."
                    });
                }


                // -------------------------------------------------
                // ADMIN CAN VIEW ANY SUBMISSION
                // -------------------------------------------------

                if (User.IsInRole("Admin"))
                {
                    return Ok(result);
                }


                // -------------------------------------------------
                // NORMAL USER
                // -------------------------------------------------

                var userId = GetUserId();

                if (result.UserId != userId)
                {
                    return StatusCode(403, new
                    {
                        message =
                            "You can only view your own submission."
                    });
                }

                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new
                {
                    message = ex.Message
                });
            }
        }


        // =========================================================
        // UPDATE
        // =========================================================

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
                        message =
                            "Story/Poetry not found."
                    });
                }

                return Ok(new
                {
                    message =
                        "Story/Poetry updated successfully.",

                    data = result
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new
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


        // =========================================================
        // DELETE
        // =========================================================

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var userId = GetUserId();

                var result =
                    await _storyPoetryService
                        .DeleteAsync(
                            id,
                            userId);

                if (!result)
                {
                    return NotFound(new
                    {
                        message =
                            "Story/Poetry not found."
                    });
                }

                return Ok(new
                {
                    message =
                        "Story/Poetry deleted successfully."
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new
                {
                    message = ex.Message
                });
            }
        }


        // =========================================================
        // ADMIN - GET ALL SUBMISSIONS
        // =========================================================

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