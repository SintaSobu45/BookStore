using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.Models
{
    public class Category
    {
        [Key]
        public int CategoryId { get; set; }


        [Required]
        [StringLength(100)]
        public string CategoryName { get; set; } = string.Empty;


        [StringLength(500)]
        public string? Description { get; set; }


        public bool IsActive { get; set; } = true;


        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;


        public DateTime? UpdatedDate { get; set; }


        // Navigation Property
        public ICollection<Book> Books { get; set; } = new List<Book>();

       

       
    }
}