using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs
{
    public class ResendOtpRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }
}