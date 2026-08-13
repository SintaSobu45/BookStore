using BookStore.Server.Data;
using BookStore.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Server.Repositories
{
    public class PaymentRepository
    {
        private readonly ApplicationDbContext _context;

        public PaymentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // Get All Payments
        public async Task<List<Payment>> GetAllAsync()
        {
            return await _context.Payments
                .Include(p => p.User)
                .Include(p => p.StoryPoetry)
                .Include(p => p.EventRegistration)
                .ToListAsync();
        }

        // Get Payment By Id
        public async Task<Payment?> GetByIdAsync(int id)
        {
            return await _context.Payments
                .Include(p => p.User)
                .Include(p => p.StoryPoetry)
                .Include(p => p.EventRegistration)
                .FirstOrDefaultAsync(p => p.PaymentId == id);
        }

        // Add Payment
        public async Task<Payment> AddAsync(Payment payment)
        {
            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            return payment;
        }

        // Update Payment
        public async Task<Payment?> UpdateAsync(Payment payment)
        {
            _context.Payments.Update(payment);
            await _context.SaveChangesAsync();

            return payment;
        }

        // Check Payment Exists
        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Payments
                .AnyAsync(p => p.PaymentId == id);
        }
    }
}