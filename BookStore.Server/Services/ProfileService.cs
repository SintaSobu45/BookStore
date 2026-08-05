using BookStore.Server.DTOs.Profile;
using BookStore.Server.Repositories;

namespace BookStore.Server.Services
{
    public class ProfileService
    {
        private readonly ProfileRepository _profileRepository;

        public ProfileService(ProfileRepository profileRepository)
        {
            _profileRepository = profileRepository;
        }

        // Get Profile
        public async Task<GetProfileResponse?> GetProfileAsync(int userId)
        {
            return await _profileRepository.GetProfileAsync(userId);
        }

        // Update Profile
        public async Task<GetProfileResponse?> UpdateProfileAsync(int userId, UpdateProfileRequest request)
        {
            var user = await _profileRepository.GetUserByIdAsync(userId);

            if (user == null)
                return null;

            // Update Details
            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
            user.Phone = request.Phone;
            user.Address = request.Address;
            user.City = request.City;
            user.State = request.State;
            user.Pincode = request.Pincode;
            user.UpdatedDate = DateTime.UtcNow;

            await _profileRepository.UpdateAsync(user);

            return await _profileRepository.GetProfileAsync(userId);
        }
    }
}