using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStore.Server.Models.Cart
{
    public class CartItem
    {
        [Key]
        public int CartItemId { get; set; }

        // Foreign Keys
        public int CartId { get; set; }

        public int BookId { get; set; }

        // Quantity
        [Range(1, 100)]
        public int Quantity { get; set; }

        // Price when item was added to cart
        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        // Navigation Properties
        [ForeignKey(nameof(CartId))]
        public Cart? Cart { get; set; }

        [ForeignKey(nameof(BookId))]
        public Book? Book { get; set; }
    }
}