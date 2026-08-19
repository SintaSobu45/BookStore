using BookStore.Server.Data;
using BookStore.Server.DTOs.BookPayment;
using BookStore.Server.Models.BookPayment;
using BookStore.Server.Models.Cart;
using BookStore.Server.Repositories;
using Microsoft.EntityFrameworkCore;
using Razorpay.Api;

namespace BookStore.Server.Services
{
    public class BookPaymentService
    {
        private readonly BookPaymentRepository _bookPaymentRepository;
        private readonly OrderRepository _orderRepository;
        private readonly CartRepository _cartRepository;
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public BookPaymentService(
            BookPaymentRepository bookPaymentRepository,
            OrderRepository orderRepository,
            CartRepository cartRepository,
            ApplicationDbContext context,
            IConfiguration configuration)
        {
            _bookPaymentRepository = bookPaymentRepository;
            _orderRepository = orderRepository;
            _cartRepository = cartRepository;
            _context = context;
            _configuration = configuration;
        }


        // =========================================================
        // CREATE BOOK PAYMENT
        // =========================================================

        public async Task<(bool Success, string Message, BookPayment? Payment)>
            CreatePaymentAsync(
                CreateBookPaymentRequest request,
                int? userId)
        {
            var order =
                await _orderRepository
                    .GetByIdAsync(request.OrderId);

            if (order == null)
            {
                return (
                    false,
                    "Order not found.",
                    null
                );
            }


            // =====================================================
            // USER ACCESS CHECK
            // =====================================================

            // Logged-in order
            if (order.UserId != null)
            {
                if (userId == null ||
                    order.UserId != userId)
                {
                    return (
                        false,
                        "You are not authorized to make payment for this order.",
                        null
                    );
                }
            }


            // =====================================================
            // ALREADY PAID
            // =====================================================

            if (order.PaymentStatus == "Paid")
            {
                return (
                    false,
                    "This order has already been paid.",
                    null
                );
            }


            // =====================================================
            // CHECK EXISTING PENDING PAYMENT
            // =====================================================

            var existingPayment =
                await _bookPaymentRepository
                    .GetByOrderIdAsync(order.OrderId);

            if (existingPayment != null &&
                existingPayment.Status == "Pending")
            {
                return (
                    true,
                    "Existing pending payment found.",
                    existingPayment
                );
            }


            // =====================================================
            // RAZORPAY CONFIGURATION
            // =====================================================

            var keyId =
                _configuration["Razorpay:KeyId"];

            var keySecret =
                _configuration["Razorpay:KeySecret"];

            if (string.IsNullOrWhiteSpace(keyId) ||
                string.IsNullOrWhiteSpace(keySecret))
            {
                return (
                    false,
                    "Razorpay configuration is missing.",
                    null
                );
            }


            // =====================================================
            // CREATE RAZORPAY ORDER
            // =====================================================

            RazorpayClient client =
                new RazorpayClient(
                    keyId,
                    keySecret);

            var options =
                new Dictionary<string, object>
                {
                    {
                        "amount",
                        (int)(order.TotalAmount * 100)
                    },
                    {
                        "currency",
                        "INR"
                    },
                    {
                        "receipt",
                        $"ORDER-{order.OrderId}"
                    }
                };


            Razorpay.Api.Order razorpayOrder =
                client.Order.Create(options);


            string razorpayOrderId =
                razorpayOrder["id"]?.ToString()
                ?? string.Empty;

            if (string.IsNullOrWhiteSpace(
                razorpayOrderId))
            {
                return (
                    false,
                    "Failed to create Razorpay order.",
                    null
                );
            }


            // =====================================================
            // CREATE BOOK PAYMENT
            // =====================================================

            var payment = new BookPayment
            {
                OrderId = order.OrderId,

                // Logged-in -> UserId
                // Guest -> null
                UserId = userId,

                Amount = order.TotalAmount,

                PaymentType = "Razorpay",

                Status = "Pending",

                RazorpayOrderId = razorpayOrderId,

                CreatedDate = DateTime.UtcNow
            };


            var createdPayment =
                await _bookPaymentRepository
                    .AddAsync(payment);


            return (
                true,
                "Book payment created successfully.",
                createdPayment
            );
        }


        // =========================================================
        // VERIFY PAYMENT
        // =========================================================

        public async Task<(bool Success, string Message)>
            VerifyPaymentAsync(
                VerifyBookPaymentRequest request)
        {
            var payment =
                await _bookPaymentRepository
                    .GetByIdAsync(request.BookPaymentId);

            if (payment == null)
            {
                return (
                    false,
                    "Book payment not found."
                );
            }


            // =====================================================
            // ALREADY PAID
            // =====================================================

            if (payment.Status == "Paid")
            {
                return (
                    true,
                    "Payment already verified."
                );
            }


            // =====================================================
            // RAZORPAY CONFIGURATION
            // =====================================================

            var keySecret =
                _configuration["Razorpay:KeySecret"];

            if (string.IsNullOrWhiteSpace(keySecret))
            {
                return (
                    false,
                    "Razorpay configuration is missing."
                );
            }


            // =====================================================
            // VALIDATE RAZORPAY ORDER ID
            // =====================================================

            if (string.IsNullOrWhiteSpace(
                    request.RazorpayOrderId))
            {
                return (
                    false,
                    "Razorpay Order ID is required."
                );
            }

            if (payment.RazorpayOrderId !=
                request.RazorpayOrderId)
            {
                return (
                    false,
                    "Razorpay Order ID does not match."
                );
            }


            // =====================================================
            // VALIDATE RAZORPAY PAYMENT ID
            // =====================================================

            if (string.IsNullOrWhiteSpace(
                    request.RazorpayPaymentId))
            {
                return (
                    false,
                    "Razorpay Payment ID is required."
                );
            }


            // =====================================================
            // VALIDATE SIGNATURE
            // =====================================================

            if (string.IsNullOrWhiteSpace(
                    request.RazorpaySignature))
            {
                return (
                    false,
                    "Razorpay Signature is required."
                );
            }


            // =====================================================
            // VERIFY RAZORPAY SIGNATURE
            // =====================================================

            try
            {
                Utils.verifyPaymentSignature(
                    new Dictionary<string, string>
                    {
                        {
                            "razorpay_order_id",
                            request.RazorpayOrderId
                        },
                        {
                            "razorpay_payment_id",
                            request.RazorpayPaymentId
                        },
                        {
                            "razorpay_signature",
                            request.RazorpaySignature
                        }
                    });
            }
            catch
            {
                payment.Status = "Failed";

                await _bookPaymentRepository
                    .UpdateAsync(payment);


                var failedOrder =
                    await _orderRepository
                        .GetByIdAsync(payment.OrderId);

                if (failedOrder != null)
                {
                    failedOrder.PaymentStatus =
                        "Failed";

                    await _orderRepository
                        .UpdateAsync(failedOrder);
                }


                return (
                    false,
                    "Payment verification failed."
                );
            }


            // =====================================================
            // GET ORDER WITH ORDER ITEMS
            // =====================================================

            var order =
                await _context.Orders
                    .Include(o => o.OrderItems)
                    .FirstOrDefaultAsync(
                        o => o.OrderId == payment.OrderId);

            if (order == null)
            {
                return (
                    false,
                    "Order not found after payment verification."
                );
            }


            // =====================================================
            // PREVENT DUPLICATE PROCESSING
            // =====================================================

            if (order.PaymentStatus == "Paid")
            {
                return (
                    true,
                    "Order payment has already been completed."
                );
            }


            // =====================================================
            // BEGIN TRANSACTION
            // =====================================================

            await using var transaction =
                await _context.Database
                    .BeginTransactionAsync();

            try
            {
                // =================================================
                // CHECK STOCK AGAIN
                // =================================================

                foreach (var orderItem in order.OrderItems)
                {
                    var book =
                        await _context.Books
                            .FirstOrDefaultAsync(
                                b => b.BookId ==
                                    orderItem.BookId);

                    if (book == null)
                    {
                        await transaction.RollbackAsync();

                        return (
                            false,
                            $"Book with ID {orderItem.BookId} not found."
                        );
                    }

                    if (orderItem.Quantity <= 0)
                    {
                        await transaction.RollbackAsync();

                        return (
                            false,
                            $"Invalid quantity for book '{book.Title}'."
                        );
                    }

                    if (book.StockQuantity <
                        orderItem.Quantity)
                    {
                        await transaction.RollbackAsync();

                        return (
                            false,
                            $"Insufficient stock for book '{book.Title}'. " +
                            $"Available stock: {book.StockQuantity}."
                        );
                    }
                }


                // =================================================
                // REDUCE STOCK
                // =================================================

                foreach (var orderItem in order.OrderItems)
                {
                    var book =
                        await _context.Books
                            .FirstAsync(
                                b => b.BookId ==
                                    orderItem.BookId);

                    book.StockQuantity -=
                        orderItem.Quantity;
                }


                // =================================================
                // UPDATE BOOK PAYMENT
                // =================================================

                payment.Status = "Paid";

                payment.RazorpayOrderId =
                    request.RazorpayOrderId;

                payment.RazorpayPaymentId =
                    request.RazorpayPaymentId;

                payment.RazorpaySignature =
                    request.RazorpaySignature;

                payment.PaidDate =
                    DateTime.UtcNow;


                // =================================================
                // UPDATE ORDER
                // =================================================

                order.PaymentStatus =
                    "Paid";

                order.OrderStatus =
                    "Confirmed";


                // =================================================
                // CLEAR CART
                // =================================================

                Cart? cart = null;

                if (order.UserId.HasValue)
                {
                    cart =
                        await _cartRepository
                            .GetByUserIdAsync(
                                order.UserId.Value);
                }
                else if (!string.IsNullOrWhiteSpace(
                    order.GuestCartId))
                {
                    cart =
                        await _cartRepository
                            .GetByGuestCartIdAsync(
                                order.GuestCartId);
                }


                if (cart != null &&
                    cart.CartItems.Any())
                {
                    _context.CartItems
                        .RemoveRange(cart.CartItems);

                    cart.UpdatedDate =
                        DateTime.UtcNow;
                }


                // =================================================
                // SAVE EVERYTHING TOGETHER
                // =================================================

                await _context.SaveChangesAsync();


                // =================================================
                // COMMIT TRANSACTION
                // =================================================

                await transaction.CommitAsync();


                return (
                    true,
                    "Payment verified successfully. " +
                    "Order confirmed, stock updated and cart cleared."
                );
            }
            catch
            {
                await transaction.RollbackAsync();

                return (
                    false,
                    "Payment verification succeeded, but order processing failed."
                );
            }
        }
    }
}