using BookStore.Server.Data;
using BookStore.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Server.Repositories
{
    public class CertificateRepository
    {
        private readonly ApplicationDbContext _context;

        public CertificateRepository(
            ApplicationDbContext context)
        {
            _context = context;
        }


        // =========================================================
        // ADD
        // =========================================================

        public async Task<Certificate> AddAsync(
            Certificate certificate)
        {
            _context.Certificates.Add(certificate);

            await _context.SaveChangesAsync();

            return certificate;
        }


        // =========================================================
        // ADD MULTIPLE
        // =========================================================

        public async Task<List<Certificate>> AddRangeAsync(
            List<Certificate> certificates)
        {
            _context.Certificates.AddRange(certificates);

            await _context.SaveChangesAsync();

            return certificates;
        }


        // =========================================================
        // GET BY ID
        // =========================================================

        public async Task<Certificate?> GetByIdAsync(
            int id)
        {
            return await _context.Certificates
                .Include(c => c.StoryPoetry)
                .FirstOrDefaultAsync(
                    c => c.CertificateId == id);
        }


        // =========================================================
        // GET BY STORY / POETRY
        // =========================================================

        public async Task<Certificate?> GetByStoryPoetryIdAsync(
            int storyPoetryId)
        {
            return await _context.Certificates
                .Include(c => c.StoryPoetry)
                .FirstOrDefaultAsync(
                    c => c.StoryPoetryId == storyPoetryId);
        }


        // =========================================================
        // EXISTS FOR STORY / POETRY
        // =========================================================

        public async Task<bool> ExistsForStoryPoetryAsync(
            int storyPoetryId)
        {
            return await _context.Certificates
                .AnyAsync(
                    c => c.StoryPoetryId == storyPoetryId);
        }


        // =========================================================
        // UPDATE
        // =========================================================

        public async Task<Certificate?> UpdateAsync(
            Certificate certificate)
        {
            _context.Certificates.Update(certificate);

            await _context.SaveChangesAsync();

            return certificate;
        }


        // =========================================================
        // GET ALL
        // =========================================================

        public async Task<List<Certificate>> GetAllAsync()
        {
            return await _context.Certificates
                .Include(c => c.StoryPoetry)
                .OrderByDescending(c => c.CreatedDate)
                .ToListAsync();
        }
    }
}