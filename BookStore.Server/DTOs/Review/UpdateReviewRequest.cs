using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs.Review
{
    public class UpdateReviewRequest
    {
        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        [StringLength(1000)]
        public string? Comment { get; set; }

        [Required]
        public int BookId { get; set; }

        [Required]
        public int UserId { get; set; }
    }
}