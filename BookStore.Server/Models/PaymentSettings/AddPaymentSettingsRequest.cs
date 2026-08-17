using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs.PaymentSettings
{
    public class AddPaymentSettingsRequest
    {
        [Required]
        public string PaymentType { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }
    }
}