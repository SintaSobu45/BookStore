using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.Models
{
    public class Logo
    {
        [Key]
        public int LogoId { get; set; }

        [Required]
        [StringLength(500)]
        public string ImageUrl { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedDate { get; set; }
    }
}