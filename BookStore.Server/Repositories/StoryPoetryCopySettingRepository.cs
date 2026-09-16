using BookStore.Server.Data;
using BookStore.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Server.Repositories
{
    public class StoryPoetryCopySettingRepository
    {
        private readonly ApplicationDbContext _context;

        public StoryPoetryCopySettingRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // Get all copy settings
        public async Task<List<StoryPoetryCopySetting>> GetAllAsync()
        {
            return await _context.StoryPoetryCopySettings
                .OrderBy(x => x.StoryPoetryCopySettingId)
                .ToListAsync();
        }

        // Get setting by ID
        public async Task<StoryPoetryCopySetting?> GetByIdAsync(int id)
        {
            return await _context.StoryPoetryCopySettings
                .FirstOrDefaultAsync(x =>
                    x.StoryPoetryCopySettingId == id);
        }

        // Get setting by Type
        public async Task<StoryPoetryCopySetting?> GetByTypeAsync(string type)
        {
            return await _context.StoryPoetryCopySettings
                .FirstOrDefaultAsync(x => x.Type == type);
        }

        // Add new setting
        public async Task<StoryPoetryCopySetting> AddAsync(
            StoryPoetryCopySetting setting)
        {
            await _context.StoryPoetryCopySettings.AddAsync(setting);
            await _context.SaveChangesAsync();

            return setting;
        }

        // Update existing setting
        public async Task<StoryPoetryCopySetting> UpdateAsync(
            StoryPoetryCopySetting setting)
        {
            _context.StoryPoetryCopySettings.Update(setting);
            await _context.SaveChangesAsync();

            return setting;
        }
    }
}