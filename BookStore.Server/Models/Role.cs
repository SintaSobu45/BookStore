using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.Models
{
    public class Role
    {
        [Key]
        public int RoleId { get; set; }

        [Required]
        [StringLength(50)]
        public string RoleName { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        // Navigation Property
        public ICollection<User> Users { get; set; } = new List<User>();
    }
}