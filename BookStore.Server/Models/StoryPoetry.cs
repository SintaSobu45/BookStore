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

        [Required]
        public int UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }

        public Certificate? Certificate { get; set; }


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
        // STORY / POETRY PARTICULAR
        // =========================================================

        [Required]
        public int StoryPoetryParticularId { get; set; }

        [ForeignKey(nameof(StoryPoetryParticularId))]
        public StoryPoetryParticular? StoryPoetryParticular { get; set; }


        // Historical snapshot of the particular name.
        // If admin changes the particular name later,
        // old submissions will still keep the original name.

        [Required]
        [StringLength(200)]
        public string ParticularNameSnapshot { get; set; } = string.Empty;


        // =========================================================
        // CONTRIBUTOR SNAPSHOT
        // =========================================================

        [Required]
        [StringLength(200)]
        public string ContributorNameMalayalam { get; set; } = string.Empty;


        [StringLength(500)]
        public string? ContributorAddressMalayalam { get; set; }


        [Required]
        [StringLength(500)]
        public string ContributorAddress { get; set; } = string.Empty;


        [Required]
        [StringLength(6)]
        [RegularExpression(
            @"^\d{6}$",
            ErrorMessage = "Pincode must be exactly 6 digits."
        )]
        public string ContributorPincode { get; set; } = string.Empty;


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


        // FTP image public URL
        [Required]
        public string ContributorProfileImageUrl { get; set; } = string.Empty;


        // =========================================================
        // PAYMENT / COPY SNAPSHOT
        // =========================================================

        // Base price taken from PaymentSettings based on Type
        // Example: Poetry = ₹600

        [Column(TypeName = "decimal(18,2)")]
        public decimal BaseAmount { get; set; }


        // Number of additional copies requested by the user

        public int ExtraCopies { get; set; }


        // Fixed free copies provided for every submission
        // Business rule: 2 free copies
        public int FreeCopies { get; set; }


        // Extra copy price at the time of payment

        [Column(TypeName = "decimal(18,2)")]
        public decimal ExtraCopyPrice { get; set; }


        // FreeCopies + ExtraCopies

        public int TotalCopies { get; set; }


        // Final amount actually paid

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }


        // =========================================================
        // PAYMENT STATUS
        // =========================================================

        // Pending -> Payment not completed
        // Paid    -> Payment completed successfully

        [Required]
        [StringLength(30)]
        public string PaymentStatus { get; set; } = "Pending";


        // Payment becomes available 4 hours after submission

        public DateTime? PaymentEnabledAt { get; set; }


        public bool PaymentNotificationSent { get; set; } = false;


        // =========================================================
        // DATES
        // =========================================================

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedDate { get; set; }
    }
}