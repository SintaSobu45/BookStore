using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStore.Server.Models
{
    public class StoryPoetryParticular
    {
        [Key]
        public int StoryPoetryParticularId { get; set; }


        // =========================================================
        // TYPE
        // =========================================================

        [Required]
        [StringLength(20)]
        [RegularExpression(
            "Story|Poetry|Special",
            ErrorMessage = "Type must be either Story, Poetry, or Special."
        )]
        public string Type { get; set; } = string.Empty;


        // =========================================================
        // PARTICULAR NAME
        // =========================================================

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;


        // =========================================================
        // EXTRA COPY PRICE
        // =========================================================

        [Column(TypeName = "decimal(18,2)")]
        [Range(
            0,
            double.MaxValue,
            ErrorMessage = "Extra copy price cannot be negative."
        )]
        public decimal ExtraCopyPrice { get; set; }


        // =========================================================
        // STATUS
        // =========================================================

        public bool IsActive { get; set; } = true;


        // =========================================================
        // DATES
        // =========================================================

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedDate { get; set; }


        // =========================================================
        // RELATIONSHIP
        // =========================================================

        public ICollection<StoryPoetry> StoryPoetries { get; set; }
            = new List<StoryPoetry>();
    }
}