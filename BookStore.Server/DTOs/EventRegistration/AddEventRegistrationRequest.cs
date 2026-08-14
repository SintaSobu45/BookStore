using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs.EventRegistration
{
    public class AddEventRegistrationRequest
    {
        [Required]
        public int EventId { get; set; }

        [Required]
        [Range(1, 10)]
        public int NumberOfSeats { get; set; }
    }
}