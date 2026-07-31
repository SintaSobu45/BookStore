using BookStore.Server.Data;
using BookStore.Server.Models;

namespace BookStore.Server.Repositories
{
    public class BookImageRepository
    {
        private readonly ApplicationDbContext _context;

        public BookImageRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<BookImage> AddAsync(BookImage bookImage)
        {
            _context.BookImages.Add(bookImage);
            await _context.SaveChangesAsync();

            return bookImage;
        }

        public async Task<List<BookImage>> GetByBookIdAsync(int bookId)
        {
            return await Task.FromResult(
                _context.BookImages
                .Where(b => b.BookId == bookId)
                .ToList());
        }

        public async Task DeleteAsync(BookImage bookImage)
        {
            _context.BookImages.Remove(bookImage);
            await _context.SaveChangesAsync();
        }
    }
}