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

        // GET: api/Payment
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var payments = await _paymentService.GetAllAsync();

            return Ok(payments);
        }

        // GET: api/Payment/5
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            var payment = await _paymentService.GetByIdAsync(id);

            if (payment == null)
                return NotFound(new
                {
                    message = "Payment not found."
                });

            return Ok(payment);
        }

        // POST: api/Payment
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create(
            [FromBody] CreatePaymentDto request)
        {
            var payment = await _paymentService.CreateAsync(request);

            return CreatedAtAction(
                nameof(GetById),
                new { id = payment.PaymentId },
                payment);
        }

        // PUT: api/Payment/5/paid
        [HttpPut("{id}/paid")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> MarkAsPaid(int id)
        {
            var payment = await _paymentService.MarkAsPaidAsync(id);

            if (payment == null)
                return NotFound(new
                {
                    message = "Payment not found."
                });

            return Ok(payment);
        }
    }
}