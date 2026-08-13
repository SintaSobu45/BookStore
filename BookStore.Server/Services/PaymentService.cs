using BookStore.Server.DTOs.Payment;
using BookStore.Server.Models;

using BookStore.Server.Repositories;

namespace BookStore.Server.Services
{
    public class PaymentService
    {
        private readonly PaymentRepository _paymentRepository;

        public PaymentService(PaymentRepository paymentRepository)
        {
            _paymentRepository = paymentRepository;
        }

        // Get All Payments
        public async Task<List<PaymentResponseDto>> GetAllAsync()
        {
            var payments = await _paymentRepository.GetAllAsync();

            return payments.Select(p => new PaymentResponseDto
            {
                PaymentId = p.PaymentId,
                UserId = p.UserId,
                StoryPoetryId = p.StoryPoetryId,
                EventRegistrationId = p.EventRegistrationId,
                OrderId = p.OrderId,
                Amount = p.Amount,
                PaymentType = p.PaymentType,
                Status = p.Status,
                RazorpayOrderId = p.RazorpayOrderId,
                RazorpayPaymentId = p.RazorpayPaymentId,
                RazorpaySignature = p.RazorpaySignature,
                TransactionId = p.TransactionId,
                CreatedDate = p.CreatedDate,
                PaidDate = p.PaidDate
            }).ToList();
        }

        // Get Payment By Id
        public async Task<PaymentResponseDto?> GetByIdAsync(int id)
        {
            var payment = await _paymentRepository.GetByIdAsync(id);

            if (payment == null)
                return null;

            return new PaymentResponseDto
            {
                PaymentId = payment.PaymentId,
                UserId = payment.UserId,
                StoryPoetryId = payment.StoryPoetryId,
                EventRegistrationId = payment.EventRegistrationId,
                OrderId = payment.OrderId,
                Amount = payment.Amount,
                PaymentType = payment.PaymentType,
                Status = payment.Status,
                RazorpayOrderId = payment.RazorpayOrderId,
                RazorpayPaymentId = payment.RazorpayPaymentId,
                RazorpaySignature = payment.RazorpaySignature,
                TransactionId = payment.TransactionId,
                CreatedDate = payment.CreatedDate,
                PaidDate = payment.PaidDate
            };
        }

        // Create Payment
        public async Task<PaymentResponseDto> CreateAsync(
            CreatePaymentDto request)
        {
            var payment = new Payment
            {
                UserId = request.UserId,
                StoryPoetryId = request.StoryPoetryId,
                EventRegistrationId = request.EventRegistrationId,
                OrderId = request.OrderId,
                Amount = request.Amount,
                PaymentType = request.PaymentType,

                // Initially Pending
                Status = "Pending",

                CreatedDate = DateTime.UtcNow
            };

            var createdPayment =
                await _paymentRepository.AddAsync(payment);

            return new PaymentResponseDto
            {
                PaymentId = createdPayment.PaymentId,
                UserId = createdPayment.UserId,
                StoryPoetryId = createdPayment.StoryPoetryId,
                EventRegistrationId = createdPayment.EventRegistrationId,
                OrderId = createdPayment.OrderId,
                Amount = createdPayment.Amount,
                PaymentType = createdPayment.PaymentType,
                Status = createdPayment.Status,
                RazorpayOrderId = createdPayment.RazorpayOrderId,
                RazorpayPaymentId = createdPayment.RazorpayPaymentId,
                RazorpaySignature = createdPayment.RazorpaySignature,
                TransactionId = createdPayment.TransactionId,
                CreatedDate = createdPayment.CreatedDate,
                PaidDate = createdPayment.PaidDate
            };
        }

        // Mark Payment As Paid
        public async Task<PaymentResponseDto?> MarkAsPaidAsync(int id)
        {
            var payment = await _paymentRepository.GetByIdAsync(id);

            if (payment == null)
                return null;

            payment.Status = "Paid";
            payment.PaidDate = DateTime.UtcNow;

            var updatedPayment =
                await _paymentRepository.UpdateAsync(payment);

            if (updatedPayment == null)
                return null;

            return new PaymentResponseDto
            {
                PaymentId = updatedPayment.PaymentId,
                UserId = updatedPayment.UserId,
                StoryPoetryId = updatedPayment.StoryPoetryId,
                EventRegistrationId = updatedPayment.EventRegistrationId,
                OrderId = updatedPayment.OrderId,
                Amount = updatedPayment.Amount,
                PaymentType = updatedPayment.PaymentType,
                Status = updatedPayment.Status,
                RazorpayOrderId = updatedPayment.RazorpayOrderId,
                RazorpayPaymentId = updatedPayment.RazorpayPaymentId,
                RazorpaySignature = updatedPayment.RazorpaySignature,
                TransactionId = updatedPayment.TransactionId,
                CreatedDate = updatedPayment.CreatedDate,
                PaidDate = updatedPayment.PaidDate
            };
        }
    }
}