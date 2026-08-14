using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.Models
{
    public class StoryPoetry
    {
        [Key]
        public int StoryPoetryId { get; set; }

        // Logged-in user who submitted the story/poetry
        [Required]
        public int UserId { get; set; }

        // Story/Poetry title
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        // Story, Poetry, or Special
        [Required]
        [StringLength(20)]
        public string Type { get; set; } = string.Empty;

        // Story/Poetry/Special content
        [Required]
        public string Content { get; set; } = string.Empty;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedDate { get; set; }

        // Navigation
        public User? User { get; set; }
    }
}