using BookStore.Server.Data;
using BookStore.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PageWarningController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PageWarningController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =========================================================
        // ADMIN - GET ALL
        // =========================================================

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var warnings = await _context.PageWarnings
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync();

            return Ok(warnings);
        }

        // =========================================================
        // USER - GET ACTIVE WARNING FOR A PAGE
        // =========================================================

        [HttpGet("page/{pageName}")]
        public async Task<IActionResult> GetByPage(string pageName)
        {
            var warning = await _context.PageWarnings
                .Where(x =>
                    x.PageName == pageName &&
                    x.IsActive)
                .OrderByDescending(x => x.UpdatedDate ?? x.CreatedDate)
                .FirstOrDefaultAsync();

            if (warning == null)
                return NotFound(new
                {
                    message = "No active warning found."
                });

            return Ok(warning);
        }

        // =========================================================
        // ADMIN - CREATE
        // =========================================================

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(PageWarning warning)
        {
            if (string.IsNullOrWhiteSpace(warning.PageName))
                return BadRequest("Page name is required.");

            if (string.IsNullOrWhiteSpace(warning.Message))
                return BadRequest("Warning message is required.");

            warning.PageWarningId = 0;
            warning.CreatedDate = DateTime.UtcNow;
            warning.UpdatedDate = null;

            _context.PageWarnings.Add(warning);
            await _context.SaveChangesAsync();

            return Ok(warning);
        }

        // =========================================================
        // ADMIN - UPDATE
        // =========================================================

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(
            int id,
            PageWarning updatedWarning)
        {
            var warning = await _context.PageWarnings
                .FindAsync(id);

            if (warning == null)
                return NotFound(new
                {
                    message = "Warning not found."
                });

            if (string.IsNullOrWhiteSpace(updatedWarning.PageName))
                return BadRequest("Page name is required.");

            if (string.IsNullOrWhiteSpace(updatedWarning.Message))
                return BadRequest("Warning message is required.");

            warning.PageName = updatedWarning.PageName;
            warning.Message = updatedWarning.Message;
            warning.IsActive = updatedWarning.IsActive;
            warning.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(warning);
        }

        // =========================================================
        // ADMIN - DELETE
        // =========================================================

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var warning = await _context.PageWarnings
                .FindAsync(id);

            if (warning == null)
                return NotFound(new
                {
                    message = "Warning not found."
                });

            _context.PageWarnings.Remove(warning);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Warning deleted successfully."
            });
        }

        // =========================================================
        // ADMIN - TOGGLE ACTIVE STATUS
        // =========================================================

        [HttpPatch("{id}/toggle")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            var warning = await _context.PageWarnings
                .FindAsync(id);

            if (warning == null)
                return NotFound(new
                {
                    message = "Warning not found."
                });

            warning.IsActive = !warning.IsActive;
            warning.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                warning.PageWarningId,
                warning.IsActive
            });
        }
    }
}