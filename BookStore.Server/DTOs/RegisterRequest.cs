using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs
{
    public class RegisterRequest
    {
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

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;
    }
}