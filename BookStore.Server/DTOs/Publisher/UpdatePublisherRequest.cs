using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs.Publisher
{
    public class UpdatePublisherRequest
    {
        [Required]
        [StringLength(100)]
        public string PublisherName { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        public bool IsActive { get; set; }
    }
}