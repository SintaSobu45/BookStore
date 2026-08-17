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

            return int.Parse(userIdClaim);
        }


        // =========================================================
        // CREATE STORY / POETRY PAYMENT
        // POST: api/StoryPoetryPayment
        // =========================================================

        [HttpPost]
        public async Task<IActionResult> CreatePayment(
            [FromBody] CreateStoryPoetryPaymentRequest request)
        {
            try
            {
                int userId = GetUserId();

                var payment =
                    await _paymentService
                        .CreatePaymentAsync(
                            request,
                            userId);

                if (payment == null)
                {
                    return NotFound(new
                    {
                        Message =
                            "Story/Poetry submission not found."
                    });
                }

                return Ok(new
                {
                    Message =
                        "Story/Poetry payment order created successfully.",

                    Data = payment
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new
                {
                    Message = ex.Message
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
        }


        // =========================================================
        // VERIFY STORY / POETRY PAYMENT
        // POST: api/StoryPoetryPayment/verify
        // =========================================================

        [HttpPost("verify")]
        public async Task<IActionResult> VerifyPayment(
            [FromBody] RazorpayPaymentVerificationRequest request)
        {
            try
            {
                int userId = GetUserId();

                var payment =
                    await _paymentService
                        .VerifyPaymentAsync(
                            request,
                            userId);

                if (payment == null)
                {
                    return NotFound(new
                    {
                        Message =
                            "Payment not found."
                    });
                }

                return Ok(new
                {
                    Message =
                        "Story/Poetry payment verified successfully.",

                    Data = payment
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new
                {
                    Message = ex.Message
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
        }
    }
}