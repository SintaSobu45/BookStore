using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs.Order
{
    public class CreateOrderRequest
    {
        // =========================================================
        // GUEST CART
        // =========================================================

        // Required only for guest checkout
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
        // ORDER ITEMS
        // =========================================================

        [Required]
        [MinLength(1)]
        public List<OrderItemRequest> Items { get; set; }
            = new List<OrderItemRequest>();
    }
}