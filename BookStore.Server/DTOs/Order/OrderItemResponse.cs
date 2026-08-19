namespace BookStore.Server.DTOs.Order
{
    public class OrderItemResponse
    {
        public int OrderItemId { get; set; }

        public int BookId { get; set; }

        public string BookTitle { get; set; } = string.Empty;

        public int Quantity { get; set; }

        public decimal UnitPrice { get; set; }

        public decimal TotalPrice { get; set; }
    }
}