using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStore.Server.Models.Event
{
    public class Event
    {
        [Key]
        public int EventId { get; set; }

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

        [Column(TypeName = "decimal(18,2)")]
        public decimal EntryFee { get; set; }

        [Required]
        public int MaxSeats { get; set; }

        [Required]
        public int AvailableSeats { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedDate { get; set; }

        // Navigation Properties
        public ICollection<EventImage> EventImages { get; set; } = new List<EventImage>();

        public ICollection<EventRegistration> EventRegistrations { get; set; } = new List<EventRegistration>();
    }
}