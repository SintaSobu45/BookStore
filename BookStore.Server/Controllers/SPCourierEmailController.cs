using BookStore.Server.DTOs.SPCourierEmail;
using BookStore.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin,Editor")]
    public class SPCourierEmailController : ControllerBase
    {
        private readonly SPCourierEmailService _service;

        public SPCourierEmailController(SPCourierEmailService service)
        {
            _service = service;
        }

        [HttpPost("send-email")]
        public async Task<IActionResult> SendEmail(
            [FromBody] SendSPCourierEmailRequest request)
        {
            try
            {
                if (request.UserId <= 0)
                {
                    return BadRequest(new
                    {
                        message = "Invalid user ID."
                    });
                }

                if (request.EventId <= 0)
                {
                    return BadRequest(new
                    {
                        message = "Invalid event ID."
                    });
                }

                var result = await _service.SendCourierEmailAsync(
                    request.UserId,
                    request.EventId);

                if (!result)
                {
                    return BadRequest(new
                    {
                        message = "Email was not sent because the contributor attended the selected event."
                    });
                }

                return Ok(new
                {
                    message = "Courier email sent successfully."
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new
                {
                    message = "An error occurred while sending the courier email."
                });
            }
        }
    }
}