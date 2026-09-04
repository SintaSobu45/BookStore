namespace BookStore.Server.DTOs.PromotionBanner
{
    public class UpdatePromotionBannerRequest
    {
        public IFormFile? DesktopImage { get; set; }

        public IFormFile? TabletImage { get; set; }

        public IFormFile? MobileImage { get; set; }

        public bool IsActive { get; set; }
    }
}