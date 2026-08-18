using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs.Cart
{
    public class AddToCartRequest
    {
        [Required]
        public int BookId { get; set; }

        [Range(1, 100)]
        public int Quantity { get; set; } = 1;

        // Guest users send GuestCartId.
        // Registered users do not need to send it.
        public string? GuestCartId { get; set; }
    }
}