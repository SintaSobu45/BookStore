using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStore.Server.Models
{
    public class StoryPoetry
    {
        [Key]
        public int StoryPoetryId { get; set; }


        // =========================================================
        // USER
        // =========================================================

        // Logged-in user -> UserId has value
        // Guest -> UserId is null

        [Required]
        public int UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }


        // =========================================================
        // STORY / POETRY DETAILS
        // =========================================================

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;


        [Required]
        [StringLength(20)]
        [RegularExpression(
            "Story|Poetry|Special",
            ErrorMessage = "Type must be either Story, Poetry, or Special."
        )]
        public string Type { get; set; } = string.Empty;


        [Required]
        public string Content { get; set; } = string.Empty;


        // =========================================================
        // CONTRIBUTOR SNAPSHOT
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


        // Cloudinary image URL
        [Required]
        public string ContributorProfileImageUrl { get; set; } = string.Empty;


        // =========================================================
        // PAYMENT STATUS
        // =========================================================

        // Pending -> Payment not completed
        // Paid    -> Payment completed successfully

        [Required]
        [StringLength(30)]
        public string PaymentStatus { get; set; } = "Pending";


        // =========================================================
        // DATES
        // =========================================================

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedDate { get; set; }
    }
}