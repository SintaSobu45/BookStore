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


        // =========================================================
        // GET PROFILE
        // =========================================================

        public async Task<GetProfileResponse?> GetProfileAsync(
            int userId)
        {
            return await _context.Users
                .Where(u => u.UserId == userId)
                .Select(u => new GetProfileResponse
                {
                    // Basic details
                    UserId = u.UserId,

                    Name = u.Name,

                    Email = u.Email,

                    Phone = u.Phone,


                    // Profile image
                    ProfileImageUrl =
                        u.ProfileImageUrl,


                    // Normal address
                    Address = u.Address,

                    City = u.City,

                    District = u.District,

                    State = u.State,

                    Pincode = u.Pincode,


                    // Malayalam details
                    NameMalayalam =
                        u.NameMalayalam,

                    AddressMalayalam =
                        u.AddressMalayalam,

                    CityMalayalam =
                        u.CityMalayalam,

                    DistrictMalayalam =
                        u.DistrictMalayalam,

                    StateMalayalam =
                        u.StateMalayalam
                })
                .FirstOrDefaultAsync();
        }


        // =========================================================
        // GET USER ENTITY
        // =========================================================

        public async Task<User?> GetUserByIdAsync(
            int userId)
        {
            return await _context.Users
                .FirstOrDefaultAsync(
                    u => u.UserId == userId);
        }


        // =========================================================
        // UPDATE PROFILE
        // =========================================================

        public async Task<User> UpdateAsync(User user)
        {
            _context.Users.Update(user);

            await _context.SaveChangesAsync();

            return user;
        }
    }
}