using BookStore.Server.Data;
using BookStore.Server.Models;
using BookStore.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LogoController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly FtpImageService _ftpImageService;

        public LogoController(
            ApplicationDbContext context,
            FtpImageService ftpImageService)
        {
            _context = context;
            _ftpImageService = ftpImageService;
        }

        // =========================================================
        // GET CURRENT LOGO
        // =========================================================

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetLogo()
        {
            var logo = await _context.Logos
                .Where(x => x.IsActive)
                .OrderByDescending(x => x.LogoId)
                .FirstOrDefaultAsync();

            if (logo == null)
            {
                return NotFound(new
                {
                    message = "Logo not found."
                });
            }

            return Ok(logo);
        }


        // =========================================================
        // ADD LOGO
        // =========================================================

        [HttpPost]
        [Authorize(Roles = "Admin")]
        [RequestSizeLimit(20 * 1024 * 1024)]
        public async Task<IActionResult> AddLogo(
            IFormFile image)
        {
            if (image == null || image.Length == 0)
            {
                return BadRequest(new
                {
                    message = "Logo image is required."
                });
            }

            // Only one active logo is allowed
            var existingLogo = await _context.Logos
                .Where(x => x.IsActive)
                .FirstOrDefaultAsync();

            if (existingLogo != null)
            {
                return BadRequest(new
                {
                    message = "A logo already exists. Use the replace endpoint."
                });
            }

            // Upload image to FTP
            var imageUrl =
                await _ftpImageService.UploadImageAsync(image);

            if (string.IsNullOrWhiteSpace(imageUrl))
            {
                return BadRequest(new
                {
                    message = "Logo upload failed."
                });
            }

            var logo = new Logo
            {
                ImageUrl = imageUrl,
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };

            _context.Logos.Add(logo);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Logo added successfully.",
                logo
            });
        }


        // =========================================================
        // REPLACE LOGO
        // =========================================================

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        [RequestSizeLimit(20 * 1024 * 1024)]
        public async Task<IActionResult> ReplaceLogo(
            int id,
            IFormFile image)
        {
            if (image == null || image.Length == 0)
            {
                return BadRequest(new
                {
                    message = "New logo image is required."
                });
            }

            var logo = await _context.Logos
                .FirstOrDefaultAsync(x => x.LogoId == id);

            if (logo == null)
            {
                return NotFound(new
                {
                    message = "Logo not found."
                });
            }

            // Upload new image to FTP
            var newImageUrl =
                await _ftpImageService.UploadImageAsync(image);

            if (string.IsNullOrWhiteSpace(newImageUrl))
            {
                return BadRequest(new
                {
                    message = "New logo upload failed."
                });
            }

            // Replace the database URL
            logo.ImageUrl = newImageUrl;
            logo.IsActive = true;
            logo.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Logo replaced successfully.",
                logo
            });
        }
    }
}