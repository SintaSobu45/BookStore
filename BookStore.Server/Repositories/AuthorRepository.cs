using BookStore.Server.Data;
using BookStore.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Server.Repositories
{
    public class AuthorRepository
    {
        private readonly ApplicationDbContext _context;

        public AuthorRepository(ApplicationDbContext context)
        {
            _context = context;
        }


        // Get All Authors
        public async Task<List<Author>> GetAllAsync()
        {
            return await _context.Authors
                .ToListAsync();
        }


        // Get Author By Id
        public async Task<Author?> GetByIdAsync(int id)
        {
            return await _context.Authors
                .FirstOrDefaultAsync(a => a.AuthorId == id);
        }


        // Add Author
        public async Task AddAsync(Author author)
        {
            await _context.Authors.AddAsync(author);
            await _context.SaveChangesAsync();
        }


        // Update Author
        public async Task UpdateAsync(Author author)
        {
            _context.Authors.Update(author);
            await _context.SaveChangesAsync();
        }


        // Delete Author
        public async Task DeleteAsync(Author author)
        {
            _context.Authors.Remove(author);
            await _context.SaveChangesAsync();
        }


        // Check Author Exists
        public async Task<bool> ExistsAsync(string authorName)
        {
            return await _context.Authors
                .AnyAsync(a => a.AuthorName == authorName);
        }
    }
}