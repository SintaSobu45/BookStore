using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs
{
    public class VerifyEmailRequest
    {
        [Required]
        public string RegistrationToken { get; set; } = string.Empty;

        [Required]
        [StringLength(6, MinimumLength = 6)]
        public string Otp { get; set; } = string.Empty;
    }
}