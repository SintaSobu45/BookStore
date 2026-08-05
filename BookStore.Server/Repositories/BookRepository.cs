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

        // Search Books
        public async Task<List<BookResponse>> SearchAsync(string keyword)
        {
            keyword = keyword.Trim().ToLower();

            return await _context.Books
                .Include(b => b.Category)
                .Include(b => b.Author)
                .Include(b => b.Publisher)
                .Include(b => b.BookImages)
                .Where(b =>
                    b.Title.ToLower().Contains(keyword) ||
                    (b.ISBN != null && b.ISBN.ToLower().Contains(keyword)) ||
                    b.Author!.AuthorName.ToLower().Contains(keyword) ||
                    b.Category!.CategoryName.ToLower().Contains(keyword) ||
                    b.Publisher!.PublisherName.ToLower().Contains(keyword))
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

        // Filter Books
        public async Task<List<BookResponse>> FilterAsync(
            int? categoryId,
            int? authorId,
            int? publisherId,
            decimal? minPrice,
            decimal? maxPrice,
            string? sortBy)
        {
            var query = _context.Books
                .Include(b => b.Category)
                .Include(b => b.Author)
                .Include(b => b.Publisher)
                .Include(b => b.BookImages)
                .AsQueryable();

            if (categoryId.HasValue)
                query = query.Where(b => b.CategoryId == categoryId.Value);

            if (authorId.HasValue)
                query = query.Where(b => b.AuthorId == authorId.Value);

            if (publisherId.HasValue)
                query = query.Where(b => b.PublisherId == publisherId.Value);

            if (minPrice.HasValue)
                query = query.Where(b => b.Price >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(b => b.Price <= maxPrice.Value);

            switch (sortBy?.ToLower())
            {
                case "priceasc":
                    query = query.OrderBy(b => b.Price);
                    break;

                case "pricedesc":
                    query = query.OrderByDescending(b => b.Price);
                    break;

                case "titleasc":
                    query = query.OrderBy(b => b.Title);
                    break;

                case "titledesc":
                    query = query.OrderByDescending(b => b.Title);
                    break;

                case "latest":
                    query = query.OrderByDescending(b => b.CreatedDate);
                    break;

                case "oldest":
                    query = query.OrderBy(b => b.CreatedDate);
                    break;
            }

            return await query
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