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


        //report
        [HttpGet("event-report")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetEventReport(
    [FromQuery] DateTime? fromDate,
    [FromQuery] DateTime? toDate)
        {
            if (fromDate.HasValue &&
                toDate.HasValue &&
                fromDate.Value.Date > toDate.Value.Date)
            {
                return BadRequest(new
                {
                    message = "From date cannot be later than To date."
                });
            }

            var result = await _storyPoetryService.GetEventReportAsync(
                fromDate,
                toDate);

            return Ok(result);
        }


        // =========================================================
        // USER - ADD STORY / POETRY / SPECIAL
        // =========================================================

        [Authorize(Roles = "User")]
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


        // =========================================================
        // USER - GET MY SUBMISSIONS
        // =========================================================

        [Authorize(Roles = "User")]
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
        // ADMIN + EDITOR - GET SUBMISSION BY ID
        // USER - GET OWN SUBMISSION
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

                // ADMIN + EDITOR
                // Can view any submission
                if (User.IsInRole("Admin") ||
                    User.IsInRole("Editor"))
                {
                    return Ok(result);
                }

                // NORMAL USER
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
        // USER - UPDATE OWN SUBMISSION
        // =========================================================

        [Authorize(Roles = "User")]
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
        // USER - DELETE OWN SUBMISSION
        // =========================================================

        [Authorize(Roles = "User")]
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
        // ADMIN + EDITOR - GET ALL SUBMISSIONS
        // =========================================================

        [Authorize(Roles = "Admin,Editor")]
        [HttpGet("admin/all")]
        public async Task<IActionResult> GetAll()
        {
            var result =
                await _storyPoetryService
                    .GetAllAsync();

            return Ok(result);
        }

        // =========================================================
        // ADMIN + EDITOR - UPDATE BARCODE
        // =========================================================

        [Authorize(Roles = "Admin,Editor")]
        [HttpPatch("{id}/barcode")]
        public async Task<IActionResult> UpdateBarcode(
            int id,
            [FromBody] UpdateStoryPoetryBarcodeRequest request)
        {
            try
            {
                var result =
                    await _storyPoetryService
                        .UpdateBarcodeAsync(
                            id,
                            request.Barcode);

                if (result == null)
                {
                    return NotFound(new
                    {
                        message =
                            "Story/Poetry submission not found."
                    });
                }

                return Ok(new
                {
                    message =
                        "Barcode updated successfully.",
                    data = result
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
        // UPDATE SP ORDER STATUS
        // =========================================================

        [Authorize(Roles = "Admin,Editor")]
        [HttpPatch("{id}/order-status")]
        public async Task<IActionResult> UpdateSpOrderStatus(
            int id,
            [FromBody] UpdateStoryPoetryOrderStatusRequest request)
        {
            try
            {
                var result =
                    await _storyPoetryService
                        .UpdateSpOrderStatusAsync(
                            id,
                            request.Status);

                if (result == null)
                {
                    return NotFound(new
                    {
                        message =
                            "Story/Poetry submission not found."
                    });
                }

                return Ok(new
                {
                    message =
                        "SP Order Status updated successfully.",
                    data = result
                });
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
    }
}