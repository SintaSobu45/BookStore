using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStore.Server.Models
{
    public class StoryPoetry
    {
        [Key]
        public int StoryPoetryId { get; set; }

        // User who submitted the story/poetry
        [Required]
        public int UserId { get; set; }

        // Story/Poetry title
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        // Story or Poetry
        [Required]
        [StringLength(20)]
        public string Type { get; set; } = string.Empty;

        // Category
        [Required]
        public int CategoryId { get; set; }

        [ForeignKey(nameof(CategoryId))]
        public Category? Category { get; set; }


        // User can type or copy-paste the content
        [Required]
        public string Content { get; set; } = string.Empty;

        // Admin approval status
        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "Pending";

        // Admin approval/rejection date
        public DateTime? ReviewedDate { get; set; }

        // Optional admin remarks
        [StringLength(1000)]
        public string? AdminRemarks { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedDate { get; set; }

        // Navigation
        public User? User { get; set; }
    }
}