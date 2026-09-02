using BookStore.Server.DTOs.PaymentSettings;
using BookStore.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class PaymentSettingsController : ControllerBase
    {
        private readonly PaymentSettingsService _paymentSettingsService;

        public PaymentSettingsController(
            PaymentSettingsService paymentSettingsService)
        {
            _paymentSettingsService = paymentSettingsService;
        }


        // =========================================================
        // GET ALL PAYMENT SETTINGS
        // GET: api/PaymentSettings
        // ADMIN ONLY
        // =========================================================

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var settings =
                await _paymentSettingsService.GetAllAsync();

            return Ok(settings);
        }


        // =========================================================
        // GET ACTIVE PAYMENT SETTING
        // GET: api/PaymentSettings/StoryPoetry
        // ADMIN ONLY
        // =========================================================

        [HttpGet("{paymentType}")]
        public async Task<IActionResult> GetActive(
            string paymentType)
        {
            var setting =
                await _paymentSettingsService
                    .GetActiveAsync(paymentType);

            if (setting == null)
            {
                return NotFound(new
                {
                    Message = "Active payment setting not found."
                });
            }

            return Ok(setting);
        }


        // =========================================================
        // ADD PAYMENT SETTING
        // POST: api/PaymentSettings
        // ADMIN ONLY
        // =========================================================

        [HttpPost]
        public async Task<IActionResult> Add(
            [FromBody] AddPaymentSettingsRequest request)
        {
            try
            {
                var setting =
                    await _paymentSettingsService
                        .AddAsync(
                            request.PaymentType,
                            request.Amount);

                return Ok(new
                {
                    Message =
                        "Payment setting added successfully.",

                    Data = setting
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
        }


        // =========================================================
        // UPDATE PAYMENT AMOUNT
        // PUT: api/PaymentSettings/5
        // ADMIN ONLY
        // =========================================================

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
      int id,
      [FromBody] UpdatePaymentSettingsRequest request)
        {
            try
            {
                var setting =
                    await _paymentSettingsService.UpdateAsync(
                        id,
                        request.Amount);

                if (setting == null)
                {
                    return NotFound(new
                    {
                        Message = "Payment setting not found."
                    });
                }

                return Ok(new
                {
                    Message = "Payment amount updated successfully.",
                    Data = setting
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
        }
    }
}