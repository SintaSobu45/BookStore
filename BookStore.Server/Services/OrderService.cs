using BookStore.Server.Data;
using BookStore.Server.DTOs.Order;
using BookStore.Server.Models.Cart;
using BookStore.Server.Models.OrderModel;
using BookStore.Server.Repositories;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Server.Services
{
    public class OrderService
    {
        private readonly OrderRepository _orderRepository;
        private readonly ApplicationDbContext _context;
        private readonly CartRepository _cartRepository;

        public OrderService(
            OrderRepository orderRepository,
            ApplicationDbContext context,
            CartRepository cartRepository)
        {
            _orderRepository = orderRepository;
            _context = context;
            _cartRepository = cartRepository;
        }


        // =========================================================
        // CREATE ORDER
        // =========================================================

        public async Task<(bool Success, string Message, Order? Order)>
            CreateOrderAsync(
                CreateOrderRequest request,
                int? userId)
        {
            // =====================================================
            // 1. VALIDATE REQUEST ITEMS
            // =====================================================

            if (request.Items == null || request.Items.Count == 0)
            {
                return (
                    false,
                    "Order must contain at least one item.",
                    null
                );
            }


            // =====================================================
            // 2. FIND CART
            // =====================================================

            Cart? cart = null;

            if (userId.HasValue)
            {
                // -------------------------------------------------
                // LOGGED-IN USER CART
                // -------------------------------------------------

                cart = await _cartRepository
                    .GetByUserIdAsync(userId.Value);

                if (cart == null)
                {
                    return (
                        false,
                        "Cart not found.",
                        null
                    );
                }
            }
            else
            {
                // -------------------------------------------------
                // GUEST CART
                // -------------------------------------------------

                if (string.IsNullOrWhiteSpace(request.GuestCartId))
                {
                    return (
                        false,
                        "GuestCartId is required for guest checkout.",
                        null
                    );
                }

                cart = await _cartRepository
                    .GetByGuestCartIdAsync(
                        request.GuestCartId);

                if (cart == null)
                {
                    return (
                        false,
                        "Guest cart not found.",
                        null
                    );
                }
            }


            // =====================================================
            // 3. CHECK CART HAS ITEMS
            // =====================================================

            if (cart.CartItems == null ||
                cart.CartItems.Count == 0)
            {
                return (
                    false,
                    "Cart is empty.",
                    null
                );
            }


            // =====================================================
            // 4. CREATE ORDER
            // =====================================================

            var order = new Order
            {
                UserId = userId,

                // Guest order ID
                GuestOrderId = userId == null
                    ? GenerateGuestOrderId()
                    : null,

                // Guest cart ID
                GuestCartId = userId == null
                    ? request.GuestCartId
                    : null,

                CustomerName = request.CustomerName,

                CustomerEmail = request.CustomerEmail,

                CustomerPhone = request.CustomerPhone,

                ShippingAddress = request.ShippingAddress,

                City = request.City,

                State = request.State,

                Pincode = request.Pincode,

                OrderStatus = "Pending",

                PaymentStatus = "Pending",

                OrderDate = DateTime.UtcNow
            };


            // =====================================================
            // 5. CALCULATION VARIABLES
            // =====================================================

            decimal subTotal = 0;

            int totalQuantity = 0;


            // =====================================================
            // 6. VALIDATE ITEMS AGAINST CART
            // =====================================================

            foreach (var item in request.Items)
            {
                var cartItem = cart.CartItems
                    .FirstOrDefault(ci =>
                        ci.BookId == item.BookId);

                if (cartItem == null)
                {
                    return (
                        false,
                        $"Book with ID {item.BookId} is not available in the current cart.",
                        null
                    );
                }


                // -------------------------------------------------
                // Requested quantity must match cart quantity
                // -------------------------------------------------

                if (item.Quantity != cartItem.Quantity)
                {
                    return (
                        false,
                        $"Quantity mismatch for book ID {item.BookId}.",
                        null
                    );
                }


                // =================================================
                // GET CURRENT BOOK FROM DATABASE
                // =================================================

                var book = await _context.Books
                    .FirstOrDefaultAsync(
                        b => b.BookId == item.BookId);

                if (book == null)
                {
                    return (
                        false,
                        $"Book with ID {item.BookId} not found.",
                        null
                    );
                }


                // =================================================
                // CHECK BOOK ACTIVE
                // =================================================

                if (!book.IsActive)
                {
                    return (
                        false,
                        $"Book '{book.Title}' is currently unavailable.",
                        null
                    );
                }


                // =================================================
                // CHECK QUANTITY
                // =================================================

                if (item.Quantity <= 0)
                {
                    return (
                        false,
                        $"Invalid quantity for book '{book.Title}'.",
                        null
                    );
                }


                // =================================================
                // CHECK STOCK
                // =================================================

                if (book.StockQuantity < item.Quantity)
                {
                    return (
                        false,
                        $"Insufficient stock for book '{book.Title}'. " +
                        $"Available stock: {book.StockQuantity}.",
                        null
                    );
                }


                // =================================================
                // CALCULATE DISCOUNT
                // =================================================

                decimal originalPrice = book.Price;

                decimal discountPercentage =
                    book.DiscountPercentage;

                decimal discountAmount =
                    originalPrice *
                    discountPercentage /
                    100m;

                decimal discountedUnitPrice =
                    originalPrice -
                    discountAmount;


                // =================================================
                // VALIDATE DISCOUNTED PRICE
                // =================================================

                if (discountedUnitPrice < 0)
                {
                    return (
                        false,
                        $"Invalid discount for book '{book.Title}'.",
                        null
                    );
                }


                // =================================================
                // CALCULATE ITEM TOTAL
                // =================================================

                decimal itemTotal =
                    discountedUnitPrice *
                    item.Quantity;


                // =================================================
                // CREATE ORDER ITEM
                // =================================================

                var orderItem = new OrderItem
                {
                    BookId = book.BookId,

                    Quantity = item.Quantity,

                    // Store discounted price as final unit price
                    UnitPrice = discountedUnitPrice,

                    TotalPrice = itemTotal
                };

                order.OrderItems.Add(orderItem);


                // =================================================
                // UPDATE TOTALS
                // =================================================

                subTotal += itemTotal;

                totalQuantity += item.Quantity;
            }


            // =====================================================
            // 7. VALIDATE SUBTOTAL
            // =====================================================

            if (subTotal <= 0)
            {
                return (
                    false,
                    "Invalid order subtotal.",
                    null
                );
            }


            // =====================================================
            // 8. CALCULATE COURIER FEE
            // =====================================================

            decimal courierFee;

            if (totalQuantity <= 3)
            {
                courierFee = 1m;
            }
            else if (totalQuantity <= 6)
            {
                courierFee = 57m;
            }
            else
            {
                courierFee = 100m;
            }


            // =====================================================
            // 9. CALCULATE FINAL TOTAL
            // =====================================================

            decimal totalAmount =
                subTotal + courierFee;


            // =====================================================
            // 10. SET ORDER AMOUNTS
            // =====================================================

            order.SubTotal = subTotal;

            order.CourierFee = courierFee;

            order.TotalAmount = totalAmount;


            // =====================================================
            // 11. SAVE ORDER
            // =====================================================

            var createdOrder =
                await _orderRepository
                    .AddAsync(order);


            // =====================================================
            // 12. RETURN
            // =====================================================

            return (
                true,
                "Order created successfully.",
                createdOrder
            );
        }


        // =========================================================
        // GET ORDER BY ID
        // =========================================================

        public async Task<OrderResponse?> GetOrderByIdAsync(
            int orderId)
        {
            var order = await _orderRepository
                .GetByIdAsync(orderId);

            if (order == null)
            {
                return null;
            }

            return MapToOrderResponse(order);
        }


        // =========================================================
        // GET USER ORDERS
        // =========================================================

        public async Task<List<OrderResponse>> GetUserOrdersAsync(
            int userId)
        {
            var orders = await _orderRepository
                .GetByUserIdAsync(userId);

            return orders
                .Select(MapToOrderResponse)
                .ToList();
        }


        // =========================================================
        // GET GUEST ORDER
        // =========================================================

        public async Task<OrderResponse?> GetGuestOrderAsync(
            string guestOrderId)
        {
            var order = await _orderRepository
                .GetByGuestOrderIdAsync(guestOrderId);

            if (order == null)
            {
                return null;
            }

            return MapToOrderResponse(order);
        }


        // =========================================================
        // GET ALL ORDERS
        // =========================================================

        public async Task<List<OrderResponse>> GetAllOrdersAsync()
        {
            var orders = await _orderRepository
                .GetAllAsync();

            return orders
                .Select(MapToOrderResponse)
                .ToList();
        }


        // =========================================================
        // MAP ORDER ENTITY TO ORDER RESPONSE DTO
        // =========================================================

        private OrderResponse MapToOrderResponse(Order order)
        {
            return new OrderResponse
            {
                OrderId = order.OrderId,

                UserId = order.UserId,

                GuestCartId = order.GuestCartId,

                GuestOrderId = order.GuestOrderId,

                CustomerName = order.CustomerName,

                CustomerEmail = order.CustomerEmail,

                CustomerPhone = order.CustomerPhone,

                ShippingAddress = order.ShippingAddress,

                City = order.City,

                State = order.State,

                Pincode = order.Pincode,

                SubTotal = order.SubTotal,

                CourierFee = order.CourierFee,

                TotalAmount = order.TotalAmount,

                OrderStatus = order.OrderStatus,

                PaymentStatus = order.PaymentStatus,

                OrderDate = order.OrderDate,

                Items = order.OrderItems
                    .Select(item => new OrderItemResponse
                    {
                        OrderItemId = item.OrderItemId,

                        BookId = item.BookId,

                        BookTitle = item.Book?.Title
                            ?? string.Empty,

                        Quantity = item.Quantity,

                        UnitPrice = item.UnitPrice,

                        TotalPrice = item.TotalPrice
                    })
                    .ToList()
            };
        }


        // =========================================================
        // UPDATE ORDER STATUS
        // =========================================================

        public async Task<bool> UpdateOrderStatusAsync(
            int orderId,
            string status)
        {
            var order =
                await _orderRepository
                    .GetByIdAsync(orderId);

            if (order == null)
            {
                return false;
            }

            order.OrderStatus = status;

            await _orderRepository
                .UpdateAsync(order);

            return true;
        }


        // =========================================================
        // GENERATE GUEST ORDER ID
        // =========================================================

        private string GenerateGuestOrderId()
        {
            return $"GUEST-{Guid.NewGuid():N}"
                [..17]
                .ToUpper();
        }
    }
}