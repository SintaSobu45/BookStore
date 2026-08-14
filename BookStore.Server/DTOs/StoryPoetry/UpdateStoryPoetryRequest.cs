using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs.StoryPoetry
{
    public class UpdateStoryPoetryRequest
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [RegularExpression(
            "Story|Poetry|Special",
            ErrorMessage = "Type must be either Story, Poetry, or Special."
        )]
        public string Type { get; set; } = string.Empty;


        [Required]
        public string Content { get; set; } = string.Empty;
    }
}