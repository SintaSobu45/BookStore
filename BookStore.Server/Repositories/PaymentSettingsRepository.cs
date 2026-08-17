using BookStore.Server.Data;
using BookStore.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Server.Repositories
{
    public class PaymentSettingsRepository
    {
        private readonly ApplicationDbContext _context;

        public PaymentSettingsRepository(
            ApplicationDbContext context)
        {
            _context = context;
        }


        // =========================================================
        // GET ACTIVE PAYMENT SETTING
        // =========================================================

        public async Task<PaymentSettings?> GetActiveAsync(
            string paymentType)
        {
            return await _context.PaymentSettings
                .FirstOrDefaultAsync(p =>
                    p.PaymentType == paymentType &&
                    p.IsActive);
        }


        // =========================================================
        // GET ALL PAYMENT SETTINGS
        // =========================================================

        public async Task<List<PaymentSettings>> GetAllAsync()
        {
            return await _context.PaymentSettings
                .ToListAsync();
        }


        // =========================================================
        // ADD PAYMENT SETTING
        // =========================================================

        public async Task<PaymentSettings> AddAsync(
            PaymentSettings paymentSettings)
        {
            _context.PaymentSettings.Add(paymentSettings);

            await _context.SaveChangesAsync();

            return paymentSettings;
        }


        // =========================================================
        // UPDATE PAYMENT SETTING
        // =========================================================

        public async Task<PaymentSettings?> UpdateAsync(
            PaymentSettings paymentSettings)
        {
            _context.PaymentSettings.Update(paymentSettings);

            await _context.SaveChangesAsync();

            return paymentSettings;
        }
    }
}