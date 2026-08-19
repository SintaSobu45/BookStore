using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStore.Server.Models.OrderModel
{
    public class OrderItem
    {
        [Key]
        public int OrderItemId { get; set; }


        // =========================================================
        // ORDER
        // =========================================================

        [Required]
        public int OrderId { get; set; }

        public Order? Order { get; set; }


        // =========================================================
        // BOOK
        // =========================================================

        [Required]
        public int BookId { get; set; }

        public Book? Book { get; set; }


        // =========================================================
        // QUANTITY
        // =========================================================

        [Required]
        public int Quantity { get; set; }


        // =========================================================
        // PRICE SNAPSHOT
        // =========================================================

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }


        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPrice { get; set; }
    }
}