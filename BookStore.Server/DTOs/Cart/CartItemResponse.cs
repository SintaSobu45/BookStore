namespace BookStore.Server.DTOs.Cart
{
    public class CartItemResponse
    {
        public int CartItemId { get; set; }

        public int BookId { get; set; }

        public string BookTitle { get; set; } = string.Empty;

        public string? ImageUrl { get; set; }

        public decimal Price { get; set; }

        public decimal DiscountPercentage { get; set; }

        public decimal DiscountedPrice { get; set; }

        public int Quantity { get; set; }

        public decimal ItemTotal { get; set; }

        public int AvailableStock { get; set; }
    }
}