using BookStore.Server.Models.Event;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStore.Server.Models
{
    public class Payment
    {
        [Key]
        public int PaymentId { get; set; }

        // =========================================================
        // USER
        // =========================================================

        [Required]
        public int UserId { get; set; }

        public User? User { get; set; }


        // =========================================================
        // STORY / POETRY
        // =========================================================

        public int? StoryPoetryId { get; set; }

        public StoryPoetry? StoryPoetry { get; set; }


        // =========================================================
        // EVENT REGISTRATION
        // =========================================================

        public int? EventRegistrationId { get; set; }

        public EventRegistration? EventRegistration { get; set; }


        // =========================================================
        // BOOK ORDER - FOR FUTURE CART / ORDER
        // =========================================================

        public int? OrderId { get; set; }


        // =========================================================
        // PAYMENT DETAILS
        // =========================================================

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        // Payment gateway
        // Example: Razorpay
        [Required]
        [StringLength(50)]
        public string PaymentType { get; set; } = string.Empty;

        // Actual payment method
        // Example: UPI, Card, NetBanking, Wallet
        [StringLength(30)]
        public string? PaymentMethod { get; set; }

        [Required]
        [StringLength(30)]
        public string Status { get; set; } = "Pending";


        // =========================================================
        // RAZORPAY
        // =========================================================

        public string? RazorpayOrderId { get; set; }

        public string? RazorpayPaymentId { get; set; }

        public string? RazorpaySignature { get; set; }


        // =========================================================
        // DATES
        // =========================================================

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime? PaidDate { get; set; }
    }
}