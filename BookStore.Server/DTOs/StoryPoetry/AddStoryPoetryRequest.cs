using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs.StoryPoetry
{
    public class AddStoryPoetryRequest
    {
        // =========================================================
        // STORY / POETRY DETAILS
        // =========================================================

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


        // =========================================================
        // CONTRIBUTOR DETAILS - MALAYALAM
        // =========================================================

        [Required]
        [StringLength(200)]
        public string ContributorNameMalayalam { get; set; } = string.Empty;


        [Required]
        [StringLength(500)]
        public string ContributorAddressMalayalam { get; set; } = string.Empty;


        [Required]
        [StringLength(100)]
        public string ContributorDistrictMalayalam { get; set; } = string.Empty;


        [Required]
        [StringLength(100)]
        public string ContributorCityMalayalam { get; set; } = string.Empty;


        // =========================================================
        // CONTACT DETAILS
        // =========================================================

        [Required]
        [EmailAddress]
        [StringLength(150)]
        public string ContributorEmail { get; set; } = string.Empty;


        [Required]
        [RegularExpression(
            @"^[6-9]\d{9}$",
            ErrorMessage = "Phone number must be 10 digits and start with 6, 7, 8, or 9."
        )]
        public string ContributorPhone { get; set; } = string.Empty;


        // =========================================================
        // CONTRIBUTOR PROFILE IMAGE
        // =========================================================

        [Required]
        public IFormFile ContributorProfileImage { get; set; } = null!;
    }
}