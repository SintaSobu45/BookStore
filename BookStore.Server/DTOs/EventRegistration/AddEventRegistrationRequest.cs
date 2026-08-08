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

        // Total number of book copies requested
        // Only approved Story/Poetry contributors can request books
        [Range(0, 100)]
        public int BookCopies { get; set; } = 0;
    }
}