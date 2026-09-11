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
            // 1. GET STORY / POETRY / SPECIAL SUBMISSION
            // -----------------------------------------------------

            var storyPoetry =
                await _storyPoetryRepository
                    .GetByIdAsync(request.StoryPoetryId);

            if (storyPoetry == null)
            {
                return null;
            }


            // -----------------------------------------------------
            // 2. CHECK OWNERSHIP
            // -----------------------------------------------------

            if (storyPoetry.UserId != userId)
            {
                throw new UnauthorizedAccessException(
                    "You can only make payment for your own submission.");
            }


            // -----------------------------------------------------
            // 3. VALIDATE EXTRA COPIES
            // -----------------------------------------------------

            if (request.ExtraCopies < 0)
            {
                throw new ArgumentException(
                    "Extra copies cannot be negative.");
            }


            // -----------------------------------------------------
            // 4. CHECK PAYMENT STATUS
            // -----------------------------------------------------

            if (storyPoetry.PaymentStatus == "Paid")
            {
                throw new InvalidOperationException(
                    "Payment for this Story/Poetry has already been completed.");
            }


            // -----------------------------------------------------
            // 5. CHECK PAYMENT ENABLED TIME
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
            // 6. GET EXISTING PAYMENTS
            // -----------------------------------------------------

            var payments =
                await _paymentRepository.GetAllAsync();


            // -----------------------------------------------------
            // 7. CHECK EXISTING PAID PAYMENT
            // -----------------------------------------------------

            var existingPaidPayment =
                payments.FirstOrDefault(
                    p =>
                        p.StoryPoetryId ==
                        request.StoryPoetryId &&
                        p.Status == "Paid");

            if (existingPaidPayment != null)
            {
                throw new InvalidOperationException(
                    "Payment for this Story/Poetry has already been completed.");
            }


            // -----------------------------------------------------
            // 8. CHECK EXISTING PENDING PAYMENT
            // -----------------------------------------------------

            var existingPendingPayment =
                payments.FirstOrDefault(
                    p =>
                        p.StoryPoetryId ==
                        request.StoryPoetryId &&
                        p.Status == "Pending");

            if (existingPendingPayment != null)
            {
                throw new InvalidOperationException(
                    "A payment order is already pending for this Story/Poetry submission.");
            }


            // -----------------------------------------------------
            // 9. GET ACTIVE PAYMENT SETTING
            // -----------------------------------------------------

            var paymentSetting =
                await _paymentSettingsService
                    .GetActiveAsync(storyPoetry.Type);

            if (paymentSetting == null)
            {
                throw new InvalidOperationException(
                    "Active StoryPoetry payment setting not found.");
            }


            // -----------------------------------------------------
            // 10. GET BASE AMOUNT
            // -----------------------------------------------------

            decimal baseAmount =
                paymentSetting.Amount;

            if (baseAmount <= 0)
            {
                throw new InvalidOperationException(
                    "Invalid StoryPoetry base payment amount.");
            }


            // -----------------------------------------------------
            // 11. GET EXTRA COPY PRICE
            // -----------------------------------------------------

            decimal extraCopyPrice =
                storyPoetry.ExtraCopyPrice;

            if (extraCopyPrice < 0)
            {
                throw new InvalidOperationException(
                    "Invalid extra copy price.");
            }


            // -----------------------------------------------------
            // 12. CALCULATE EXTRA COPY AMOUNT
            // -----------------------------------------------------

            decimal extraCopyAmount =
                request.ExtraCopies *
                extraCopyPrice;


            // -----------------------------------------------------
            // 13. CALCULATE TOTAL PAYMENT AMOUNT
            // -----------------------------------------------------

            decimal totalAmount =
                baseAmount +
                extraCopyAmount;

            if (totalAmount <= 0)
            {
                throw new InvalidOperationException(
                    "Invalid StoryPoetry payment amount.");
            }


            // -----------------------------------------------------
            // 14. CALCULATE TOTAL COPIES
            // -----------------------------------------------------

            const int freeCopies = 2;

            int totalCopies =
                freeCopies +
                request.ExtraCopies;


            // =====================================================
            // UPDATE STORY / POETRY PAYMENT + COPY DETAILS
            // =====================================================

            storyPoetry.BaseAmount =
                baseAmount;

            storyPoetry.ExtraCopies =
                request.ExtraCopies;

            // Free copies are always fixed at 2.
            storyPoetry.FreeCopies =
                freeCopies;

            storyPoetry.ExtraCopyPrice =
                extraCopyPrice;

            storyPoetry.TotalCopies =
                totalCopies;

            storyPoetry.Amount =
                totalAmount;

            storyPoetry.UpdatedDate =
                DateTime.UtcNow;


            // -----------------------------------------------------
            // 15. CONVERT RUPEES TO PAISE
            // -----------------------------------------------------

            decimal amountInPaiseDecimal =
                totalAmount * 100;

            if (amountInPaiseDecimal >
                int.MaxValue)
            {
                throw new InvalidOperationException(
                    "Payment amount is too large.");
            }

            int amountInPaise =
                (int)amountInPaiseDecimal;


            // -----------------------------------------------------
            // 16. CREATE RAZORPAY CLIENT
            // -----------------------------------------------------

            Razorpay.Api.RazorpayClient client =
                new Razorpay.Api.RazorpayClient(
                    _razorpaySettings.KeyId,
                    _razorpaySettings.KeySecret);


            // -----------------------------------------------------
            // 17. RAZORPAY ORDER OPTIONS
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
            // 18. CREATE RAZORPAY ORDER
            // -----------------------------------------------------

            Razorpay.Api.Order order =
                client.Order.Create(options);


            // -----------------------------------------------------
            // 19. CREATE PAYMENT RECORD
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
            // 20. SAVE PAYMENT
            // -----------------------------------------------------

            var createdPayment =
                await _paymentRepository
                    .AddAsync(payment);


            // -----------------------------------------------------
            // 21. SAVE STORY / POETRY
            // -----------------------------------------------------

            await _storyPoetryRepository
                .UpdateAsync(storyPoetry);


            // -----------------------------------------------------
            // 22. RETURN RESPONSE
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
            // 1. GET LOCAL PAYMENT
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
            // 2. MAKE SURE THIS IS STORY / POETRY PAYMENT
            // -----------------------------------------------------

            if (payment.StoryPoetryId == null)
            {
                throw new InvalidOperationException(
                    "This payment is not linked to a Story/Poetry submission.");
            }


            // -----------------------------------------------------
            // 3. CHECK USER
            // -----------------------------------------------------

            if (payment.UserId != userId)
            {
                throw new UnauthorizedAccessException(
                    "You can only verify your own payment.");
            }


            // -----------------------------------------------------
            // 4. PREVENT RE-PROCESSING
            // -----------------------------------------------------

            if (payment.Status == "Paid")
            {
                throw new InvalidOperationException(
                    "This payment has already been completed.");
            }


            // -----------------------------------------------------
            // 5. VALIDATE RAZORPAY ORDER ID
            // -----------------------------------------------------

            if (string.IsNullOrWhiteSpace(
                request.RazorpayOrderId))
            {
                throw new InvalidOperationException(
                    "Razorpay Order ID is required.");
            }

            if (payment.RazorpayOrderId !=
                request.RazorpayOrderId)
            {
                throw new InvalidOperationException(
                    "Razorpay Order ID does not match.");
            }


            // -----------------------------------------------------
            // 6. VALIDATE RAZORPAY PAYMENT ID
            // -----------------------------------------------------

            if (string.IsNullOrWhiteSpace(
                request.RazorpayPaymentId))
            {
                throw new InvalidOperationException(
                    "Razorpay Payment ID is required.");
            }


            // -----------------------------------------------------
            // 7. VALIDATE RAZORPAY SIGNATURE
            // -----------------------------------------------------

            if (string.IsNullOrWhiteSpace(
                request.RazorpaySignature))
            {
                throw new InvalidOperationException(
                    "Razorpay Signature is required.");
            }


            // -----------------------------------------------------
            // 8. CREATE SIGNATURE PAYLOAD
            // -----------------------------------------------------

            string payload =
                request.RazorpayOrderId +
                "|" +
                request.RazorpayPaymentId;


            // -----------------------------------------------------
            // 9. GENERATE EXPECTED SIGNATURE
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
            // 10. SECURE SIGNATURE COMPARISON
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
                throw new InvalidOperationException(
                    "Invalid Razorpay payment signature.");
            }


            // =====================================================
            // PAYMENT VERIFIED SUCCESSFULLY
            // =====================================================


            // -----------------------------------------------------
            // 11. GET STORY / POETRY / SPECIAL
            // -----------------------------------------------------

            var storyPoetry =
                await _storyPoetryRepository
                    .GetByIdAsync(
                        payment.StoryPoetryId.Value);

            if (storyPoetry == null)
            {
                throw new InvalidOperationException(
                    "Story/Poetry submission not found.");
            }


            // -----------------------------------------------------
            // 12. CHECK OWNERSHIP AGAIN
            // -----------------------------------------------------

            if (storyPoetry.UserId != userId)
            {
                throw new UnauthorizedAccessException(
                    "Payment does not belong to this submission.");
            }


            // -----------------------------------------------------
            // 13. CHECK PAYMENT ENABLED TIME
            // -----------------------------------------------------

            if (storyPoetry.PaymentEnabledAt.HasValue &&
                storyPoetry.PaymentEnabledAt.Value > DateTime.UtcNow)
            {
                throw new InvalidOperationException(
                    "Payment is not available yet. Please wait until the payment time.");
            }


            // -----------------------------------------------------
            // 14. GET PAYMENT METHOD FROM RAZORPAY
            // -----------------------------------------------------

            string? paymentMethod =
                GetRazorpayPaymentMethod(
                    request.RazorpayPaymentId);


            // -----------------------------------------------------
            // 15. UPDATE PAYMENT
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
            // 16. UPDATE STORY / POETRY PAYMENT STATUS
            // -----------------------------------------------------

            storyPoetry.PaymentStatus =
                "Paid";

            storyPoetry.UpdatedDate =
                DateTime.UtcNow;


            // -----------------------------------------------------
            // 17. SAVE UPDATED PAYMENT
            // -----------------------------------------------------

            var updatedPayment =
                await _paymentRepository
                    .UpdateAsync(payment);

            if (updatedPayment == null)
            {
                return null;
            }


            // -----------------------------------------------------
            // 18. SAVE UPDATED STORY / POETRY
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
                    // -------------------------------------------------

                    string submissionType =
                        storyPoetry.Type;


                    // -------------------------------------------------
                    // GENERATE PDF RECEIPT
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
    storyPoetry.FreeCopies,
    storyPoetry.ExtraCopies,
    storyPoetry.ExtraCopyPrice,
    storyPoetry.TotalCopies,
    storyPoetry.BaseAmount,
    payment.Amount,
    paymentMethod,
    request.RazorpayPaymentId,
                                DateTime.UtcNow);


                    // -------------------------------------------------
                    // PROFESSIONAL EMAIL
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
                    <strong>Particular</strong>
                </td>
                <td style='padding: 8px;'>
                    {storyPoetry.ParticularNameSnapshot}
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
                    <strong>Free Copies</strong>
                </td>
                <td style='padding: 8px;'>
                    {storyPoetry.FreeCopies}
                </td>
            </tr>

            <tr>
                <td style='padding: 8px;'>
                    <strong>Extra Copies</strong>
                </td>
                <td style='padding: 8px;'>
                    {storyPoetry.ExtraCopies}
                </td>
            </tr>

            <tr>
                <td style='padding: 8px;'>
                    <strong>Total Copies</strong>
                </td>
                <td style='padding: 8px;'>
                    {storyPoetry.TotalCopies}
                </td>
            </tr>

            <tr>
                <td style='padding: 8px;'>
                    <strong>Base Amount</strong>
                </td>
                <td style='padding: 8px;'>
                    ₹{storyPoetry.BaseAmount:F2}
                </td>
            </tr>

            <tr>
                <td style='padding: 8px;'>
                    <strong>Extra Copy Price</strong>
                </td>
                <td style='padding: 8px;'>
                    ₹{storyPoetry.ExtraCopyPrice:F2}
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
                    // SEND EMAIL WITH PDF ATTACHMENT
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
            // 20. RETURN RESPONSE
            // -----------------------------------------------------

            return MapToResponse(
                updatedPayment);
        }

        // =========================================================
        // CANCEL RAZORPAY PAYMENT
        // =========================================================

        public async Task<PaymentResponseDto?>
            CancelPaymentAsync(
                int paymentId,
                int userId)
        {
            // -----------------------------------------------------
            // 1. GET PAYMENT
            // -----------------------------------------------------

            var payment =
                await _paymentRepository
                    .GetByIdAsync(paymentId);

            if (payment == null)
            {
                return null;
            }


            // -----------------------------------------------------
            // 2. MAKE SURE THIS IS STORY / POETRY PAYMENT
            // -----------------------------------------------------

            if (payment.StoryPoetryId == null)
            {
                throw new InvalidOperationException(
                    "This payment is not linked to a Story/Poetry submission.");
            }


            // -----------------------------------------------------
            // 3. CHECK USER OWNERSHIP
            // -----------------------------------------------------

            if (payment.UserId != userId)
            {
                throw new UnauthorizedAccessException(
                    "You can only cancel your own payment.");
            }


            // -----------------------------------------------------
            // 4. GET STORY / POETRY / SPECIAL SUBMISSION
            // -----------------------------------------------------

            var storyPoetry =
                await _storyPoetryRepository
                    .GetByIdAsync(
                        payment.StoryPoetryId.Value);

            if (storyPoetry == null)
            {
                throw new InvalidOperationException(
                    "Story/Poetry submission not found.");
            }


            // -----------------------------------------------------
            // 5. VERIFY PAYMENT TYPE
            // -----------------------------------------------------

            if (storyPoetry.Type != "Story" &&
                storyPoetry.Type != "Poetry" &&
                storyPoetry.Type != "Special")
            {
                throw new InvalidOperationException(
                    "This payment cannot be cancelled through Story/Poetry payment.");
            }


            // -----------------------------------------------------
            // 6. ONLY PENDING PAYMENTS CAN BE CANCELLED
            // -----------------------------------------------------

            if (payment.Status != "Pending")
            {
                throw new InvalidOperationException(
                    $"Only Pending payments can be cancelled. Current status: {payment.Status}.");
            }


            // -----------------------------------------------------
            // 7. CHANGE STATUS
            // -----------------------------------------------------

            payment.Status =
                "Cancelled";


            // -----------------------------------------------------
            // 8. SAVE PAYMENT
            // -----------------------------------------------------

            var updatedPayment =
                await _paymentRepository
                    .UpdateAsync(payment);

            if (updatedPayment == null)
            {
                return null;
            }


            // -----------------------------------------------------
            // 9. RETURN UPDATED PAYMENT
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