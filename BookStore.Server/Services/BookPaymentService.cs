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
        private readonly BookInvoiceService _bookInvoiceService;
        private readonly EmailService _emailService;

        public BookPaymentService(
            BookPaymentRepository bookPaymentRepository,
            OrderRepository orderRepository,
            CartRepository cartRepository,
            ApplicationDbContext context,
            IConfiguration configuration,
            BookInvoiceService bookInvoiceService,
            EmailService emailService)
        {
            _bookPaymentRepository = bookPaymentRepository;
            _orderRepository = orderRepository;
            _cartRepository = cartRepository;
            _context = context;
            _configuration = configuration;
            _bookInvoiceService = bookInvoiceService;
            _emailService = emailService;
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

            // Guest order:
            // userId can be null.
            // Order is identified using OrderId / GuestOrderId.


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

                // Logged-in customer -> UserId
                // Guest customer -> null
                UserId = userId,

                Amount = order.TotalAmount,

                PaymentType = "Razorpay",

                PaymentMethod = null,

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
            // =====================================================
            // GET PAYMENT
            // =====================================================

            var payment =
                await _bookPaymentRepository
                    .GetByIdAsync(
                        request.BookPaymentId);

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

            var keyId =
                _configuration["Razorpay:KeyId"];

            var keySecret =
                _configuration["Razorpay:KeySecret"];

            if (string.IsNullOrWhiteSpace(keyId) ||
                string.IsNullOrWhiteSpace(keySecret))
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
            // GET ORDER WITH ORDER ITEMS + BOOK
            // =====================================================

            var order = payment.Order;

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
            // GET PAYMENT METHOD
            // =====================================================

            string? paymentMethod = null;

            try
            {
                RazorpayClient client =
                    new RazorpayClient(
                        keyId,
                        keySecret);

                Razorpay.Api.Payment razorpayPayment =
                    client.Payment.Fetch(
                        request.RazorpayPaymentId);

                paymentMethod =
                    razorpayPayment["method"]?.ToString();
            }
            catch
            {
                // Payment is still valid.
                // If Razorpay payment method cannot be fetched,
                // invoice will show N/A.
                paymentMethod = null;
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
                // UPDATE PAYMENT
                // =================================================

                payment.Status =
                    "Paid";

                payment.PaymentMethod =
                    paymentMethod;

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
                        .RemoveRange(
                            cart.CartItems);

                    cart.UpdatedDate =
                        DateTime.UtcNow;
                }


                // =================================================
                // SAVE DATABASE CHANGES
                // =================================================

                await _context.SaveChangesAsync();


                // =================================================
                // COMMIT TRANSACTION
                // =================================================

                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();

                return (
                    false,
                    "Payment verification succeeded, but order processing failed."
                );
            }


            // =====================================================
            // GENERATE INVOICE + SEND EMAIL
            // =====================================================
            //
            // IMPORTANT:
            // This is OUTSIDE the database transaction.
            //
            // Payment remains successful even if email fails.
            // =====================================================

            try
            {
                DateTime paymentDate =
                    payment.PaidDate
                    ?? DateTime.UtcNow;


                // -------------------------------------------------
                // Generate Invoice PDF
                // -------------------------------------------------

                byte[] invoiceBytes =
                    _bookInvoiceService
                        .GenerateBookInvoice(
                            order,
                            paymentMethod,
                            request.RazorpayPaymentId,
                            paymentDate);


                // -------------------------------------------------
                // Email Body
                // -------------------------------------------------

                string customerName =
                    string.IsNullOrWhiteSpace(
                        order.CustomerName)
                            ? "Customer"
                            : order.CustomerName;


                string emailBody = $@"
<html>
<body style='font-family: Arial, sans-serif; color: #333;'>

    <div style='max-width: 600px; margin: auto;'>

        <h2 style='text-align: center;'>
            The Old Library
        </h2>

        <h3>
            Order Confirmation
        </h3>

        <p>
            Dear <strong>{customerName}</strong>,
        </p>

        <p>
            Thank you for your purchase from
            <strong>The Old Library</strong>.
        </p>

        <p>
            Your book order has been successfully
            paid and confirmed.
        </p>

        <table style='width: 100%; border-collapse: collapse;'>

            <tr>
                <td style='padding: 8px;'>
                    <strong>Order ID</strong>
                </td>
                <td style='padding: 8px;'>
                    {order.OrderId}
                </td>
            </tr>

            <tr>
                <td style='padding: 8px;'>
                    <strong>Invoice No</strong>
                </td>
                <td style='padding: 8px;'>
                    INV-{order.OrderId:D6}
                </td>
            </tr>

            <tr>
                <td style='padding: 8px;'>
                    <strong>Order Type</strong>
                </td>
                <td style='padding: 8px;'>
                    {(order.UserId.HasValue
                        ? "Registered Customer"
                        : "Guest Customer")}
                </td>
            </tr>

            <tr>
                <td style='padding: 8px;'>
                    <strong>Amount Paid</strong>
                </td>
                <td style='padding: 8px;'>
                    ₹{order.TotalAmount:F2}
                </td>
            </tr>

            <tr>
                <td style='padding: 8px;'>
                    <strong>Payment Method</strong>
                </td>
                <td style='padding: 8px;'>
                    {paymentMethod ?? "N/A"}
                </td>
            </tr>

            <tr>
                <td style='padding: 8px;'>
                    <strong>Payment ID</strong>
                </td>
                <td style='padding: 8px;'>
                    {request.RazorpayPaymentId}
                </td>
            </tr>

            <tr>
                <td style='padding: 8px;'>
                    <strong>Payment Status</strong>
                </td>
                <td style='padding: 8px;'>
                    Paid
                </td>
            </tr>

            <tr>
                <td style='padding: 8px;'>
                    <strong>Order Status</strong>
                </td>
                <td style='padding: 8px;'>
                    {order.OrderStatus}
                </td>
            </tr>

        </table>

        <p>
            Your official invoice is attached to this email
            as a PDF document.
        </p>

        <p>
            Please keep the invoice for your records.
        </p>

        <p>
            Your order will be processed for delivery
            to the shipping address provided during checkout.
        </p>

        <p>
            Thank you for shopping with us.
        </p>

        <p>
            Regards,<br/>
            <strong>The Old Library</strong>
        </p>

    </div>

</body>
</html>";


                // -------------------------------------------------
                // Send Invoice Email
                // -------------------------------------------------

                if (!string.IsNullOrWhiteSpace(
                    order.CustomerEmail))
                {
                    await _emailService.SendEmailAsync(
                        order.CustomerEmail,
                        "The Old Library - Book Order Invoice",
                        emailBody,
                        true,
                        invoiceBytes,
                        $"Book-Invoice-{order.OrderId}.pdf");
                }
            }
            catch (Exception ex)
            {
                // =============================================
                // IMPORTANT
                // =============================================
                //
                // Do NOT change payment/order status to failed.
                //
                // Payment was already successfully verified
                // and database transaction was committed.
                //
                // Only the email/invoice failed.
                // =============================================

                Console.WriteLine(
                    $"Book invoice email failed: {ex.Message}");
            }


            // =====================================================
            // FINAL RESPONSE
            // =====================================================

            return (
                true,
                "Payment verified successfully. " +
                "Order confirmed, stock updated, cart cleared " +
                "and invoice email processed."
            );
        }
    }
}