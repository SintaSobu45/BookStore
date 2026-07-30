using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs.Category
{
    public class CreateCategoryRequest
    {
        [Required]
        [StringLength(100)]
        public string CategoryName { get; set; } = string.Empty;


        [StringLength(500)]
        public string? Description { get; set; }
    }
}