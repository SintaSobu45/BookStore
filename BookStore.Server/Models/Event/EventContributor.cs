using BookStore.Server.Models;
using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.Models.Event
{
    public class EventContributor
    {
        [Key]
        public int EventContributorId { get; set; }

        // Event
        [Required]
        public int EventId { get; set; }

        // User who is the contributor
        [Required]
        public int UserId { get; set; }

        // Approved Story/Poetry submission
        [Required]
        public int StoryPoetryId { get; set; }

        public DateTime AddedDate { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public Event? Event { get; set; }

        public User? User { get; set; }

        public StoryPoetry? StoryPoetry { get; set; }
    }
}