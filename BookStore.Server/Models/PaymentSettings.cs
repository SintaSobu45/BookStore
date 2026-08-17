using System.ComponentModel.DataAnnotations.Schema;

namespace BookStore.Server.Models
{
    public class PaymentSettings
    {
        public int PaymentSettingsId { get; set; }

        public string PaymentType { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
    }
}