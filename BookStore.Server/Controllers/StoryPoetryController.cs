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

        // POST: api/StoryPoetry
        //
        // Login is required.
        // UserId comes from JWT.
        //
        // Content-Type:
        // multipart/form-data

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Add(
            [FromForm] AddStoryPoetryRequest request)
        {
            try
            {
                // -------------------------------------------------
                // GET LOGGED-IN USER ID FROM JWT
                // -------------------------------------------------

                var userId = GetUserId();


                // -------------------------------------------------
                // ADD STORY / POETRY
                // -------------------------------------------------

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

        // GET: api/StoryPoetry/my
        //
        // Logged-in user can see only their own submissions.

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

        // GET: api/StoryPoetry/{id}
        //
        // Admin:
        //      Can view any submission.
        //
        // Normal user:
        //      Can view only their own submission.

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
                // NORMAL LOGGED-IN USER
                // -------------------------------------------------

                var userId = GetUserId();


                // -------------------------------------------------
                // USER CAN VIEW ONLY THEIR OWN SUBMISSION
                // -------------------------------------------------

                if (result.UserId != userId)
                {
                    return Forbid();
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

        // PUT: api/StoryPoetry/{id}
        //
        // Only the logged-in owner can update.
        //
        // Contributor details and image are not updated here.

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
                return Forbid();
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

        // DELETE: api/StoryPoetry/{id}
        //
        // Only the logged-in owner can delete.

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
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }


        // =========================================================
        // ADMIN - GET ALL SUBMISSIONS
        // =========================================================

        // GET: api/StoryPoetry/admin/all
        //
        // Only Admin can access.
        //
        // Admin can see all logged-in users' submissions.

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