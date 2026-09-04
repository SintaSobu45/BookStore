namespace BookStore.Server.Models
{
    public class PromotionBanner
    {
        public int PromotionBannerId { get; set; }

        public string DesktopImageUrl { get; set; } = string.Empty;

        public string TabletImageUrl { get; set; } = string.Empty;

        public string MobileImageUrl { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
    }
}