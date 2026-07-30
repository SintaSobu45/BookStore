using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs.Publisher
{
    public class CreatePublisherRequest
    {
        [Required]
        [StringLength(100)]
        public string PublisherName { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }
    }
}