using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs
{
    public class ResendOtpRequest
    {
        [Required]
        public string RegistrationToken { get; set; } = string.Empty;
    }
}