namespace BookStore.Server.DTOs.BookPayment
{
    public class BookPaymentResponse
    {
        public int BookPaymentId { get; set; }

        public int OrderId { get; set; }

        public int? UserId { get; set; }

        public decimal Amount { get; set; }

        public string PaymentType { get; set; } = string.Empty;

        public string? PaymentMethod { get; set; }

        public string Status { get; set; } = string.Empty;

        public string? RazorpayOrderId { get; set; }

        public string? RazorpayPaymentId { get; set; }

        public DateTime CreatedDate { get; set; }

        public DateTime? PaidDate { get; set; }
    }
}