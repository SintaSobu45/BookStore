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

        public StoryPoetryPaymentService(
            PaymentRepository paymentRepository,
            StoryPoetryRepository storyPoetryRepository,
            PaymentSettingsService paymentSettingsService,
            IOptions<RazorpaySettings> razorpayOptions)
        {
            _paymentRepository = paymentRepository;
            _storyPoetryRepository = storyPoetryRepository;
            _paymentSettingsService = paymentSettingsService;
            _razorpaySettings = razorpayOptions.Value;
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
            // 1. Get Story / Poetry
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
            // 3. Check Existing Paid Payment
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
            // 4. Get Active Payment Setting
            // -----------------------------------------------------

            var paymentSetting =
                await _paymentSettingsService
                    .GetActiveAsync("StoryPoetry");

            if (paymentSetting == null)
            {
                throw new Exception(
                    "Active StoryPoetry payment setting not found.");
            }


            // -----------------------------------------------------
            // 5. Get Payment Amount
            // -----------------------------------------------------

            decimal totalAmount =
                paymentSetting.Amount;

            if (totalAmount <= 0)
            {
                throw new Exception(
                    "Invalid StoryPoetry payment amount.");
            }


            // -----------------------------------------------------
            // 6. Convert Rupees To Paise
            // -----------------------------------------------------

            int amountInPaise =
                (int)(totalAmount * 100);


            // -----------------------------------------------------
            // 7. Create Razorpay Client
            // -----------------------------------------------------

            Razorpay.Api.RazorpayClient client =
                new Razorpay.Api.RazorpayClient(
                    _razorpaySettings.KeyId,
                    _razorpaySettings.KeySecret);


            // -----------------------------------------------------
            // 8. Razorpay Order Options
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
            // 9. Create Razorpay Order
            // -----------------------------------------------------

            Razorpay.Api.Order order =
                client.Order.Create(options);


            // -----------------------------------------------------
            // 10. Create Payment Record
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
            // 11. Save Payment
            // -----------------------------------------------------

            var createdPayment =
                await _paymentRepository
                    .AddAsync(payment);


            // -----------------------------------------------------
            // 12. Return Response
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
            // 2. Make Sure This Is Story / Poetry Payment
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
            // 11. Get Story / Poetry
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
            // 13. Get Payment Method From Razorpay
            // -----------------------------------------------------

            string? paymentMethod =
                GetRazorpayPaymentMethod(
                    request.RazorpayPaymentId);


            // -----------------------------------------------------
            // 14. Update Payment
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
            // 15. Update Story / Poetry Payment Status
            // -----------------------------------------------------

            storyPoetry.PaymentStatus =
                "Paid";

            storyPoetry.UpdatedDate =
                DateTime.UtcNow;


            // -----------------------------------------------------
            // 16. Save Updated Payment
            // -----------------------------------------------------

            var updatedPayment =
                await _paymentRepository
                    .UpdateAsync(payment);

            if (updatedPayment == null)
            {
                return null;
            }


            // -----------------------------------------------------
            // 17. Save Updated Story / Poetry
            // -----------------------------------------------------

            await _storyPoetryRepository
                .UpdateAsync(storyPoetry);


            // -----------------------------------------------------
            // 18. Return Response
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