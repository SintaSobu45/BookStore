using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs.Event
{
    public class AddEventRequest
    {
        [Required]
        [StringLength(200)]
        public string EventName { get; set; } = string.Empty;

        [Required]
        [StringLength(2000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public DateTime EventDate { get; set; }

        [Required]
        [StringLength(200)]
        public string Venue { get; set; } = string.Empty;

        [Required]
        [Range(0, 100000)]
        public decimal EntryFee { get; set; }

        [Required]
        [Range(0, 100000)]
        public decimal BookPrice { get; set; }

        [Required]
        [Range(1, 10000)]
        public int MaxSeats { get; set; }

        public IFormFile? Image { get; set; }
    }
}