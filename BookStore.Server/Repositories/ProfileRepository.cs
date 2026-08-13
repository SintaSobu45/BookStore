using BookStore.Server.Data;
using BookStore.Server.DTOs.Profile;
using BookStore.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Server.Repositories
{
    public class ProfileRepository
    {
        private readonly ApplicationDbContext _context;

        public ProfileRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // Get Profile
        public async Task<GetProfileResponse?> GetProfileAsync(int userId)
        {
            return await _context.Users
                .Where(u => u.UserId == userId)
                .Select(u => new GetProfileResponse
                {
                    UserId = u.UserId,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Email = u.Email,
                    Phone = u.Phone,
                    ProfileImageUrl = u.ProfileImageUrl,
                    Address = u.Address,
                    City = u.City,
                    State = u.State,
                    Pincode = u.Pincode
                })
                .FirstOrDefaultAsync();
        }

        // Get User Entity
        public async Task<User?> GetUserByIdAsync(int userId)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == userId);
        }

        // Update Profile
        public async Task<User> UpdateAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return user;
        }
    }
}