using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs.StoryPoetry
{
    public class AddStoryPoetryRequest
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [RegularExpression(
            "Story|Poetry",
            ErrorMessage = "Type must be either Story or Poetry."
        )]
        public string Type { get; set; } = string.Empty;

        [Required]
        [Range(1, int.MaxValue)]
        public int CategoryId { get; set; }


        [Required]
        public string Content { get; set; } = string.Empty;
    }
}