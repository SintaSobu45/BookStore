using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStore.Server.Models
{
    public class Review
    {
        [Key]
        public int ReviewId { get; set; }

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        [StringLength(1000)]
        public string? Comment { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedDate { get; set; }

        // Foreign Keys
        [Required]
        public int BookId { get; set; }

        [Required]
        public int UserId { get; set; }

        // Navigation Properties
        [ForeignKey(nameof(BookId))]
        public Book? Book { get; set; }

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }
    }
}