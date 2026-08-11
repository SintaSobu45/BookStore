using BookStore.Server.DTOs.EventContributor;
using BookStore.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookStore.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventContributorController : ControllerBase
    {
        private readonly EventContributorService _service;

        public EventContributorController(
            EventContributorService service)
        {
            _service = service;
        }


        // =========================================================
        // ADMIN - ADD CONTRIBUTOR TO EVENT
        // =========================================================

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Add(
            AddEventContributorRequest request)
        {
            var result =
                await _service.AddAsync(request);

            if (result == "Event not found.")
            {
                return NotFound(result);
            }

            if (result ==
                "Story/Poetry submission not found.")
            {
                return NotFound(result);
            }

            if (result.Contains("Only approved"))
            {
                return BadRequest(result);
            }

            if (result.Contains("already added"))
            {
                return Conflict(result);
            }

            return Ok(new
            {
                message = result
            });
        }


        // =========================================================
        // ADMIN - GET CONTRIBUTORS OF EVENT
        // =========================================================

        [HttpGet("event/{eventId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetByEvent(
            int eventId)
        {
            var result =
                await _service
                    .GetByEventIdAsync(eventId);

            return Ok(result);
        }


        // =========================================================
        // USER - GET MY CONTRIBUTOR EVENTS
        // =========================================================

        [HttpGet("my-events")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> GetMyEvents()
        {
            var userIdClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized();
            }

            int userId =
                int.Parse(userIdClaim.Value);

            var result =
                await _service
                    .GetMyEventsAsync(userId);

            return Ok(result);
        }


        // =========================================================
        // ADMIN - REMOVE CONTRIBUTOR
        // =========================================================

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(
            int id)
        {
            var result =
                await _service.DeleteAsync(id);

            if (!result)
            {
                return NotFound(
                    "Event contributor not found.");
            }

            return Ok(new
            {
                message =
                    "Contributor removed from event successfully."
            });
        }
    }
}