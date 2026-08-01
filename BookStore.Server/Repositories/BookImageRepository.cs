using BookStore.Server.Data;
using BookStore.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Server.Repositories
{
    public class BookImageRepository
    {
        private readonly ApplicationDbContext _context;

        public BookImageRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // Add Image
        public async Task<BookImage> AddAsync(BookImage bookImage)
        {
            _context.BookImages.Add(bookImage);
            await _context.SaveChangesAsync();

            return bookImage;
        }

        // Get All Images of a Book
        public async Task<List<BookImage>> GetByBookIdAsync(int bookId)
        {
            return await _context.BookImages
                .Where(b => b.BookId == bookId)
                .ToListAsync();
        }

        // Get Primary Image
        public async Task<BookImage?> GetPrimaryImageAsync(int bookId)
        {
            return await _context.BookImages
                .FirstOrDefaultAsync(i => i.BookId == bookId && i.IsPrimary);
        }

        // Delete Image
        public async Task DeleteAsync(BookImage bookImage)
        {
            _context.BookImages.Remove(bookImage);
            await _context.SaveChangesAsync();
        }
    }
}