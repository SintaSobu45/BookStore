using BookStore.Server.DTOs.PromotionBanner;
using BookStore.Server.Models;
using BookStore.Server.Repositories;

namespace BookStore.Server.Services
{
    public class PromotionBannerService
    {
        private readonly PromotionBannerRepository _repository;
        private readonly FtpImageService _ftpImageService;

        public PromotionBannerService(
            PromotionBannerRepository repository,
            FtpImageService ftpImageService)
        {
            _repository = repository;
            _ftpImageService = ftpImageService;
        }


        // =========================================================
        // GET ALL BANNERS - ADMIN
        // =========================================================

        public async Task<List<PromotionBannerResponse>> GetAllAsync()
        {
            var banners = await _repository.GetAllAsync();

            return banners.Select(MapToResponse).ToList();
        }


        // =========================================================
        // GET ACTIVE BANNERS - USER
        // =========================================================

        public async Task<List<PromotionBannerResponse>> GetActiveAsync()
        {
            var banners = await _repository.GetActiveAsync();

            return banners.Select(MapToResponse).ToList();
        }


        // =========================================================
        // GET BY ID
        // =========================================================

        public async Task<PromotionBannerResponse?> GetByIdAsync(int id)
        {
            var banner = await _repository.GetByIdAsync(id);

            if (banner == null)
                return null;

            return MapToResponse(banner);
        }


        // =========================================================
        // CREATE
        // =========================================================

        public async Task<(bool Success, string Message, PromotionBannerResponse? Data)>
            CreateAsync(AddPromotionBannerRequest request)
        {
            // -----------------------------------------------------
            // CHECK ACTIVE BANNER LIMIT
            // -----------------------------------------------------

            if (request.IsActive)
            {
                var activeCount = await _repository.GetActiveCountAsync();

                if (activeCount >= 3)
                {
                    return (
                        false,
                        "Maximum 3 active promotion banners are allowed.",
                        null
                    );
                }
            }


            // -----------------------------------------------------
            // UPLOAD DESKTOP IMAGE
            // -----------------------------------------------------

            var desktopUrl =
                await _ftpImageService.UploadImageAsync(
                    request.DesktopImage);

            if (string.IsNullOrEmpty(desktopUrl))
            {
                return (
                    false,
                    "Failed to upload desktop banner image.",
                    null
                );
            }


            // -----------------------------------------------------
            // UPLOAD TABLET IMAGE
            // -----------------------------------------------------

            var tabletUrl =
                await _ftpImageService.UploadImageAsync(
                    request.TabletImage);

            if (string.IsNullOrEmpty(tabletUrl))
            {
                return (
                    false,
                    "Failed to upload tablet banner image.",
                    null
                );
            }


            // -----------------------------------------------------
            // UPLOAD MOBILE IMAGE
            // -----------------------------------------------------

            var mobileUrl =
                await _ftpImageService.UploadImageAsync(
                    request.MobileImage);

            if (string.IsNullOrEmpty(mobileUrl))
            {
                return (
                    false,
                    "Failed to upload mobile banner image.",
                    null
                );
            }


            // -----------------------------------------------------
            // CREATE ENTITY
            // -----------------------------------------------------

            var banner = new PromotionBanner
            {
                DesktopImageUrl = desktopUrl,
                TabletImageUrl = tabletUrl,
                MobileImageUrl = mobileUrl,
                IsActive = request.IsActive,
                CreatedDate = DateTime.UtcNow,
                UpdatedDate = DateTime.UtcNow
            };


            var createdBanner =
                await _repository.AddAsync(banner);


            return (
                true,
                "Promotion banner created successfully.",
                MapToResponse(createdBanner)
            );
        }


        // =========================================================
        // UPDATE
        // =========================================================

        public async Task<(bool Success, string Message, PromotionBannerResponse? Data)>
            UpdateAsync(
                int id,
                UpdatePromotionBannerRequest request)
        {
            var banner = await _repository.GetByIdAsync(id);

            if (banner == null)
            {
                return (
                    false,
                    "Promotion banner not found.",
                    null
                );
            }


            // -----------------------------------------------------
            // CHECK ACTIVE LIMIT
            // -----------------------------------------------------

            if (request.IsActive && !banner.IsActive)
            {
                var activeCount =
                    await _repository.GetActiveCountAsync();

                if (activeCount >= 3)
                {
                    return (
                        false,
                        "Maximum 3 active promotion banners are allowed.",
                        null
                    );
                }
            }


            // -----------------------------------------------------
            // DESKTOP IMAGE
            // -----------------------------------------------------

            if (request.DesktopImage != null)
            {
                var desktopUrl =
                    await _ftpImageService.UploadImageAsync(
                        request.DesktopImage);

                if (string.IsNullOrEmpty(desktopUrl))
                {
                    return (
                        false,
                        "Failed to upload desktop banner image.",
                        null
                    );
                }

                banner.DesktopImageUrl = desktopUrl;
            }


            // -----------------------------------------------------
            // TABLET IMAGE
            // -----------------------------------------------------

            if (request.TabletImage != null)
            {
                var tabletUrl =
                    await _ftpImageService.UploadImageAsync(
                        request.TabletImage);

                if (string.IsNullOrEmpty(tabletUrl))
                {
                    return (
                        false,
                        "Failed to upload tablet banner image.",
                        null
                    );
                }

                banner.TabletImageUrl = tabletUrl;
            }


            // -----------------------------------------------------
            // MOBILE IMAGE
            // -----------------------------------------------------

            if (request.MobileImage != null)
            {
                var mobileUrl =
                    await _ftpImageService.UploadImageAsync(
                        request.MobileImage);

                if (string.IsNullOrEmpty(mobileUrl))
                {
                    return (
                        false,
                        "Failed to upload mobile banner image.",
                        null
                    );
                }

                banner.MobileImageUrl = mobileUrl;
            }


            // -----------------------------------------------------
            // UPDATE STATUS
            // -----------------------------------------------------

            banner.IsActive = request.IsActive;
            banner.UpdatedDate = DateTime.UtcNow;


            var updatedBanner =
                await _repository.UpdateAsync(banner);


            return (
                true,
                "Promotion banner updated successfully.",
                MapToResponse(updatedBanner)
            );
        }


        // =========================================================
        // DELETE
        // =========================================================

        public async Task<(bool Success, string Message)> DeleteAsync(int id)
        {
            var banner = await _repository.GetByIdAsync(id);

            if (banner == null)
            {
                return (
                    false,
                    "Promotion banner not found."
                );
            }

            await _repository.DeleteAsync(banner);

            return (
                true,
                "Promotion banner deleted successfully."
            );
        }


        // =========================================================
        // MAP ENTITY → RESPONSE
        // =========================================================

        private static PromotionBannerResponse MapToResponse(
            PromotionBanner banner)
        {
            return new PromotionBannerResponse
            {
                PromotionBannerId = banner.PromotionBannerId,
                DesktopImageUrl = banner.DesktopImageUrl,
                TabletImageUrl = banner.TabletImageUrl,
                MobileImageUrl = banner.MobileImageUrl,
                IsActive = banner.IsActive,
                CreatedDate = banner.CreatedDate,
                UpdatedDate = banner.UpdatedDate
            };
        }
    }
}