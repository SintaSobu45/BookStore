using BookStore.Server.DTOs.BookPayment;
using BookStore.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookStore.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookPaymentController : ControllerBase
    {
        private readonly BookPaymentService _bookPaymentService;

        public BookPaymentController(
            BookPaymentService bookPaymentService)
        {
            _bookPaymentService = bookPaymentService;
        }


        // =========================================================
        // CREATE BOOK PAYMENT
        // =========================================================

        [HttpPost("create")]
        [AllowAnonymous]
        public async Task<IActionResult> CreatePayment(
            [FromBody] CreateBookPaymentRequest request)
        {
            int? userId = null;

            // Logged-in user
            if (User.Identity?.IsAuthenticated == true)
            {
                var userIdClaim =
                    User.FindFirst(ClaimTypes.NameIdentifier);

                if (userIdClaim != null &&
                    int.TryParse(userIdClaim.Value, out int parsedUserId))
                {
                    userId = parsedUserId;
                }
            }

            var result = await _bookPaymentService
                .CreatePaymentAsync(request, userId);

            if (!result.Success)
            {
                return BadRequest(new
                {
                    message = result.Message
                });
            }

            return Ok(new
            {
                message = result.Message,
                bookPaymentId = result.Payment!.BookPaymentId,
                orderId = result.Payment.OrderId,
                amount = result.Payment.Amount,
                status = result.Payment.Status,
                razorpayOrderId = result.Payment.RazorpayOrderId,
                paymentType = result.Payment.PaymentType
            });
        }


        // =========================================================
        // VERIFY BOOK PAYMENT
        // =========================================================

        [HttpPost("verify")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyPayment(
            [FromBody] VerifyBookPaymentRequest request)
        {
            var result = await _bookPaymentService
                .VerifyPaymentAsync(request);

            if (!result.Success)
            {
                return BadRequest(new
                {
                    message = result.Message
                });
            }

            return Ok(new
            {
                message = result.Message
            });
        }
    }
}