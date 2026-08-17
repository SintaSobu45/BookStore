using BookStore.Server.DTOs.EventRegistration;
using BookStore.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookStore.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EventRegistrationController : ControllerBase
    {
        private readonly EventRegistrationService _eventRegistrationService;

        public EventRegistrationController(
            EventRegistrationService eventRegistrationService)
        {
            _eventRegistrationService = eventRegistrationService;
        }


        // =========================================================
        // REGISTER FOR EVENT
        // POST: api/EventRegistration
        // LOGGED-IN USERS ONLY
        // =========================================================

        [HttpPost]
        public async Task<IActionResult> Register(
            [FromBody] AddEventRegistrationRequest request)
        {
            var userIdClaim =
                User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized(new
                {
                    Message = "User not found."
                });
            }

            int userId = int.Parse(userIdClaim.Value);


            var result =
                await _eventRegistrationService
                    .RegisterAsync(userId, request);


            // Registration is successfully created as Pending.
            // Payment must be completed separately.
            if (result !=
                "Event registration created. Please complete the payment.")
            {
                return BadRequest(new
                {
                    Message = result
                });
            }


            return Ok(new
            {
                Message = result
            });
        }


        // =========================================================
        // GET MY EVENT REGISTRATIONS
        // GET: api/EventRegistration/MyRegistrations
        // LOGGED-IN USERS ONLY
        // =========================================================

        [HttpGet("MyRegistrations")]
        public async Task<IActionResult> MyRegistrations()
        {
            var userIdClaim =
                User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized(new
                {
                    Message = "User not found."
                });
            }

            int userId = int.Parse(userIdClaim.Value);


            var registrations =
                await _eventRegistrationService
                    .GetMyRegistrationsAsync(userId);


            return Ok(registrations);
        }
    }
}