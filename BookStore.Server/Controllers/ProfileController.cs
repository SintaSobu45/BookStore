using BookStore.Server.DTOs.Profile;
using BookStore.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookStore.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly ProfileService _profileService;

        public ProfileController(
            ProfileService profileService)
        {
            _profileService = profileService;
        }


        // =========================================================
        // GET PROFILE
        // =========================================================

        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var userId = GetUserIdFromToken();

            var profile =
                await _profileService
                    .GetProfileAsync(userId);

            if (profile == null)
                return NotFound("Profile not found");

            return Ok(profile);
        }


        // =========================================================
        // UPDATE PROFILE
        // =========================================================

        [HttpPut]
        public async Task<IActionResult> UpdateProfile(
            UpdateProfileRequest request)
        {
            var userId =
                GetUserIdFromToken();

            var updatedProfile =
                await _profileService
                    .UpdateProfileAsync(
                        userId,
                        request);

            if (updatedProfile == null)
                return NotFound("User not found");

            return Ok(new
            {
                message = "Profile updated successfully",
                profile = updatedProfile
            });
        }


        // =========================================================
        // UPLOAD PROFILE IMAGE
        // =========================================================

        [HttpPost("image")]
        public async Task<IActionResult> UploadProfileImage(
            IFormFile image)
        {
            var userId =
                GetUserIdFromToken();

            if (image == null || image.Length == 0)
            {
                return BadRequest(
                    "Please select an image.");
            }


            var profile =
                await _profileService
                    .UploadProfileImageAsync(
                        userId,
                        image);

            if (profile == null)
                return NotFound("User not found");


            return Ok(new
            {
                message =
                    "Profile image uploaded successfully",

                profile = profile
            });
        }


        // =========================================================
        // GET USER ID FROM JWT
        // =========================================================

        private int GetUserIdFromToken()
        {
            var userId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException(
                    "User ID not found.");

            return int.Parse(userId);
        }
    }
}