namespace BookStore.Server.DTOs.PromotionBanner
{
    public class AddPromotionBannerRequest
    {
        public IFormFile DesktopImage { get; set; } = null!;

        public IFormFile TabletImage { get; set; } = null!;

        public IFormFile MobileImage { get; set; } = null!;

        public bool IsActive { get; set; } = true;
    }
}