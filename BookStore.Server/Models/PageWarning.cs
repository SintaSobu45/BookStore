using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.Models
{
    public class PageWarning
    {
        [Key]
        public int PageWarningId { get; set; }

        [Required]
        [MaxLength(100)]
        public string PageName { get; set; } = string.Empty;

        [Required]
        public string Message { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedDate { get; set; }
    }
}