using BookStore.Server.DTOs.Payment;
using BookStore.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookStore.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class StoryPoetryPaymentController : ControllerBase
    {
        private readonly StoryPoetryPaymentService _paymentService;

        public StoryPoetryPaymentController(
            StoryPoetryPaymentService paymentService)
        {
            _paymentService = paymentService;
        }


        // =========================================================
        // GET USER ID FROM JWT
        // =========================================================

        private int GetUserId()
        {
            var userIdClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrWhiteSpace(userIdClaim))
            {
                throw new UnauthorizedAccessException(
                    "User ID not found in token.");
            }

            if (!int.TryParse(
                userIdClaim,
                out int userId))
            {
                throw new UnauthorizedAccessException(
                    "Invalid User ID in token.");
            }

            return userId;
        }


        // =========================================================
        // CREATE STORY / POETRY PAYMENT
        // =========================================================

        // POST:
        // api/StoryPoetryPayment

        [HttpPost]
        public async Task<IActionResult> CreatePayment(
            [FromBody] CreateStoryPoetryPaymentRequest request)
        {
            try
            {
                // -------------------------------------------------
                // GET USER ID FROM JWT
                // -------------------------------------------------

                int userId = GetUserId();


                // -------------------------------------------------
                // CREATE PAYMENT
                // -------------------------------------------------

                var payment =
                    await _paymentService
                        .CreatePaymentAsync(
                            request,
                            userId);


                // -------------------------------------------------
                // STORY / POETRY NOT FOUND
                // -------------------------------------------------

                if (payment == null)
                {
                    return NotFound(new
                    {
                        message =
                            "Story/Poetry submission not found."
                    });
                }


                // -------------------------------------------------
                // SUCCESS
                // -------------------------------------------------

                return Ok(new
                {
                    message =
                        "Story/Poetry payment order created successfully.",

                    data = payment
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
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }


        // =========================================================
        // VERIFY STORY / POETRY PAYMENT
        // =========================================================

        // POST:
        // api/StoryPoetryPayment/verify

        [HttpPost("verify")]
        public async Task<IActionResult> VerifyPayment(
            [FromBody] RazorpayPaymentVerificationRequest request)
        {
            try
            {
                // -------------------------------------------------
                // GET USER ID FROM JWT
                // -------------------------------------------------

                int userId = GetUserId();


                // -------------------------------------------------
                // VERIFY PAYMENT
                // -------------------------------------------------

                var payment =
                    await _paymentService
                        .VerifyPaymentAsync(
                            request,
                            userId);


                // -------------------------------------------------
                // PAYMENT NOT FOUND
                // -------------------------------------------------

                if (payment == null)
                {
                    return NotFound(new
                    {
                        message =
                            "Payment not found."
                    });
                }


                // -------------------------------------------------
                // SUCCESS
                // -------------------------------------------------

                return Ok(new
                {
                    message =
                        "Story/Poetry payment verified successfully.",

                    data = payment
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
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }
    }
}