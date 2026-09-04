using BookStore.Server.DTOs.PromotionBanner;
using BookStore.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PromotionBannerController : ControllerBase
    {
        private readonly PromotionBannerService _service;

        public PromotionBannerController(PromotionBannerService service)
        {
            _service = service;
        }


        // =========================================================
        // GET ALL BANNERS - ADMIN
        // =========================================================

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var banners = await _service.GetAllAsync();

            return Ok(banners);
        }


        // =========================================================
        // GET ACTIVE BANNERS - USER / PUBLIC
        // =========================================================

        [HttpGet("active")]
        [AllowAnonymous]
        public async Task<IActionResult> GetActive()
        {
            var banners = await _service.GetActiveAsync();

            return Ok(banners);
        }


        // =========================================================
        // GET BANNER BY ID - ADMIN
        // =========================================================

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetById(int id)
        {
            var banner = await _service.GetByIdAsync(id);

            if (banner == null)
                return NotFound(new
                {
                    message = "Promotion banner not found."
                });

            return Ok(banner);
        }


        // =========================================================
        // CREATE BANNER - ADMIN
        // =========================================================

        [HttpPost]
        [Authorize(Roles = "Admin")]
        [RequestSizeLimit(20 * 1024 * 1024)]
        public async Task<IActionResult> Create(
            [FromForm] AddPromotionBannerRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _service.CreateAsync(request);

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
                data = result.Data
            });
        }


        // =========================================================
        // UPDATE BANNER - ADMIN
        // =========================================================

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        [RequestSizeLimit(20 * 1024 * 1024)]
        public async Task<IActionResult> Update(
            int id,
            [FromForm] UpdatePromotionBannerRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _service.UpdateAsync(id, request);

            if (!result.Success)
            {
                if (result.Message == "Promotion banner not found.")
                {
                    return NotFound(new
                    {
                        message = result.Message
                    });
                }

                return BadRequest(new
                {
                    message = result.Message
                });
            }

            return Ok(new
            {
                message = result.Message,
                data = result.Data
            });
        }


        // =========================================================
        // DELETE BANNER - ADMIN
        // =========================================================

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);

            if (!result.Success)
            {
                return NotFound(new
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