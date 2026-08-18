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

        // =========================================================
        // GET ALL BOOKS
        // =========================================================

        public async Task<List<BookResponse>> GetAllAsync()
        {
            return await _bookRepository.GetAllAsync();
        }


        // =========================================================
        // SEARCH BOOKS
        // =========================================================

        public async Task<List<BookResponse>> SearchAsync(string keyword)
        {
            return await _bookRepository.SearchAsync(keyword);
        }


        // =========================================================
        // FILTER BOOKS
        // =========================================================

        public async Task<List<BookResponse>> FilterAsync(
            int? categoryId,
            int? authorId,
            int? publisherId,
            decimal? minPrice,
            decimal? maxPrice,
            string? sortBy)
        {
            return await _bookRepository.FilterAsync(
                categoryId,
                authorId,
                publisherId,
                minPrice,
                maxPrice,
                sortBy);
        }


        // =========================================================
        // GET BOOK BY ID
        // =========================================================

        public async Task<BookResponse?> GetByIdAsync(int id)
        {
            return await _bookRepository.GetResponseByIdAsync(id);
        }


        // =========================================================
        // ADD BOOK
        // =========================================================

        public async Task<BookResponse?> AddAsync(AddBookRequest request)
        {
            var book = new Book
            {
                Title = request.Title,
                ISBN = request.ISBN,
                Price = request.Price,

                // Default is 15% if no value is provided
                DiscountPercentage = request.DiscountPercentage,

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


            // =====================================================
            // UPLOAD BOOK IMAGE
            // =====================================================

            if (request.Image != null)
            {
                var uploadResult =
                    await _cloudinaryService.UploadImageAsync(request.Image);

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


            // Return complete book response
            return await _bookRepository.GetResponseByIdAsync(book.BookId);
        }


        // =========================================================
        // UPDATE BOOK
        // =========================================================

        public async Task<BookResponse?> UpdateAsync(
            int id,
            UpdateBookRequest request)
        {
            var book = await _bookRepository.GetByIdAsync(id);

            if (book == null)
                return null;


            // =====================================================
            // UPDATE BOOK DETAILS
            // =====================================================

            book.Title = request.Title;
            book.ISBN = request.ISBN;
            book.Price = request.Price;

            // Update book-specific discount
            book.DiscountPercentage = request.DiscountPercentage;

            book.StockQuantity = request.StockQuantity;
            book.PublishedDate = request.PublishedDate;
            book.Description = request.Description;
            book.CategoryId = request.CategoryId;
            book.AuthorId = request.AuthorId;
            book.PublisherId = request.PublisherId;
            book.IsActive = request.IsActive;
            book.UpdatedDate = DateTime.UtcNow;

            await _bookRepository.UpdateAsync(book);


            // =====================================================
            // REPLACE IMAGE IF NEW IMAGE IS SELECTED
            // =====================================================

            if (request.Image != null)
            {
                // Get old primary image
                var oldImage =
                    await _bookImageService.GetPrimaryImageAsync(book.BookId);

                // Delete old image record
                if (oldImage != null)
                {
                    await _bookImageService.DeleteAsync(oldImage);
                }


                // Upload new image
                var uploadResult =
                    await _cloudinaryService.UploadImageAsync(request.Image);

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


            // Return updated book
            return await _bookRepository.GetResponseByIdAsync(book.BookId);
        }


        // =========================================================
        // DELETE BOOK
        // =========================================================

        public async Task<bool> DeleteAsync(int id)
        {
            var book = await _bookRepository.GetByIdAsync(id);

            if (book == null)
                return false;

            return await _bookRepository.DeleteAsync(book);
        }
    }
}