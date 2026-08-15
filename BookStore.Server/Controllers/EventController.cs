using BookStore.Server.DTOs.Event;
using BookStore.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventController : ControllerBase
    {
        private readonly EventService _eventService;

        public EventController(EventService eventService)
        {
            _eventService = eventService;
        }


        // =========================================================
        // GET ALL EVENTS
        // Anyone can view events
        // =========================================================

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var events =
                await _eventService.GetAllAsync();

            return Ok(events);
        }


        // =========================================================
        // GET EVENT BY ID
        // Anyone can view event details
        // =========================================================

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var eventItem =
                await _eventService
                    .GetByIdAsync(id);

            if (eventItem == null)
            {
                return NotFound(new
                {
                    Message = "Event not found."
                });
            }

            return Ok(eventItem);
        }


        // =========================================================
        // ADD EVENT
        // ADMIN ONLY
        // =========================================================

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Add(
            [FromForm] AddEventRequest request)
        {
            var eventItem =
                await _eventService
                    .AddAsync(request);

            return Ok(new
            {
                Message =
                    "Event added successfully.",

                Data = eventItem
            });
        }


        // =========================================================
        // UPDATE EVENT
        // ADMIN ONLY
        // =========================================================

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(
            int id,
            [FromForm] UpdateEventRequest request)
        {
            try
            {
                var eventItem =
                    await _eventService
                        .UpdateAsync(id, request);


                if (eventItem == null)
                {
                    return NotFound(new
                    {
                        Message = "Event not found."
                    });
                }


                return Ok(new
                {
                    Message =
                        "Event updated successfully.",

                    Data = eventItem
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
        // DELETE EVENT
        // ADMIN ONLY
        // =========================================================

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var result =
                await _eventService
                    .DeleteAsync(id);


            if (!result)
            {
                return NotFound(new
                {
                    Message = "Event not found."
                });
            }


            return Ok(new
            {
                Message =
                    "Event deleted successfully."
            });
        }
    }
}