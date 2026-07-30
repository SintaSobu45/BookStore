using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs.Author
{
    public class UpdateAuthorRequest
    {
        [Required]
        [StringLength(100)]
        public string AuthorName { get; set; } = string.Empty;


        [StringLength(500)]
        public string? Biography { get; set; }


        public bool IsActive { get; set; }
    }
}