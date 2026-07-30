using BookStore.Server.DTOs.Category;
using BookStore.Server.Models;
using BookStore.Server.Repositories;

namespace BookStore.Server.Services
{
    public class CategoryService
    {
        private readonly CategoryRepository _repository;

        public CategoryService(CategoryRepository repository)
        {
            _repository = repository;
        }


        // Get All Categories
        public async Task<List<CategoryResponse>> GetAllAsync()
        {
            var categories = await _repository.GetAllAsync();

            return categories.Select(c => new CategoryResponse
            {
                CategoryId = c.CategoryId,
                CategoryName = c.CategoryName,
                Description = c.Description,
                IsActive = c.IsActive,
                CreatedDate = c.CreatedDate
            }).ToList();
        }


        // Get Category By Id
        public async Task<CategoryResponse?> GetByIdAsync(int id)
        {
            var category = await _repository.GetByIdAsync(id);

            if (category == null)
            {
                return null;
            }

            return new CategoryResponse
            {
                CategoryId = category.CategoryId,
                CategoryName = category.CategoryName,
                Description = category.Description,
                IsActive = category.IsActive,
                CreatedDate = category.CreatedDate
            };
        }


        // Create Category
        public async Task<bool> CreateAsync(CreateCategoryRequest request)
        {
            if (await _repository.ExistsAsync(request.CategoryName))
            {
                return false;
            }


            var category = new Category
            {
                CategoryName = request.CategoryName,
                Description = request.Description,
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };


            await _repository.AddAsync(category);

            return true;
        }


        // Update Category
        public async Task<bool> UpdateAsync(
            int id,
            UpdateCategoryRequest request)
        {
            var category = await _repository.GetByIdAsync(id);

            if (category == null)
            {
                return false;
            }


            category.CategoryName = request.CategoryName;
            category.Description = request.Description;
            category.IsActive = request.IsActive;
            category.UpdatedDate = DateTime.UtcNow;


            await _repository.UpdateAsync(category);

            return true;
        }


        // Delete Category
        public async Task<bool> DeleteAsync(int id)
        {
            var category = await _repository.GetByIdAsync(id);

            if (category == null)
            {
                return false;
            }


            await _repository.DeleteAsync(category);

            return true;
        }
    }
}