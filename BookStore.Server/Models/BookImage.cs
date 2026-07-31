using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStore.Server.Models
{
    public class BookImage
    {
        [Key]
        public int BookImageId { get; set; }

        [Required]
        public string ImageUrl { get; set; } = string.Empty;

        public bool IsPrimary { get; set; } = false;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        // Foreign Key
        public int BookId { get; set; }

        [ForeignKey(nameof(BookId))]
        public Book? Book { get; set; }
    }
}