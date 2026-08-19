namespace BookStore.Server.DTOs.Order
{
    public class OrderResponse
    {
        public int OrderId { get; set; }

        public int? UserId { get; set; }

        public string? GuestCartId { get; set; }

        public string? GuestOrderId { get; set; }

        public string CustomerName { get; set; } = string.Empty;

        public string CustomerEmail { get; set; } = string.Empty;

        public string CustomerPhone { get; set; } = string.Empty;

        public string ShippingAddress { get; set; } = string.Empty;

        public string City { get; set; } = string.Empty;

        public string State { get; set; } = string.Empty;

        public string Pincode { get; set; } = string.Empty;

        public decimal SubTotal { get; set; }

        public decimal CourierFee { get; set; }

        public decimal TotalAmount { get; set; }

        public string OrderStatus { get; set; } = string.Empty;

        public string PaymentStatus { get; set; } = string.Empty;

        public DateTime OrderDate { get; set; }

        public List<OrderItemResponse> Items { get; set; }
            = new List<OrderItemResponse>();
    }
}