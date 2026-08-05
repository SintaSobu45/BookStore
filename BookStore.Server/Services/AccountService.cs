using BookStore.Server.DTOs;
using BookStore.Server.Helpers;
using BookStore.Server.Models;
using BookStore.Server.Repositories;

namespace BookStore.Server.Services
{
    public class AccountService
    {
        private readonly AccountRepository _repository;
        private readonly PasswordHasher _passwordHasher;
        private readonly JwtHelper _jwtHelper;

        public AccountService(
            AccountRepository repository,
            PasswordHasher passwordHasher,
            JwtHelper jwtHelper)
        {
            _repository = repository;
            _passwordHasher = passwordHasher;
            _jwtHelper = jwtHelper;
        }

        // Register User
        public async Task<bool> RegisterAsync(RegisterRequest request)
        {
            // Check Email Exists
            if (await _repository.EmailExistsAsync(request.Email))
            {
                return false;
            }

            // Get User Role
            var userRole = await _repository.GetRoleByNameAsync("User");

            if (userRole == null)
            {
                return false;
            }

            // Create User
            var user = new User
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                Phone = request.Phone,

                Address = request.Address,
                City = request.City,
                State = request.State,
                Pincode = request.Pincode,

                RoleId = userRole.RoleId,
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };

            // Hash Password
            user.PasswordHash = _passwordHasher.HashPassword(
                user,
                request.Password
            );

            // Save User
            await _repository.AddUserAsync(user);

            return true;
        }

        // Login User
        public async Task<LoginResponse?> LoginAsync(LoginRequest request)
        {
            var user = await _repository.GetUserByEmailAsync(request.Email);

            if (user == null)
            {
                return null;
            }

            var isValid = _passwordHasher.VerifyPassword(
                user,
                request.Password
            );

            if (!isValid)
            {
                return null;
            }

            var token = _jwtHelper.GenerateToken(user);

            return new LoginResponse
            {
                UserId = user.UserId,
                FullName = $"{user.FirstName} {user.LastName}",
                Email = user.Email,
                Role = user.Role?.RoleName ?? "",
                Token = token
            };
        }
    }
}