using BookStore.Server.Data;
using BookStore.Server.DTOs.Book;
using BookStore.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Server.Repositories
{
    public class BookRepository
    {
        private readonly ApplicationDbContext _context;

        public BookRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // Get All Books
        public async Task<List<BookResponse>> GetAllAsync()
        {
            return await _context.Books
                .Include(b => b.Category)
                .Include(b => b.Author)
                .Include(b => b.Publisher)
                .Include(b => b.BookImages)
                .Select(b => new BookResponse
                {
                    BookId = b.BookId,
                    Title = b.Title,
                    ISBN = b.ISBN,
                    Price = b.Price,
                    StockQuantity = b.StockQuantity,
                    PublishedDate = b.PublishedDate,
                    Description = b.Description,
                    IsActive = b.IsActive,

                    CategoryId = b.CategoryId,
                    AuthorId = b.AuthorId,
                    PublisherId = b.PublisherId,

                    CategoryName = b.Category!.CategoryName,
                    AuthorName = b.Author!.AuthorName,
                    PublisherName = b.Publisher!.PublisherName,

                    ImageUrl = b.BookImages
                        .Where(i => i.IsPrimary)
                        .Select(i => i.ImageUrl)
                        .FirstOrDefault()
                })
                .ToListAsync();
        }

        // Get Book Entity By Id
        public async Task<Book?> GetByIdAsync(int id)
        {
            return await _context.Books
                .Include(b => b.BookImages)
                .FirstOrDefaultAsync(b => b.BookId == id);
        }

        // Get Book Response By Id
        public async Task<BookResponse?> GetResponseByIdAsync(int id)
        {
            return await _context.Books
                .Include(b => b.Category)
                .Include(b => b.Author)
                .Include(b => b.Publisher)
                .Include(b => b.BookImages)
                .Where(b => b.BookId == id)
                .Select(b => new BookResponse
                {
                    BookId = b.BookId,
                    Title = b.Title,
                    ISBN = b.ISBN,
                    Price = b.Price,
                    StockQuantity = b.StockQuantity,
                    PublishedDate = b.PublishedDate,
                    Description = b.Description,
                    IsActive = b.IsActive,

                    CategoryId = b.CategoryId,
                    AuthorId = b.AuthorId,
                    PublisherId = b.PublisherId,

                    CategoryName = b.Category!.CategoryName,
                    AuthorName = b.Author!.AuthorName,
                    PublisherName = b.Publisher!.PublisherName,

                    ImageUrl = b.BookImages
                        .Where(i => i.IsPrimary)
                        .Select(i => i.ImageUrl)
                        .FirstOrDefault()
                })
                .FirstOrDefaultAsync();
        }

        // Add Book
        public async Task<Book> AddAsync(Book book)
        {
            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            return book;
        }

        // Update Book
        public async Task<Book?> UpdateAsync(Book book)
        {
            _context.Books.Update(book);
            await _context.SaveChangesAsync();

            return book;
        }

        // Delete Book
        public async Task<bool> DeleteAsync(Book book)
        {
            _context.Books.Remove(book);
            await _context.SaveChangesAsync();

            return true;
        }

        // Check if Book Exists
        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Books
                .AnyAsync(b => b.BookId == id);
        }
    }
}