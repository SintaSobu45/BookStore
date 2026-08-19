using BookStore.Server.DTOs.Order;
using BookStore.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookStore.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly OrderService _orderService;

        public OrderController(OrderService orderService)
        {
            _orderService = orderService;
        }


        // =========================================================
        // CREATE ORDER
        // =========================================================

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> CreateOrder(
            [FromBody] CreateOrderRequest request)
        {
            int? userId = GetUserId();

            var result = await _orderService
                .CreateOrderAsync(request, userId);

            if (!result.Success)
            {
                return BadRequest(new
                {
                    message = result.Message
                });
            }

            return Ok(new
            {
                message = result.Message,
                orderId = result.Order!.OrderId,
                guestOrderId = result.Order.GuestOrderId,
                guestCartId = result.Order.GuestCartId,

                subTotal = result.Order.SubTotal,
                courierFee = result.Order.CourierFee,
                totalAmount = result.Order.TotalAmount,

                paymentStatus = result.Order.PaymentStatus,
                orderStatus = result.Order.OrderStatus
            });
        }


        // =========================================================
        // GET ORDER BY ID
        // =========================================================

        [HttpGet("{id:int}")]
        [Authorize]
        public async Task<IActionResult> GetOrderById(int id)
        {
            var order = await _orderService
                .GetOrderByIdAsync(id);

            if (order == null)
            {
                return NotFound(new
                {
                    message = "Order not found."
                });
            }


            // Admin can access any order
            if (User.IsInRole("Admin"))
            {
                return Ok(order);
            }


            // Normal user can access only own order
            var userId = GetUserId();

            if (!userId.HasValue)
            {
                return Unauthorized(new
                {
                    message = "Invalid user authentication."
                });
            }

            if (order.UserId != userId.Value)
            {
                return Forbid();
            }

            return Ok(order);
        }


        // =========================================================
        // GET MY ORDERS
        // =========================================================

        [HttpGet("my-orders")]
        [Authorize]
        public async Task<IActionResult> GetMyOrders()
        {
            var userId = GetUserId();

            if (!userId.HasValue)
            {
                return Unauthorized(new
                {
                    message = "Invalid user authentication."
                });
            }

            var orders = await _orderService
                .GetUserOrdersAsync(userId.Value);

            return Ok(orders);
        }


        // =========================================================
        // GET GUEST ORDER
        // =========================================================

        [HttpGet("guest/{guestOrderId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetGuestOrder(
            string guestOrderId)
        {
            if (string.IsNullOrWhiteSpace(guestOrderId))
            {
                return BadRequest(new
                {
                    message = "Guest order ID is required."
                });
            }

            var order = await _orderService
                .GetGuestOrderAsync(guestOrderId);

            if (order == null)
            {
                return NotFound(new
                {
                    message = "Guest order not found."
                });
            }

            return Ok(order);
        }


        // =========================================================
        // GET ALL ORDERS - ADMIN ONLY
        // =========================================================

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _orderService
                .GetAllOrdersAsync();

            return Ok(orders);
        }


        // =========================================================
        // UPDATE ORDER STATUS - ADMIN ONLY
        // =========================================================

        [HttpPut("{id:int}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateOrderStatus(
            int id,
            [FromBody] string status)
        {
            if (string.IsNullOrWhiteSpace(status))
            {
                return BadRequest(new
                {
                    message = "Order status is required."
                });
            }


            var validStatuses = new[]
            {
                "Pending",
                "Confirmed",
                "Shipped",
                "Delivered",
                "Cancelled"
            };


            if (!validStatuses.Contains(
                    status,
                    StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    message =
                        "Invalid order status. " +
                        "Allowed values: Pending, Confirmed, " +
                        "Shipped, Delivered, Cancelled."
                });
            }


            var success = await _orderService
                .UpdateOrderStatusAsync(
                    id,
                    status);

            if (!success)
            {
                return NotFound(new
                {
                    message = "Order not found."
                });
            }


            return Ok(new
            {
                message = "Order status updated successfully."
            });
        }


        // =========================================================
        // GET USER ID FROM JWT
        // =========================================================

        private int? GetUserId()
        {
            var userIdClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier)?.Value;

            if (int.TryParse(
                    userIdClaim,
                    out int userId))
            {
                return userId;
            }

            return null;
        }
    }
}