using BookStore.Server.Models;
using BookStore.Server.Repositories;

namespace BookStore.Server.Services
{
    public class PaymentSettingsService
    {
        private readonly PaymentSettingsRepository _repository;

        public PaymentSettingsService(
            PaymentSettingsRepository repository)
        {
            _repository = repository;
        }


        // =========================================================
        // GET ACTIVE PAYMENT SETTING
        // =========================================================

        public async Task<PaymentSettings?> GetActiveAsync(
            string paymentType)
        {
            return await _repository
                .GetActiveAsync(paymentType);
        }


        // =========================================================
        // GET ALL PAYMENT SETTINGS
        // =========================================================

        public async Task<List<PaymentSettings>> GetAllAsync()
        {
            return await _repository
                .GetAllAsync();
        }


        // =========================================================
        // ADD PAYMENT SETTING
        // =========================================================

        public async Task<PaymentSettings> AddAsync(
            string paymentType,
            decimal amount)
        {
            if (string.IsNullOrWhiteSpace(paymentType))
            {
                throw new ArgumentException(
                    "Payment type is required.");
            }

            if (amount <= 0)
            {
                throw new ArgumentException(
                    "Amount must be greater than zero.");
            }

            var paymentSettings =
                new PaymentSettings
                {
                    PaymentType = paymentType,
                    Amount = amount,
                    IsActive = true,
                    UpdatedDate = DateTime.UtcNow
                };

            return await _repository
                .AddAsync(paymentSettings);
        }


        // =========================================================
        // UPDATE PAYMENT SETTING
        // =========================================================

        public async Task<PaymentSettings?> UpdateAsync(
            int id,
            decimal amount)
        {
            if (amount <= 0)
            {
                throw new ArgumentException(
                    "Amount must be greater than zero.");
            }

            var paymentSettings =
                await _repository
                    .GetAllAsync();

            var existing =
                paymentSettings.FirstOrDefault(
                    p => p.PaymentSettingsId == id);

            if (existing == null)
                return null;

            existing.Amount = amount;
            existing.UpdatedDate = DateTime.UtcNow;

            return await _repository
                .UpdateAsync(existing);
        }
    }
}