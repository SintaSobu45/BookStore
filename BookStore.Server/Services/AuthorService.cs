using BookStore.Server.DTOs.Author;
using BookStore.Server.Models;
using BookStore.Server.Repositories;

namespace BookStore.Server.Services
{
    public class AuthorService
    {
        private readonly AuthorRepository _repository;

        public AuthorService(AuthorRepository repository)
        {
            _repository = repository;
        }


        // Get All Authors
        public async Task<List<AuthorResponse>> GetAllAsync()
        {
            var authors = await _repository.GetAllAsync();

            return authors.Select(a => new AuthorResponse
            {
                AuthorId = a.AuthorId,
                AuthorName = a.AuthorName,
                Biography = a.Biography,
                IsActive = a.IsActive,
                CreatedDate = a.CreatedDate,
                UpdatedDate = a.UpdatedDate
            }).ToList();
        }


        // Get Author By Id
        public async Task<AuthorResponse?> GetByIdAsync(int id)
        {
            var author = await _repository.GetByIdAsync(id);

            if (author == null)
            {
                return null;
            }


            return new AuthorResponse
            {
                AuthorId = author.AuthorId,
                AuthorName = author.AuthorName,
                Biography = author.Biography,
                IsActive = author.IsActive,
                CreatedDate = author.CreatedDate,
                UpdatedDate = author.UpdatedDate
            };
        }


        // Create Author
        public async Task<bool> CreateAsync(CreateAuthorRequest request)
        {
            if (await _repository.ExistsAsync(request.AuthorName))
            {
                return false;
            }


            var author = new Author
            {
                AuthorName = request.AuthorName,
                Biography = request.Biography,
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };


            await _repository.AddAsync(author);

            return true;
        }


        // Update Author
        public async Task<bool> UpdateAsync(
            int id,
            UpdateAuthorRequest request)
        {
            var author = await _repository.GetByIdAsync(id);

            if (author == null)
            {
                return false;
            }


            author.AuthorName = request.AuthorName;
            author.Biography = request.Biography;
            author.IsActive = request.IsActive;
            author.UpdatedDate = DateTime.UtcNow;


            await _repository.UpdateAsync(author);

            return true;
        }


        // Delete Author
        public async Task<bool> DeleteAsync(int id)
        {
            var author = await _repository.GetByIdAsync(id);

            if (author == null)
            {
                return false;
            }


            await _repository.DeleteAsync(author);

            return true;
        }
    }
}