using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs.ForgotPassword
{
    public class ForgotPasswordRequest
    {
        [Required]
        [EmailAddress]
        [StringLength(150)]
        public string Email { get; set; } = string.Empty;
    }

}
