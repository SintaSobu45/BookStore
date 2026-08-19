using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BookStore.Server.Models.OrderModel;

namespace BookStore.Server.Models.BookPayment
{
    public class BookPayment
    {
        [Key]
        public int BookPaymentId { get; set; }


        // =========================================================
        // ORDER
        // =========================================================

        [Required]
        public int OrderId { get; set; }

        [ForeignKey(nameof(OrderId))]
        public Order? Order { get; set; }


        // =========================================================
        // USER
        // =========================================================

        // Null for guest orders
        public int? UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }


        // =========================================================
        // PAYMENT DETAILS
        // =========================================================

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required]
        [StringLength(50)]
        public string PaymentType { get; set; } = "Razorpay";

        [StringLength(50)]
        public string? PaymentMethod { get; set; }


        // =========================================================
        // PAYMENT STATUS
        // =========================================================

        [Required]
        [StringLength(30)]
        public string Status { get; set; } = "Pending";


        // =========================================================
        // RAZORPAY DETAILS
        // =========================================================

        [StringLength(100)]
        public string? RazorpayOrderId { get; set; }

        [StringLength(100)]
        public string? RazorpayPaymentId { get; set; }

        [StringLength(500)]
        public string? RazorpaySignature { get; set; }


        // =========================================================
        // DATES
        // =========================================================

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime? PaidDate { get; set; }
    }
}