namespace BookStore.Server.DTOs.Cart
{
    public class CartResponse
    {
        public int CartId { get; set; }

        public string? GuestCartId { get; set; }

        public List<CartItemResponse> Items { get; set; }
            = new List<CartItemResponse>();

        public int TotalItems { get; set; }

        public decimal SubTotal { get; set; }
    }
}