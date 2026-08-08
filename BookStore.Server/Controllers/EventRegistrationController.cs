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


        // POST: api/EventRegistration
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


            if (result != "Event registration successful.")
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


        // GET: api/EventRegistration/MyRegistrations
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