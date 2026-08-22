using BookStore.Server.Data;
using BookStore.Server.Models.BookPayment;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Server.Repositories
{
    public class BookPaymentRepository
    {
        private readonly ApplicationDbContext _context;

        public BookPaymentRepository(ApplicationDbContext context)
        {
            _context = context;
        }


        // =========================================================
        // CREATE
        // =========================================================

        public async Task<BookPayment> AddAsync(
            BookPayment payment)
        {
            await _context.BookPayments.AddAsync(payment);
            await _context.SaveChangesAsync();

            return payment;
        }


        // =========================================================
        // GET BY ID
        // =========================================================

        public async Task<BookPayment?> GetByIdAsync(
      int bookPaymentId)
        {
            return await _context.BookPayments
                .Include(p => p.Order)
                    .ThenInclude(o => o.OrderItems)
                        .ThenInclude(oi => oi.Book)
                .FirstOrDefaultAsync(
                    p => p.BookPaymentId == bookPaymentId);
        }


        // =========================================================
        // GET BY ORDER ID
        // =========================================================

        public async Task<BookPayment?> GetByOrderIdAsync(
            int orderId)
        {
            return await _context.BookPayments
                .FirstOrDefaultAsync(
                    p => p.OrderId == orderId);
        }


        // =========================================================
        // GET USER PAYMENTS
        // =========================================================

        public async Task<List<BookPayment>> GetByUserIdAsync(
            int userId)
        {
            return await _context.BookPayments
                .Include(p => p.Order)
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreatedDate)
                .ToListAsync();
        }


        // =========================================================
        // UPDATE
        // =========================================================

        public async Task UpdateAsync(
            BookPayment payment)
        {
            _context.BookPayments.Update(payment);
            await _context.SaveChangesAsync();
        }
    }
}