using BookStore.Server.DTOs.Payment;
using BookStore.Server.Helpers;
using BookStore.Server.Repositories;
using Microsoft.Extensions.Options;
using System.Security.Cryptography;
using System.Text;

namespace BookStore.Server.Services
{
    public class PaymentService
    {
        private readonly PaymentRepository _paymentRepository;
        private readonly EventRegistrationRepository _eventRegistrationRepository;
        private readonly RazorpaySettings _razorpaySettings;

        public PaymentService(
            PaymentRepository paymentRepository,
            EventRegistrationRepository eventRegistrationRepository,
            IOptions<RazorpaySettings> razorpayOptions)
        {
            _paymentRepository = paymentRepository;
            _eventRegistrationRepository = eventRegistrationRepository;
            _razorpaySettings = razorpayOptions.Value;
        }


        // =========================================================
        // GET ALL PAYMENTS
        // ADMIN ONLY
        // =========================================================

        public async Task<List<PaymentResponseDto>> GetAllAsync()
        {
            var payments =
                await _paymentRepository.GetAllAsync();

            return payments.Select(p => new PaymentResponseDto
            {
                PaymentId = p.PaymentId,
                UserId = p.UserId,
                StoryPoetryId = p.StoryPoetryId,
                EventRegistrationId = p.EventRegistrationId,
               
                Amount = p.Amount,
                PaymentType = p.PaymentType,
                PaymentMethod = p.PaymentMethod,
                Status = p.Status,
                RazorpayOrderId = p.RazorpayOrderId,
                RazorpayPaymentId = p.RazorpayPaymentId,
                RazorpaySignature = p.RazorpaySignature,
                CreatedDate = p.CreatedDate,
                PaidDate = p.PaidDate
            }).ToList();
        }


        // =========================================================
        // GET PAYMENT BY ID
        // =========================================================

        public async Task<PaymentResponseDto?> GetByIdAsync(int id)
        {
            var payment =
                await _paymentRepository.GetByIdAsync(id);

            if (payment == null)
                return null;

            return new PaymentResponseDto
            {
                PaymentId = payment.PaymentId,
                UserId = payment.UserId,
                StoryPoetryId = payment.StoryPoetryId,
                EventRegistrationId = payment.EventRegistrationId,
              
                Amount = payment.Amount,
                PaymentType = payment.PaymentType,
                PaymentMethod = payment.PaymentMethod,
                Status = payment.Status,
                RazorpayOrderId = payment.RazorpayOrderId,
                RazorpayPaymentId = payment.RazorpayPaymentId,
                RazorpaySignature = payment.RazorpaySignature,
                CreatedDate = payment.CreatedDate,
                PaidDate = payment.PaidDate
            };
        }


        // =========================================================
        // CREATE RAZORPAY ORDER FOR EVENT
        // =========================================================

        public async Task<PaymentResponseDto?>
            CreateEventPaymentAsync(
                CreateEventPaymentRequest request)
        {
            // -----------------------------------------------------
            // 1. Get Event Registration
            // -----------------------------------------------------

            var registration =
                await _eventRegistrationRepository
                    .GetRegistrationAsync(
                        request.EventRegistrationId);

            if (registration == null)
                return null;


            // -----------------------------------------------------
            // 2. Check Registration Status
            // -----------------------------------------------------

            if (registration.Status == "Registered")
            {
                throw new Exception(
                    "This event registration is already completed.");
            }


            // -----------------------------------------------------
            // 3. Get Amount From Database
            // -----------------------------------------------------

            decimal totalAmount =
                registration.TotalAmount;

            if (totalAmount <= 0)
            {
                throw new Exception(
                    "Invalid event registration amount.");
            }


            // -----------------------------------------------------
            // 4. Convert Rupees To Paise
            // -----------------------------------------------------

            int amountInPaise =
                (int)(totalAmount * 100);


            // -----------------------------------------------------
            // 5. Create Razorpay Client
            // -----------------------------------------------------

            Razorpay.Api.RazorpayClient client =
                new Razorpay.Api.RazorpayClient(
                    _razorpaySettings.KeyId,
                    _razorpaySettings.KeySecret);


            // -----------------------------------------------------
            // 6. Razorpay Order Options
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
                        $"EVENT_{registration.RegistrationId}"
                    }
                };


            // -----------------------------------------------------
            // 7. Create Razorpay Order
            // -----------------------------------------------------

            Razorpay.Api.Order order =
                client.Order.Create(options);


            // -----------------------------------------------------
            // 8. Create Local Payment Record
            // -----------------------------------------------------

            var payment =
                new BookStore.Server.Models.Payment
                {
                    UserId =
                        registration.UserId,

                    EventRegistrationId =
                        registration.RegistrationId,

                    Amount =
                        registration.TotalAmount,

                    PaymentType =
                        "Razorpay",

                    // Payment method is known only after
                    // successful Razorpay payment.
                    PaymentMethod =
                        null,

                    Status =
                        "Pending",

                    RazorpayOrderId =
                        order["id"].ToString(),

                    CreatedDate =
                        DateTime.UtcNow
                };


            // -----------------------------------------------------
            // 9. Save Payment
            // -----------------------------------------------------

            var createdPayment =
                await _paymentRepository
                    .AddAsync(payment);


            // -----------------------------------------------------
            // 10. Return Payment Response
            // -----------------------------------------------------

            return new PaymentResponseDto
            {
                PaymentId =
                    createdPayment.PaymentId,

                UserId =
                    createdPayment.UserId,

                EventRegistrationId =
                    createdPayment.EventRegistrationId,

                Amount =
                    createdPayment.Amount,

                PaymentType =
                    createdPayment.PaymentType,

                PaymentMethod =
                    createdPayment.PaymentMethod,

                Status =
                    createdPayment.Status,

                RazorpayOrderId =
                    createdPayment.RazorpayOrderId,

                CreatedDate =
                    createdPayment.CreatedDate
            };
        }


        // =========================================================
        // VERIFY RAZORPAY PAYMENT
        // =========================================================
        //
        // Payment becomes Paid ONLY after signature verification.
        //
        // After successful verification:
        //
        // 1. Payment -> Paid
        // 2. PaymentMethod -> fetched from Razorpay
        // 3. EventRegistration -> Registered
        // 4. AvailableSeats -> Reduced
        //
        // =========================================================

        public async Task<PaymentResponseDto?>
            VerifyRazorpayPaymentAsync(
                RazorpayPaymentVerificationRequest request)
        {
            // -----------------------------------------------------
            // 1. Get Local Payment
            // -----------------------------------------------------

            var payment =
                await _paymentRepository
                    .GetByIdAsync(request.PaymentId);

            if (payment == null)
                return null;


            // -----------------------------------------------------
            // 2. Prevent Re-processing
            // -----------------------------------------------------

            if (payment.Status == "Paid")
            {
                throw new Exception(
                    "This payment has already been completed.");
            }


            // -----------------------------------------------------
            // 3. Validate Razorpay Order ID
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
            // 4. Validate Razorpay Payment ID
            // -----------------------------------------------------

            if (string.IsNullOrWhiteSpace(
                    request.RazorpayPaymentId))
            {
                throw new Exception(
                    "Razorpay Payment ID is required.");
            }


            // -----------------------------------------------------
            // 5. Validate Signature
            // -----------------------------------------------------

            if (string.IsNullOrWhiteSpace(
                    request.RazorpaySignature))
            {
                throw new Exception(
                    "Razorpay Signature is required.");
            }


            // -----------------------------------------------------
            // 6. Create Signature Payload
            // -----------------------------------------------------

            string payload =
                request.RazorpayOrderId +
                "|" +
                request.RazorpayPaymentId;


            // -----------------------------------------------------
            // 7. Generate Expected Signature
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
            // 8. Secure Signature Comparison
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
            // 9. Get Event Registration
            // -----------------------------------------------------

            if (payment.EventRegistrationId == null)
            {
                throw new Exception(
                    "Event registration is not linked to this payment.");
            }


            var registration =
                await _eventRegistrationRepository
                    .GetRegistrationAsync(
                        payment.EventRegistrationId.Value);

            if (registration == null)
            {
                throw new Exception(
                    "Event registration not found.");
            }


            // -----------------------------------------------------
            // 10. Check Registration Status
            // -----------------------------------------------------

            if (registration.Status == "Registered")
            {
                throw new Exception(
                    "Event registration is already completed.");
            }


            // -----------------------------------------------------
            // 11. Get Event
            // -----------------------------------------------------

            var eventItem =
                await _eventRegistrationRepository
                    .GetEventAsync(
                        registration.EventId);

            if (eventItem == null)
            {
                throw new Exception(
                    "Event not found.");
            }


            // -----------------------------------------------------
            // 12. Check Available Seats Again
            // -----------------------------------------------------

            if (registration.NumberOfSeats >
                eventItem.AvailableSeats)
            {
                throw new Exception(
                    "Requested seats are no longer available.");
            }


            // -----------------------------------------------------
            // 13. Get Payment Method From Razorpay
            // -----------------------------------------------------

            string? paymentMethod =
                GetRazorpayPaymentMethod(
                    request.RazorpayPaymentId);


            // -----------------------------------------------------
            // 14. Mark Payment As Paid
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
            // 15. Mark Registration As Registered
            // -----------------------------------------------------

            registration.Status =
                "Registered";


            // -----------------------------------------------------
            // 16. Reduce Available Seats
            // -----------------------------------------------------

            eventItem.AvailableSeats -=
                registration.NumberOfSeats;


            // -----------------------------------------------------
            // 17. Save Payment
            // -----------------------------------------------------

            var updatedPayment =
                await _paymentRepository
                    .UpdateAsync(payment);

            if (updatedPayment == null)
                return null;


            // -----------------------------------------------------
            // 18. Save Registration + Event
            // -----------------------------------------------------

            await _eventRegistrationRepository
                .SaveChangesAsync();


            // -----------------------------------------------------
            // 19. Return Response
            // -----------------------------------------------------

            return new PaymentResponseDto
            {
                PaymentId =
                    updatedPayment.PaymentId,

                UserId =
                    updatedPayment.UserId,

                StoryPoetryId =
                    updatedPayment.StoryPoetryId,

                EventRegistrationId =
                    updatedPayment.EventRegistrationId,

               

                Amount =
                    updatedPayment.Amount,

                PaymentType =
                    updatedPayment.PaymentType,

                PaymentMethod =
                    updatedPayment.PaymentMethod,

                Status =
                    updatedPayment.Status,

                RazorpayOrderId =
                    updatedPayment.RazorpayOrderId,

                RazorpayPaymentId =
                    updatedPayment.RazorpayPaymentId,

                RazorpaySignature =
                    updatedPayment.RazorpaySignature,

                CreatedDate =
                    updatedPayment.CreatedDate,

                PaidDate =
                    updatedPayment.PaidDate
            };
        }


        // =========================================================
        // GET PAYMENT METHOD FROM RAZORPAY
        // =========================================================
        //
        // Uses Razorpay Payment ID to fetch the actual payment
        // details from Razorpay.
        //
        // Example returned values:
        //
        // upi
        // card
        // netbanking
        // wallet
        //
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
    }
}