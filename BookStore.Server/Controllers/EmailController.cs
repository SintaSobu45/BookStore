using BookStore.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmailController : ControllerBase
    {
        private readonly EmailService _emailService;

        public EmailController(EmailService emailService)
        {
            _emailService = emailService;
        }

        [HttpPost("test")]
        public async Task<IActionResult> SendTestEmail()
        {
            var testEmail = "sintaone8@gmail.com";

            await _emailService.SendEmailAsync(
                testEmail,
                "BookStore Email Test",
                "<h2>Email Test Successful</h2><p>Gmail SMTP is working correctly.</p>"
            );

            return Ok("Test email sent successfully.");
        }
    }
}