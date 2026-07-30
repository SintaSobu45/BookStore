using BookStore.Server.Data;
using BookStore.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Server.Repositories
{
    public class PublisherRepository
    {
        private readonly ApplicationDbContext _context;

        public PublisherRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // Get All Publishers
        public async Task<List<Publisher>> GetAllAsync()
        {
            return await _context.Publishers.ToListAsync();
        }

        // Get Publisher By Id
        public async Task<Publisher?> GetByIdAsync(int id)
        {
            return await _context.Publishers
                .FirstOrDefaultAsync(p => p.PublisherId == id);
        }

        // Add Publisher
        public async Task AddAsync(Publisher publisher)
        {
            await _context.Publishers.AddAsync(publisher);
            await _context.SaveChangesAsync();
        }

        // Update Publisher
        public async Task UpdateAsync(Publisher publisher)
        {
            _context.Publishers.Update(publisher);
            await _context.SaveChangesAsync();
        }

        // Delete Publisher
        public async Task DeleteAsync(Publisher publisher)
        {
            _context.Publishers.Remove(publisher);
            await _context.SaveChangesAsync();
        }

        // Check Publisher Exists
        public async Task<bool> ExistsAsync(string publisherName)
        {
            return await _context.Publishers
                .AnyAsync(p => p.PublisherName == publisherName);
        }
    }
}