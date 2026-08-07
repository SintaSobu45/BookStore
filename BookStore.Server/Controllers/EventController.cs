using BookStore.Server.DTOs.Event;
using BookStore.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize(Roles = "Admin")]
    public class EventController : ControllerBase
    {
        private readonly EventService _eventService;

        public EventController(EventService eventService)
        {
            _eventService = eventService;
        }

        // GET: api/Event
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var events = await _eventService.GetAllAsync();
            return Ok(events);
        }

        // GET: api/Event/5
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var eventItem = await _eventService.GetByIdAsync(id);

            if (eventItem == null)
                return NotFound("Event not found.");

            return Ok(eventItem);
        }

        // POST: api/Event
        [HttpPost]
        public async Task<IActionResult> Add([FromForm] AddEventRequest request)
        {
            var eventItem = await _eventService.AddAsync(request);

            return Ok(new
            {
                Message = "Event added successfully.",
                Data = eventItem
            });
        }

        // PUT: api/Event/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] UpdateEventRequest request)
        {
            var eventItem = await _eventService.UpdateAsync(id, request);

            if (eventItem == null)
                return NotFound("Event not found.");

            return Ok(new
            {
                Message = "Event updated successfully.",
                Data = eventItem
            });
        }

        // DELETE: api/Event/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _eventService.DeleteAsync(id);

            if (!result)
                return NotFound("Event not found.");

            return Ok(new
            {
                Message = "Event deleted successfully."
            });
        }
    }
}