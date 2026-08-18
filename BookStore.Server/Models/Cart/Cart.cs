using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.Models.Cart
{
    public class Cart
    {
        [Key]
        public int CartId { get; set; }

        // Registered User
        public int? UserId { get; set; }

        // Guest User
        [StringLength(100)]
        public string? GuestCartId { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedDate { get; set; }

        // Navigation Property
        public User? User { get; set; }

        public ICollection<CartItem> CartItems { get; set; }
            = new List<CartItem>();
    }
}