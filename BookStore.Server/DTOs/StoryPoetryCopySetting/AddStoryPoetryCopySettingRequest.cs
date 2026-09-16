using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs.StoryPoetryCopySetting
{
    public class AddStoryPoetryCopySettingRequest
    {
        [Required]
        [RegularExpression(
            "Story|Poetry|Special",
            ErrorMessage = "Type must be either Story, Poetry, or Special."
        )]
        public string Type { get; set; } = string.Empty;

        [Range(0, int.MaxValue, ErrorMessage = "Free copies cannot be negative.")]
        public int FreeCopies { get; set; }
    }
}