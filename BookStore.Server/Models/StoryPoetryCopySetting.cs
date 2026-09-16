using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.Models
{
    public class StoryPoetryCopySetting
    {
        [Key]
        public int StoryPoetryCopySettingId { get; set; }

        [Required]
        [StringLength(20)]
        [RegularExpression(
            "Story|Poetry|Special",
            ErrorMessage = "Type must be either Story, Poetry, or Special."
        )]
        public string Type { get; set; } = string.Empty;

        [Range(0, int.MaxValue, ErrorMessage = "Free copies cannot be negative.")]
        public int FreeCopies { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedDate { get; set; }
    }
}