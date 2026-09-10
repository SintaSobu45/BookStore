using BookStore.Server.DTOs.StoryPoetryParticular;
using BookStore.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StoryPoetryParticularController : ControllerBase
    {
        private readonly StoryPoetryParticularService _service;

        public StoryPoetryParticularController(
            StoryPoetryParticularService service)
        {
            _service = service;
        }


        // =========================================================
        // ADMIN - GET ALL PARTICULARS
        // =========================================================

        [Authorize(Roles = "Admin")]
        [HttpGet("Admin")]
        public async Task<IActionResult> GetAll()
        {
            var particulars = await _service.GetAllAsync();

            return Ok(particulars);
        }


        // =========================================================
        // PUBLIC - GET ACTIVE PARTICULARS BY TYPE
        // =========================================================

        [AllowAnonymous]
        [HttpGet("Active/{type}")]
        public async Task<IActionResult> GetActiveByType(
            string type)
        {
            try
            {
                var particulars =
                    await _service.GetActiveByTypeAsync(type);

                return Ok(particulars);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }


        // =========================================================
        // ADMIN - GET PARTICULAR BY ID
        // =========================================================

        [Authorize(Roles = "Admin")]
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var particular = await _service.GetByIdAsync(id);

            if (particular == null)
            {
                return NotFound(new
                {
                    message = "Particular not found."
                });
            }

            return Ok(particular);
        }


        // =========================================================
        // ADMIN - ADD PARTICULAR
        // =========================================================

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Add(
            [FromBody] AddStoryPoetryParticularRequest request)
        {
            try
            {
                var result = await _service.AddAsync(request);

                return CreatedAtAction(
                    nameof(GetById),
                    new
                    {
                        id = result.StoryPoetryParticularId
                    },
                    result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    message = ex.Message
                });
            }
        }


        // =========================================================
        // ADMIN - DEACTIVATE PARTICULAR
        // =========================================================

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id:int}/deactivate")]
        public async Task<IActionResult> Deactivate(int id)
        {
            try
            {
                var result =
                    await _service.DeactivateAsync(id);

                if (result == null)
                {
                    return NotFound(new
                    {
                        message = "Particular not found."
                    });
                }

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    message = ex.Message
                });
            }
        }
    }
}