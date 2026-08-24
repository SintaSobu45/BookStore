using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStore.Server.Models
{
    public class Certificate
    {
        // =========================================================
        // PRIMARY KEY
        // =========================================================

        [Key]
        public int CertificateId { get; set; }


        // =========================================================
        // USER
        // =========================================================

        [Required]
        public int UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }


        // =========================================================
        // STORY / POETRY
        // =========================================================

        [Required]
        public int StoryPoetryId { get; set; }

        [ForeignKey(nameof(StoryPoetryId))]
        public StoryPoetry? StoryPoetry { get; set; }


        // =========================================================
        // CERTIFICATE DETAILS
        // =========================================================

        [Required]
        [StringLength(50)]
        public string CertificateNumber { get; set; } = string.Empty;


        // Snapshot of the Malayalam contributor name
        // from StoryPoetry.ContributorNameMalayalam
        [Required]
        [StringLength(200)]
        public string RecipientName { get; set; } = string.Empty;


        [Required]
        [StringLength(200)]
        public string CertificateTitle { get; set; } = string.Empty;


        [StringLength(1000)]
        public string? Description { get; set; }


        // =========================================================
        // ISSUE DETAILS
        // =========================================================


        public DateTime IssuedDate { get; set; } = DateTime.UtcNow;


        // Public URL of the generated PDF
        public string? PdfUrl { get; set; }


        // =========================================================
        // SEND / NOTIFICATION TRACKING
        // =========================================================

        public bool IsSent { get; set; } = false;

        public DateTime? SentDate { get; set; }


        // =========================================================
        // CREATED DATE
        // =========================================================

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    }
}