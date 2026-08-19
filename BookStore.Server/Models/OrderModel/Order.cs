using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStore.Server.Models.OrderModel
{
    public class Order
    {
        [Key]
        public int OrderId { get; set; }

        // =========================================================
        // USER
        // =========================================================

        // Null for guest orders
        public int? UserId { get; set; }

        public User? User { get; set; }


        // =========================================================
        // GUEST ORDER
        // =========================================================

        // Example: GUEST-8F42A91C
        public string? GuestOrderId { get; set; }


        // Guest cart used for this order
        public string? GuestCartId { get; set; }


        // =========================================================
        // CUSTOMER DETAILS
        // =========================================================

        [Required]
        [StringLength(100)]
        public string CustomerName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(150)]
        public string CustomerEmail { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string CustomerPhone { get; set; } = string.Empty;


        // =========================================================
        // SHIPPING ADDRESS
        // =========================================================

        [Required]
        [StringLength(300)]
        public string ShippingAddress { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string City { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string State { get; set; } = string.Empty;

        [Required]
        [StringLength(10)]
        public string Pincode { get; set; } = string.Empty;


        // =========================================================
        // ORDER AMOUNT
        // =========================================================

        // =========================================================
        // ORDER AMOUNT
        // =========================================================

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal SubTotal { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal CourierFee { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }


        // =========================================================
        // ORDER STATUS
        // =========================================================

        // Examples:
        // Pending
        // Confirmed
        // Shipped
        // Delivered
        // Cancelled

        [Required]
        [StringLength(30)]
        public string OrderStatus { get; set; } = "Pending";


        // =========================================================
        // PAYMENT STATUS
        // =========================================================

        // Examples:
        // Pending
        // Paid
        // Failed

        [Required]
        [StringLength(30)]
        public string PaymentStatus { get; set; } = "Pending";


        // =========================================================
        // DATE
        // =========================================================

        public DateTime OrderDate { get; set; } = DateTime.UtcNow;


        // =========================================================
        // ORDER ITEMS
        // =========================================================

        public ICollection<OrderItem> OrderItems { get; set; }
            = new List<OrderItem>();
    }
}