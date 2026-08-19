using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs.BookPayment
{
    public class VerifyBookPaymentRequest
    {
        [Required]
        public int BookPaymentId { get; set; }

        [Required]
        public string RazorpayOrderId { get; set; } = string.Empty;

        [Required]
        public string RazorpayPaymentId { get; set; } = string.Empty;

        [Required]
        public string RazorpaySignature { get; set; } = string.Empty;
    }
}