using BookStore.Server.Data;
using BookStore.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Server.Repositories
{
    public class PromotionBannerRepository
    {
        private readonly ApplicationDbContext _context;

        public PromotionBannerRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // =========================================================
        // GET ALL BANNERS
        // =========================================================

        public async Task<List<PromotionBanner>> GetAllAsync()
        {
            return await _context.PromotionBanners
                .OrderByDescending(b => b.CreatedDate)
                .ToListAsync();
        }


        // =========================================================
        // GET ACTIVE BANNERS
        // =========================================================

        public async Task<List<PromotionBanner>> GetActiveAsync()
        {
            return await _context.PromotionBanners
                .Where(b => b.IsActive)
                .OrderByDescending(b => b.CreatedDate)
                .ToListAsync();
        }


        // =========================================================
        // GET BY ID
        // =========================================================

        public async Task<PromotionBanner?> GetByIdAsync(int id)
        {
            return await _context.PromotionBanners
                .FirstOrDefaultAsync(b => b.PromotionBannerId == id);
        }


        // =========================================================
        // COUNT ACTIVE BANNERS
        // =========================================================

        public async Task<int> GetActiveCountAsync()
        {
            return await _context.PromotionBanners
                .CountAsync(b => b.IsActive);
        }


        // =========================================================
        // ADD
        // =========================================================

        public async Task<PromotionBanner> AddAsync(PromotionBanner banner)
        {
            _context.PromotionBanners.Add(banner);

            await _context.SaveChangesAsync();

            return banner;
        }


        // =========================================================
        // UPDATE
        // =========================================================

        public async Task<PromotionBanner> UpdateAsync(PromotionBanner banner)
        {
            _context.PromotionBanners.Update(banner);

            await _context.SaveChangesAsync();

            return banner;
        }


        // =========================================================
        // DELETE
        // =========================================================

        public async Task<bool> DeleteAsync(PromotionBanner banner)
        {
            _context.PromotionBanners.Remove(banner);

            await _context.SaveChangesAsync();

            return true;
        }
    }
}