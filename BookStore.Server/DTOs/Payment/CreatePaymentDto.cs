using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs.Payment
{
    public class CreatePaymentDto
    {
        [Required]
        public int UserId { get; set; }

        public int? StoryPoetryId { get; set; }

        public int? EventRegistrationId { get; set; }

        public int? OrderId { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        [Required]
        [StringLength(50)]
        public string PaymentType { get; set; } = string.Empty;
    }
}