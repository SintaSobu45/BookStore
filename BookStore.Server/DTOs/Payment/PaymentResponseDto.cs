namespace BookStore.Server.DTOs.Payment
{
    public class PaymentResponseDto
    {
        public int PaymentId { get; set; }

        public int UserId { get; set; }

        public int? StoryPoetryId { get; set; }

        public int? EventRegistrationId { get; set; }

        public int? OrderId { get; set; }

        public decimal Amount { get; set; }

        public string PaymentType { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public string? RazorpayOrderId { get; set; }

        public string? RazorpayPaymentId { get; set; }

        public string? RazorpaySignature { get; set; }

        public string? TransactionId { get; set; }

        public DateTime CreatedDate { get; set; }

        public DateTime? PaidDate { get; set; }
    }
}