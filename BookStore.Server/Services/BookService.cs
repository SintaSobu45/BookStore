using BookStore.Server.DTOs.Book;
using BookStore.Server.Models;
using BookStore.Server.Repositories;

namespace BookStore.Server.Services
{
    public class BookService
    {
        private readonly BookRepository _bookRepository;
        private readonly CloudinaryService _cloudinaryService;
        private readonly BookImageService _bookImageService;

        public BookService(
            BookRepository bookRepository,
            CloudinaryService cloudinaryService,
            BookImageService bookImageService)
        {
            _bookRepository = bookRepository;
            _cloudinaryService = cloudinaryService;
            _bookImageService = bookImageService;
        }

        // Get All Books
        public async Task<List<BookResponse>> GetAllAsync()
        {
            return await _bookRepository.GetAllAsync();
        }

        // Get Book By Id
        public async Task<BookResponse?> GetByIdAsync(int id)
        {
            return await _bookRepository.GetResponseByIdAsync(id);
        }

        // Add Book
        public async Task<BookResponse?> AddAsync(AddBookRequest request)
        {
            var book = new Book
            {
                Title = request.Title,
                ISBN = request.ISBN,
                Price = request.Price,
                StockQuantity = request.StockQuantity,
                PublishedDate = request.PublishedDate,
                Description = request.Description,
                CategoryId = request.CategoryId,
                AuthorId = request.AuthorId,
                PublisherId = request.PublisherId,
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };

            // Save Book
            book = await _bookRepository.AddAsync(book);

            // Upload Image
            if (request.Image != null)
            {
                var uploadResult = await _cloudinaryService.UploadImageAsync(request.Image);

                if (uploadResult != null)
                {
                    var bookImage = new BookImage
                    {
                        BookId = book.BookId,
                        ImageUrl = uploadResult.ImageUrl,
                        IsPrimary = true
                    };

                    await _bookImageService.AddAsync(bookImage);
                }
            }

            return await _bookRepository.GetResponseByIdAsync(book.BookId);
        }

        // Update Book
        public async Task<BookResponse?> UpdateAsync(int id, UpdateBookRequest request)
        {
            var book = await _bookRepository.GetByIdAsync(id);

            if (book == null)
                return null;

            // Update Book Details
            book.Title = request.Title;
            book.ISBN = request.ISBN;
            book.Price = request.Price;
            book.StockQuantity = request.StockQuantity;
            book.PublishedDate = request.PublishedDate;
            book.Description = request.Description;
            book.CategoryId = request.CategoryId;
            book.AuthorId = request.AuthorId;
            book.PublisherId = request.PublisherId;
            book.IsActive = request.IsActive;
            book.UpdatedDate = DateTime.UtcNow;

            await _bookRepository.UpdateAsync(book);

            // Replace Image (if new image selected)
            if (request.Image != null)
            {
                // Delete old image record
                var oldImage = await _bookImageService.GetPrimaryImageAsync(book.BookId);

                if (oldImage != null)
                {
                    await _bookImageService.DeleteAsync(oldImage);
                }

                // Upload new image
                var uploadResult = await _cloudinaryService.UploadImageAsync(request.Image);

                if (uploadResult != null)
                {
                    var newImage = new BookImage
                    {
                        BookId = book.BookId,
                        ImageUrl = uploadResult.ImageUrl,
                        IsPrimary = true
                    };

                    await _bookImageService.AddAsync(newImage);
                }
            }

            return await _bookRepository.GetResponseByIdAsync(book.BookId);
        }

        // Delete Book
        public async Task<bool> DeleteAsync(int id)
        {
            var book = await _bookRepository.GetByIdAsync(id);

            if (book == null)
                return false;

            return await _bookRepository.DeleteAsync(book);
        }
    }
}