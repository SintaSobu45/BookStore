using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs.Order
{
    public class OrderItemRequest
    {
        [Required]
        public int BookId { get; set; }

        [Required]
        [Range(1, 100)]
        public int Quantity { get; set; }
    }
}