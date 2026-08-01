using BookStore.Server.Models;
using BookStore.Server.Repositories;

namespace BookStore.Server.Services
{
    public class BookImageService
    {
        private readonly BookImageRepository _bookImageRepository;

        public BookImageService(BookImageRepository bookImageRepository)
        {
            _bookImageRepository = bookImageRepository;
        }

        // Add Image
        public async Task<BookImage> AddAsync(BookImage bookImage)
        {
            return await _bookImageRepository.AddAsync(bookImage);
        }

        // Get All Images By Book
        public async Task<List<BookImage>> GetByBookIdAsync(int bookId)
        {
            return await _bookImageRepository.GetByBookIdAsync(bookId);
        }

        // Get Primary Image
        public async Task<BookImage?> GetPrimaryImageAsync(int bookId)
        {
            return await _bookImageRepository.GetPrimaryImageAsync(bookId);
        }

        // Delete Image
        public async Task DeleteAsync(BookImage bookImage)
        {
            await _bookImageRepository.DeleteAsync(bookImage);
        }
    }
}