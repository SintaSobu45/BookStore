using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs.Cart
{
    public class UpdateCartItemRequest
    {
        [Range(1, 100)]
        public int Quantity { get; set; }

        // Required for guest cart.
        // Registered user cart can leave this null.
        public string? GuestCartId { get; set; }
    }
}