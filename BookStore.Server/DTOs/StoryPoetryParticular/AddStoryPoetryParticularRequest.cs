using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs.StoryPoetryParticular
{
    public class AddStoryPoetryParticularRequest
    {
        [Required]
        [StringLength(20)]
        [RegularExpression(
            "Story|Poetry|Special",
            ErrorMessage = "Type must be either Story, Poetry, or Special."
        )]
        public string Type { get; set; } = string.Empty;


        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;


        [Range(
            0,
            double.MaxValue,
            ErrorMessage = "Extra copy price cannot be negative."
        )]
        public decimal ExtraCopyPrice { get; set; }
    }
}