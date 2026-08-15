using BookStore.Server.DTOs.Payment;
using BookStore.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly PaymentService _paymentService;

        public PaymentController(PaymentService paymentService)
        {
            _paymentService = paymentService;
        }


        // =========================================================
        // GET: api/Payment
        // ADMIN ONLY
        // =========================================================

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var payments =
                await _paymentService.GetAllAsync();

            return Ok(payments);
        }


        // =========================================================
        // GET: api/Payment/5
        // LOGGED-IN USERS
        // =========================================================

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            var payment =
                await _paymentService.GetByIdAsync(id);

            if (payment == null)
            {
                return NotFound(new
                {
                    message = "Payment not found."
                });
            }

            return Ok(payment);
        }


        // =========================================================
        // POST: api/Payment/event
        // CREATE RAZORPAY ORDER FOR EVENT
        // =========================================================

        [HttpPost("event")]
        [Authorize]
        public async Task<IActionResult> CreateEventPayment(
            [FromBody] CreateEventPaymentRequest request)
        {
            try
            {
                var payment =
                    await _paymentService
                        .CreateEventPaymentAsync(request);

                if (payment == null)
                {
                    return NotFound(new
                    {
                        message = "Event registration not found."
                    });
                }

                return Ok(payment);
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
        // POST: api/Payment/verify
        // VERIFY RAZORPAY PAYMENT
        // =========================================================

        [HttpPost("verify")]
        [Authorize]
        public async Task<IActionResult> VerifyPayment(
            [FromBody] RazorpayPaymentVerificationRequest request)
        {
            try
            {
                var payment =
                    await _paymentService
                        .VerifyRazorpayPaymentAsync(request);

                if (payment == null)
                {
                    return NotFound(new
                    {
                        message = "Payment not found."
                    });
                }

                return Ok(payment);
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