using BookStore.Server.Data;
using BookStore.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Server.Repositories
{
    public class StoryPoetryParticularRepository
    {
        private readonly ApplicationDbContext _context;

        public StoryPoetryParticularRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // =========================================================
        // GET ALL
        // =========================================================

        public async Task<List<StoryPoetryParticular>> GetAllAsync()
        {
            return await _context.StoryPoetryParticular
                .OrderBy(x => x.Type)
                .ThenBy(x => x.Name)
                .ToListAsync();
        }


        // =========================================================
        // GET ACTIVE PARTICULARS BY TYPE
        // =========================================================

        public async Task<List<StoryPoetryParticular>> GetActiveByTypeAsync(
            string type)
        {
            return await _context.StoryPoetryParticular
                .Where(x => x.Type == type && x.IsActive)
                .OrderBy(x => x.Name)
                .ToListAsync();
        }


        // =========================================================
        // GET BY ID
        // =========================================================

        public async Task<StoryPoetryParticular?> GetByIdAsync(int id)
        {
            return await _context.StoryPoetryParticular
                .FirstOrDefaultAsync(x =>
                    x.StoryPoetryParticularId == id);
        }


        // =========================================================
        // CHECK DUPLICATE NAME
        // =========================================================

        public async Task<bool> ExistsByNameAndTypeAsync(
            string type,
            string name,
            int? excludeId = null)
        {
            var query = _context.StoryPoetryParticular
                .Where(x =>
                    x.Type == type &&
                    x.Name == name);

            if (excludeId.HasValue)
            {
                query = query.Where(x =>
                    x.StoryPoetryParticularId != excludeId.Value);
            }

            return await query.AnyAsync();
        }


        // =========================================================
        // ADD
        // =========================================================

        public async Task AddAsync(
            StoryPoetryParticular particular)
        {
            await _context.StoryPoetryParticular.AddAsync(particular);
            await _context.SaveChangesAsync();
        }


        // =========================================================
        // UPDATE
        // =========================================================

        public async Task UpdateAsync(
            StoryPoetryParticular particular)
        {
            _context.StoryPoetryParticular.Update(particular);
            await _context.SaveChangesAsync();
        }
    }
}