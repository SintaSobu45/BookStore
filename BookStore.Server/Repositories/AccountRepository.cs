using BookStore.Server.Data;
using BookStore.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Server.Repositories
{
    public class AccountRepository
    {
        private readonly ApplicationDbContext _context;

        public AccountRepository(ApplicationDbContext context)
        {
            _context = context;
        }


        // =========================================================
        // CHECK IF EMAIL ALREADY EXISTS
        // =========================================================

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _context.Users
                .AnyAsync(u => u.Email == email);
        }


        // =========================================================
        // GET ROLE BY NAME
        // =========================================================

        public async Task<Role?> GetRoleByNameAsync(string roleName)
        {
            return await _context.Roles
                .FirstOrDefaultAsync(r => r.RoleName == roleName);
        }


        // =========================================================
        // REGISTER USER / CREATE EDITOR
        // =========================================================

        public async Task AddUserAsync(User user)
        {
            await _context.Users.AddAsync(user);

            await _context.SaveChangesAsync();
        }


        // =========================================================
        // GET USER BY EMAIL
        // =========================================================

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == email);
        }


        // =========================================================
        // GET ALL EDITORS
        // =========================================================

        public async Task<List<User>> GetAllEditorsAsync()
        {
            return await _context.Users
                .Include(u => u.Role)
                .Where(u => u.Role != null &&
                            u.Role.RoleName == "Editor")
                .OrderByDescending(u => u.CreatedDate)
                .ToListAsync();
        }

        // =========================================================
        // GET EDITOR BY ID
        // =========================================================

        public async Task<User?> GetEditorByIdAsync(int userId)
        {
            return await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u =>
                    u.UserId == userId &&
                    u.Role != null &&
                    u.Role.RoleName == "Editor");
        }
        // =========================================================
        // CHECK EMAIL EXISTS FOR ANOTHER USER
        // =========================================================

        public async Task<bool> EmailExistsForOtherUserAsync(
            string email,
            int userId)
        {
            return await _context.Users
                .AnyAsync(u =>
                    u.Email == email &&
                    u.UserId != userId);
        }


        // =========================================================
        // SAVE CHANGES
        // Used for email verification and OTP updates
        // =========================================================

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        // DELETE EDITOR
        public async Task DeleteEditorAsync(User editor)
        {
            _context.Users.Remove(editor);
            await _context.SaveChangesAsync();
        }
    }
}