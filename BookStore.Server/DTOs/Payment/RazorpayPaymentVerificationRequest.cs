using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs.Payment
{
    public class RazorpayPaymentVerificationRequest
    {
        [Required]
        public int PaymentId { get; set; }

        [Required]
        public string RazorpayOrderId { get; set; } = string.Empty;

        [Required]
        public string RazorpayPaymentId { get; set; } = string.Empty;

        [Required]
        public string RazorpaySignature { get; set; } = string.Empty;
    }
}