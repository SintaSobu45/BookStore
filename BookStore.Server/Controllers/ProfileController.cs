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

        public ProfileController(ProfileService profileService)
        {
            _profileService = profileService;
        }


        // GET: api/Profile
        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var userId = GetUserIdFromToken();

            var profile = await _profileService.GetProfileAsync(userId);

            if (profile == null)
                return NotFound("Profile not found");

            return Ok(profile);
        }


        // PUT: api/Profile
        [HttpPut]
        public async Task<IActionResult> UpdateProfile(UpdateProfileRequest request)
        {
            var userId = GetUserIdFromToken();

            var updatedProfile = await _profileService
                .UpdateProfileAsync(userId, request);

            if (updatedProfile == null)
                return NotFound("User not found");

            return Ok(new
            {
                message = "Profile updated successfully",
                profile = updatedProfile
            });
        }


        // Get UserId from JWT Token
        private int GetUserIdFromToken()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            return int.Parse(userId);
        }
    }
}