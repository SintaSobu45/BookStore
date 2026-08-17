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

        // Payment gateway
        // Example: Razorpay
        public string PaymentType { get; set; } = string.Empty;

        // Actual payment method
        // Example: UPI, Card, NetBanking, Wallet
        public string? PaymentMethod { get; set; }

        public string Status { get; set; } = string.Empty;

        public string? RazorpayOrderId { get; set; }

        public string? RazorpayPaymentId { get; set; }

        public string? RazorpaySignature { get; set; }

        public DateTime CreatedDate { get; set; }

        public DateTime? PaidDate { get; set; }
    }
}