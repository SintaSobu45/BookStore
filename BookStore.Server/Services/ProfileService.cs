using BookStore.Server.DTOs.Profile;
using BookStore.Server.Repositories;

namespace BookStore.Server.Services
{
    public class ProfileService
    {
        private readonly ProfileRepository _profileRepository;
        private readonly CloudinaryService _cloudinaryService;

        public ProfileService(
            ProfileRepository profileRepository,
            CloudinaryService cloudinaryService)
        {
            _profileRepository = profileRepository;
            _cloudinaryService = cloudinaryService;
        }

        // Get Profile
        public async Task<GetProfileResponse?> GetProfileAsync(int userId)
        {
            return await _profileRepository.GetProfileAsync(userId);
        }

        // Update Profile
        public async Task<GetProfileResponse?> UpdateProfileAsync(
            int userId,
            UpdateProfileRequest request)
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

        // Upload Profile Image
        public async Task<GetProfileResponse?> UploadProfileImageAsync(
            int userId,
            IFormFile image)
        {
            var user = await _profileRepository.GetUserByIdAsync(userId);

            if (user == null)
                return null;

            // Upload image to Cloudinary
            var uploadResult = await _cloudinaryService.UploadImageAsync(image);

            if (uploadResult == null)
                return null;

            // Save Cloudinary URL
            user.ProfileImageUrl = uploadResult.ImageUrl;
            user.UpdatedDate = DateTime.UtcNow;

            await _profileRepository.UpdateAsync(user);

            return await _profileRepository.GetProfileAsync(userId);
        }
    }
}