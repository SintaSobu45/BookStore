using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs.Profile
{
    public class UpdateProfileRequest
    {
        // =========================================================
        // BASIC DETAILS
        // =========================================================

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [RegularExpression(
            @"^[6-9]\d{9}$",
            ErrorMessage = "Phone number must be 10 digits and start with 6, 7, 8, or 9."
        )]
        public string Phone { get; set; } = string.Empty;


        // =========================================================
        // NORMAL ADDRESS DETAILS
        // =========================================================

        [StringLength(500)]
        public string? Address { get; set; }

        [StringLength(100)]
        public string? City { get; set; }

        [StringLength(100)]
        public string? District { get; set; }

        [StringLength(100)]
        public string? State { get; set; }

        [StringLength(10)]
        public string? Pincode { get; set; }


        // =========================================================
        // MALAYALAM DETAILS
        // These are optional.
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
    }
}