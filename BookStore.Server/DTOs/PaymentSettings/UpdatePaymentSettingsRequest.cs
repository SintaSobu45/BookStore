using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs.PaymentSettings
{
    public class UpdatePaymentSettingsRequest
    {
        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }
    }
}