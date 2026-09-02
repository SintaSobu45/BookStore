using BookStore.Server.DTOs.Payment;
using BookStore.Server.Helpers;
using BookStore.Server.Models;
using BookStore.Server.Repositories;
using Microsoft.Extensions.Options;
using System.Security.Cryptography;
using System.Text;

namespace BookStore.Server.Services
{
    public class StoryPoetryPaymentService
    {
        private readonly PaymentRepository _paymentRepository;
        private readonly StoryPoetryRepository _storyPoetryRepository;
        private readonly PaymentSettingsService _paymentSettingsService;
        private readonly RazorpaySettings _razorpaySettings;
        private readonly EmailService _emailService;
        private readonly PaymentReceiptService _paymentReceiptService;

        public StoryPoetryPaymentService(
            PaymentRepository paymentRepository,
            StoryPoetryRepository storyPoetryRepository,
            PaymentSettingsService paymentSettingsService,
            IOptions<RazorpaySettings> razorpayOptions,
            EmailService emailService,
            PaymentReceiptService paymentReceiptService)
        {
            _paymentRepository = paymentRepository;
            _storyPoetryRepository = storyPoetryRepository;
            _paymentSettingsService = paymentSettingsService;
            _razorpaySettings = razorpayOptions.Value;
            _emailService = emailService;
            _paymentReceiptService = paymentReceiptService;
        }


        // =========================================================
        // CREATE RAZORPAY PAYMENT
        // =========================================================

        public async Task<PaymentResponseDto?>
            CreatePaymentAsync(
                CreateStoryPoetryPaymentRequest request,
                int userId)
        {
            // -----------------------------------------------------
            // 1. Get Story / Poetry / Special submission
            // -----------------------------------------------------

            var storyPoetry =
                await _storyPoetryRepository
                    .GetByIdAsync(request.StoryPoetryId);

            if (storyPoetry == null)
            {
                return null;
            }


            // -----------------------------------------------------
            // 2. Check Ownership
            // -----------------------------------------------------

            if (storyPoetry.UserId != userId)
            {
                throw new UnauthorizedAccessException(
                    "You can only make payment for your own submission.");
            }


            // -----------------------------------------------------
            // 3. Check 4-Hour Payment Restriction
            // -----------------------------------------------------

            if (storyPoetry.PaymentEnabledAt.HasValue &&
                storyPoetry.PaymentEnabledAt.Value > DateTime.UtcNow)
            {
                var remaining =
                    storyPoetry.PaymentEnabledAt.Value -
                    DateTime.UtcNow;

                var totalMinutes =
                    Math.Max(
                        0,
                        (int)Math.Ceiling(
                            remaining.TotalMinutes));

                var hours =
                    totalMinutes / 60;

                var minutes =
                    totalMinutes % 60;

                string message;

                if (hours > 0)
                {
                    message =
                        $"Payment will be available after {hours} hour(s) and {minutes} minute(s).";
                }
                else
                {
                    message =
                        $"Payment will be available after {minutes} minute(s).";
                }

                throw new InvalidOperationException(message);
            }


            // -----------------------------------------------------
            // 4. Check Existing Paid Payment
            // -----------------------------------------------------

            var payments =
                await _paymentRepository.GetAllAsync();

            var existingPaidPayment =
                payments.FirstOrDefault(
                    p =>
                        p.StoryPoetryId ==
                        request.StoryPoetryId &&
                        p.Status == "Paid");

            if (existingPaidPayment != null)
            {
                throw new Exception(
                    "Payment for this Story/Poetry has already been completed.");
            }


            // -----------------------------------------------------
            // 5. Get Active Payment Setting
            // -----------------------------------------------------

            var paymentSetting =
                await _paymentSettingsService
                    .GetActiveAsync(storyPoetry.Type);

            if (paymentSetting == null)
            {
                throw new Exception(
                    "Active StoryPoetry payment setting not found.");
            }


            // -----------------------------------------------------
            // 6. Get Payment Amount
            // -----------------------------------------------------

            decimal totalAmount =
                paymentSetting.Amount;

            if (totalAmount <= 0)
            {
                throw new Exception(
                    "Invalid StoryPoetry payment amount.");
            }


            // -----------------------------------------------------
            // 7. Convert Rupees To Paise
            // -----------------------------------------------------

            int amountInPaise =
                (int)(totalAmount * 100);


            // -----------------------------------------------------
            // 8. Create Razorpay Client
            // -----------------------------------------------------

            Razorpay.Api.RazorpayClient client =
                new Razorpay.Api.RazorpayClient(
                    _razorpaySettings.KeyId,
                    _razorpaySettings.KeySecret);


            // -----------------------------------------------------
            // 9. Razorpay Order Options
            // -----------------------------------------------------

            Dictionary<string, object> options =
                new Dictionary<string, object>
                {
                    {
                        "amount",
                        amountInPaise
                    },
                    {
                        "currency",
                        "INR"
                    },
                    {
                        "receipt",
                        $"STORY_{storyPoetry.StoryPoetryId}"
                    }
                };


            // -----------------------------------------------------
            // 10. Create Razorpay Order
            // -----------------------------------------------------

            Razorpay.Api.Order order =
                client.Order.Create(options);


            // -----------------------------------------------------
            // 11. Create Payment Record
            // -----------------------------------------------------

            var payment =
                new Payment
                {
                    UserId =
                        userId,

                    StoryPoetryId =
                        storyPoetry.StoryPoetryId,

                    EventRegistrationId =
                        null,

                    Amount =
                        totalAmount,

                    PaymentType =
                        "Razorpay",

                    PaymentMethod =
                        null,

                    Status =
                        "Pending",

                    RazorpayOrderId =
                        order["id"]?.ToString(),

                    CreatedDate =
                        DateTime.UtcNow
                };


            // -----------------------------------------------------
            // 12. Save Payment
            // -----------------------------------------------------

            var createdPayment =
                await _paymentRepository
                    .AddAsync(payment);


            // -----------------------------------------------------
            // 13. Return Response
            // -----------------------------------------------------

            return MapToResponse(
                createdPayment);
        }


        // =========================================================
        // VERIFY RAZORPAY PAYMENT
        // =========================================================

        public async Task<PaymentResponseDto?>
            VerifyPaymentAsync(
                RazorpayPaymentVerificationRequest request,
                int userId)
        {
            // -----------------------------------------------------
            // 1. Get Local Payment
            // -----------------------------------------------------

            var payment =
                await _paymentRepository
                    .GetByIdAsync(
                        request.PaymentId);

            if (payment == null)
            {
                return null;
            }


            // -----------------------------------------------------
            // 2. Make Sure This Is Story / Poetry / Special Payment
            // -----------------------------------------------------

            if (payment.StoryPoetryId == null)
            {
                throw new Exception(
                    "This payment is not linked to a Story/Poetry submission.");
            }


            // -----------------------------------------------------
            // 3. Check User
            // -----------------------------------------------------

            if (payment.UserId != userId)
            {
                throw new UnauthorizedAccessException(
                    "You can only verify your own payment.");
            }


            // -----------------------------------------------------
            // 4. Prevent Re-processing
            // -----------------------------------------------------

            if (payment.Status == "Paid")
            {
                throw new Exception(
                    "This payment has already been completed.");
            }


            // -----------------------------------------------------
            // 5. Validate Razorpay Order ID
            // -----------------------------------------------------

            if (string.IsNullOrWhiteSpace(
                request.RazorpayOrderId))
            {
                throw new Exception(
                    "Razorpay Order ID is required.");
            }

            if (payment.RazorpayOrderId !=
                request.RazorpayOrderId)
            {
                throw new Exception(
                    "Razorpay Order ID does not match.");
            }


            // -----------------------------------------------------
            // 6. Validate Razorpay Payment ID
            // -----------------------------------------------------

            if (string.IsNullOrWhiteSpace(
                request.RazorpayPaymentId))
            {
                throw new Exception(
                    "Razorpay Payment ID is required.");
            }


            // -----------------------------------------------------
            // 7. Validate Razorpay Signature
            // -----------------------------------------------------

            if (string.IsNullOrWhiteSpace(
                request.RazorpaySignature))
            {
                throw new Exception(
                    "Razorpay Signature is required.");
            }


            // -----------------------------------------------------
            // 8. Create Signature Payload
            // -----------------------------------------------------

            string payload =
                request.RazorpayOrderId +
                "|" +
                request.RazorpayPaymentId;


            // -----------------------------------------------------
            // 9. Generate Expected Signature
            // -----------------------------------------------------

            using var hmac =
                new HMACSHA256(
                    Encoding.UTF8.GetBytes(
                        _razorpaySettings.KeySecret));

            byte[] hash =
                hmac.ComputeHash(
                    Encoding.UTF8.GetBytes(
                        payload));


            string generatedSignature =
                Convert.ToHexString(hash)
                    .ToLowerInvariant();


            // -----------------------------------------------------
            // 10. Secure Signature Comparison
            // -----------------------------------------------------

            bool signatureValid =
                CryptographicOperations.FixedTimeEquals(
                    Encoding.UTF8.GetBytes(
                        generatedSignature),

                    Encoding.UTF8.GetBytes(
                        request.RazorpaySignature
                            .ToLowerInvariant()));


            if (!signatureValid)
            {
                throw new Exception(
                    "Invalid Razorpay payment signature.");
            }


            // =====================================================
            // PAYMENT VERIFIED SUCCESSFULLY
            // =====================================================


            // -----------------------------------------------------
            // 11. Get Story / Poetry / Special
            // -----------------------------------------------------

            var storyPoetry =
                await _storyPoetryRepository
                    .GetByIdAsync(
                        payment.StoryPoetryId.Value);

            if (storyPoetry == null)
            {
                throw new Exception(
                    "Story/Poetry submission not found.");
            }


            // -----------------------------------------------------
            // 12. Check Ownership Again
            // -----------------------------------------------------

            if (storyPoetry.UserId != userId)
            {
                throw new UnauthorizedAccessException(
                    "Payment does not belong to this submission.");
            }


            // -----------------------------------------------------
            // 13. Check 4-Hour Payment Restriction
            // -----------------------------------------------------

            if (storyPoetry.PaymentEnabledAt.HasValue &&
                storyPoetry.PaymentEnabledAt.Value > DateTime.UtcNow)
            {
                throw new InvalidOperationException(
                    "Payment is not available yet. Please wait until the payment time.");
            }


            // -----------------------------------------------------
            // 14. Get Payment Method From Razorpay
            // -----------------------------------------------------

            string? paymentMethod =
                GetRazorpayPaymentMethod(
                    request.RazorpayPaymentId);


            // -----------------------------------------------------
            // 15. Update Payment
            // -----------------------------------------------------

            payment.RazorpayPaymentId =
                request.RazorpayPaymentId;

            payment.RazorpaySignature =
                request.RazorpaySignature;

            payment.PaymentMethod =
                paymentMethod;

            payment.Status =
                "Paid";

            payment.PaidDate =
                DateTime.UtcNow;


            // -----------------------------------------------------
            // 16. Update Story / Poetry Payment Status
            // -----------------------------------------------------

            storyPoetry.PaymentStatus =
                "Paid";

            storyPoetry.UpdatedDate =
                DateTime.UtcNow;


            // -----------------------------------------------------
            // 17. Save Updated Payment
            // -----------------------------------------------------

            var updatedPayment =
                await _paymentRepository
                    .UpdateAsync(payment);

            if (updatedPayment == null)
            {
                return null;
            }


            // -----------------------------------------------------
            // 18. Save Updated Story / Poetry
            // -----------------------------------------------------

            await _storyPoetryRepository
                .UpdateAsync(storyPoetry);


            // =====================================================
            // 19. GENERATE RECEIPT + SEND EMAIL
            // =====================================================

            if (storyPoetry.User != null &&
                !string.IsNullOrWhiteSpace(
                    storyPoetry.User.Email))
            {
                try
                {
                    // -------------------------------------------------
                    // TYPE COMES DIRECTLY FROM DATABASE
                    //
                    // Story
                    // Poetry
                    // Special
                    // -------------------------------------------------

                    string submissionType =
                        storyPoetry.Type;


                    // -------------------------------------------------
                    // Generate PDF Receipt
                    // -------------------------------------------------

                    byte[] pdfBytes =
                        _paymentReceiptService
                            .GenerateStoryPoetryPaymentReceipt(
                                storyPoetry.StoryPoetryId,
                                storyPoetry.User.Name,
                                storyPoetry.User.Email,
                                submissionType,
                                storyPoetry.Title,
                                storyPoetry.ContributorNameMalayalam,
                                storyPoetry.ContributorEmail,
                                storyPoetry.ContributorPhone,
                                payment.Amount,
                                paymentMethod,
                                request.RazorpayPaymentId,
                                DateTime.UtcNow);


                    // -------------------------------------------------
                    // Professional Email
                    // -------------------------------------------------

                    string emailBody = $@"
<html>
<body style='font-family: Arial, sans-serif; color: #333;'>

    <div style='max-width: 600px; margin: auto;'>

        <h2 style='text-align: center;'>
            The Old Library
        </h2>

        <h3>
            Payment Confirmation
        </h3>

        <p>
            Dear <strong>{storyPoetry.User.Name}</strong>,
        </p>

        <p>
            Your payment for the following submission has been
            successfully completed.
        </p>

        <table style='width: 100%; border-collapse: collapse;'>

            <tr>
                <td style='padding: 8px;'>
                    <strong>Submission Type</strong>
                </td>
                <td style='padding: 8px;'>
                    {submissionType}
                </td>
            </tr>

            <tr>
                <td style='padding: 8px;'>
                    <strong>Title</strong>
                </td>
                <td style='padding: 8px;'>
                    {storyPoetry.Title}
                </td>
            </tr>

            <tr>
                <td style='padding: 8px;'>
                    <strong>Amount Paid</strong>
                </td>
                <td style='padding: 8px;'>
                    ₹{payment.Amount:F2}
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

        </table>

        <p>
            Your official payment receipt is attached to this email
            as a PDF document.
        </p>

        <p>
            Please keep the receipt for your records.
        </p>

        <p>
            Thank you for your submission.
        </p>

        <p>
            Regards,<br/>
            <strong>The Old Library</strong>
        </p>

    </div>

</body>
</html>";


                    // -------------------------------------------------
                    // Send Email With PDF Attachment
                    // -------------------------------------------------

                    await _emailService.SendEmailAsync(
                        storyPoetry.User.Email,
                        "The Old Library - Payment Receipt",
                        emailBody,
                        true,
                        pdfBytes,
                        $"StoryPoetry-Payment-Receipt-{storyPoetry.StoryPoetryId}.pdf");
                }
                catch (Exception ex)
                {
                    // Payment remains successful even if email fails.
                    Console.WriteLine(
                        $"Story/Poetry payment receipt email failed: {ex.Message}");
                }
            }


            // -----------------------------------------------------
            // 20. Return Response
            // -----------------------------------------------------

            return MapToResponse(
                updatedPayment);
        }


        // =========================================================
        // GET PAYMENT METHOD FROM RAZORPAY
        // =========================================================

        private string? GetRazorpayPaymentMethod(
            string razorpayPaymentId)
        {
            Razorpay.Api.RazorpayClient client =
                new Razorpay.Api.RazorpayClient(
                    _razorpaySettings.KeyId,
                    _razorpaySettings.KeySecret);


            Razorpay.Api.Payment razorpayPayment =
                client.Payment.Fetch(
                    razorpayPaymentId);


            return razorpayPayment["method"]?.ToString();
        }


        // =========================================================
        // MAP PAYMENT TO RESPONSE DTO
        // =========================================================

        private static PaymentResponseDto MapToResponse(
            Payment payment)
        {
            return new PaymentResponseDto
            {
                PaymentId =
                    payment.PaymentId,

                UserId =
                    payment.UserId,

                StoryPoetryId =
                    payment.StoryPoetryId,

                EventRegistrationId =
                    payment.EventRegistrationId,

                Amount =
                    payment.Amount,

                PaymentType =
                    payment.PaymentType,

                PaymentMethod =
                    payment.PaymentMethod,

                Status =
                    payment.Status,

                RazorpayOrderId =
                    payment.RazorpayOrderId,

                RazorpayPaymentId =
                    payment.RazorpayPaymentId,

                RazorpaySignature =
                    payment.RazorpaySignature,

                CreatedDate =
                    payment.CreatedDate,

                PaidDate =
                    payment.PaidDate
            };
        }
    }
}