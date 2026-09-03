using BookStore.Server.Models.Event;
using BookStore.Server.Models.OrderModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace BookStore.Server.Models
{
    public class User
    {
        [Key]
        public int UserId { get; set; }


        // =========================================================
        // ROLE
        // =========================================================

        [Required]
        public int RoleId { get; set; }

        [ForeignKey(nameof(RoleId))]
        public Role? Role { get; set; }


        // =========================================================
        // BASIC USER DETAILS
        // =========================================================

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [RegularExpression(
            @"^[6-9]\d{9}$",
            ErrorMessage = "Phone number must be 10 digits and start with 6, 7, 8, or 9."
        )]
        public string Phone { get; set; } = string.Empty;


        // =========================================================
        // PROFILE DETAILS
        // =========================================================

        public string? ProfileImageUrl { get; set; }

        [StringLength(500)]
        public string? Address { get; set; }

        [StringLength(100)]
        public string? City { get; set; }

        [StringLength(100)]
        public string? State { get; set; }

        [StringLength(100)]
        public string? District { get; set; }

        [StringLength(10)]
        public string? Pincode { get; set; }


        // =========================================================
        // MALAYALAM PROFILE DETAILS
        // These are optional during registration.
        // They can be completed later from Profile
        // or while submitting Story/Poetry.
        // =========================================================

        [StringLength(100)]
        public string? NameMalayalam { get; set; }

        [StringLength(500)]
        public string? AddressMalayalam { get; set; }

        [StringLength(100)]
        public string? CityMalayalam { get; set; }

        [StringLength(100)]
        public string? DistrictMalayalam { get; set; }

        [StringLength(100)]
        public string? StateMalayalam { get; set; }


        // =========================================================
        // ACCOUNT DETAILS
        // =========================================================

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        // EMAIL VERIFICATION
        public bool EmailVerified { get; set; } = false;

        public string? EmailVerificationOtp { get; set; }

        public DateTime? EmailVerificationOtpExpiry { get; set; }


        // PASSWORD RESET
        public string? PasswordResetOtp { get; set; }

        public DateTime? PasswordResetOtpExpiry { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedDate { get; set; }


        // =========================================================
        // NAVIGATION PROPERTIES
        // =========================================================

        public ICollection<Review> Reviews { get; set; }
            = new List<Review>();

        public ICollection<EventRegistration> EventRegistrations { get; set; }
            = new List<EventRegistration>();

        public ICollection<StoryPoetry> StoryPoetries { get; set; }
            = new List<StoryPoetry>();

        public ICollection<Payment> Payments { get; set; }
            = new List<Payment>();

        public ICollection<Order> Orders { get; set; }
    = new List<Order>();

        public ICollection<Certificate> Certificates { get; set; }
    = new List<Certificate>();
    }
}