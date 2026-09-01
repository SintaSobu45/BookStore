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
        private readonly EmailService _emailService;

        public AccountService(
            AccountRepository repository,
            PasswordHasher passwordHasher,
            JwtHelper jwtHelper,
            EmailService emailService)
        {
            _repository = repository;
            _passwordHasher = passwordHasher;
            _jwtHelper = jwtHelper;
            _emailService = emailService;
        }


        // =========================================================
        // REGISTER USER
        // =========================================================

        public async Task<bool> RegisterAsync(
            RegisterRequest request)
        {
            // Check if email already exists
            if (await _repository.EmailExistsAsync(request.Email))
            {
                return false;
            }


            // Get User Role
            var userRole =
                await _repository.GetRoleByNameAsync("User");

            if (userRole == null)
            {
                return false;
            }


            // Generate 6-digit OTP
            var otp =
                Random.Shared.Next(100000, 1000000).ToString();


            // Create User
            var user = new User
            {
                Name = request.Name,

                Email = request.Email,

                Phone = request.Phone,

                RoleId = userRole.RoleId,

                IsActive = true,

                EmailVerified = false,

                EmailVerificationOtp = otp,

                EmailVerificationOtpExpiry =
                    DateTime.UtcNow.AddMinutes(5),

                CreatedDate = DateTime.UtcNow
            };


            // Hash Password
            user.PasswordHash =
                _passwordHasher.HashPassword(
                    user,
                    request.Password
                );


            // Save User
            await _repository.AddUserAsync(user);


            // Send OTP Email
            var emailBody = $@"
                <div style='font-family: Arial, sans-serif;'>
                    <h2>Email Verification</h2>

                    <p>Hello {user.Name},</p>

                    <p>
                        Thank you for registering with
                        <strong>The Old Library</strong>.
                    </p>

                    <p>
                        Your email verification OTP is:
                    </p>

                    <h1 style='letter-spacing: 5px;'>
                        {otp}
                    </h1>

                    <p>
                        This OTP will expire in
                        <strong>5 minutes</strong>.
                    </p>

                    <p>
                        If you did not create this account,
                        please ignore this email.
                    </p>
                </div>
            ";

            await _emailService.SendEmailAsync(
                user.Email,
                "Email Verification OTP - The Old Library",
                emailBody
            );

            return true;
        }


        // =========================================================
        // VERIFY EMAIL OTP
        // =========================================================

        public async Task<string> VerifyEmailAsync(
            VerifyEmailRequest request)
        {
            var user =
                await _repository.GetUserByEmailAsync(
                    request.Email);

            if (user == null)
            {
                return "User not found.";
            }


            // Already verified
            if (user.EmailVerified)
            {
                return "Email is already verified.";
            }


            // Check OTP
            if (user.EmailVerificationOtp != request.Otp)
            {
                return "Invalid OTP.";
            }


            // Check expiry
            if (user.EmailVerificationOtpExpiry == null ||
                user.EmailVerificationOtpExpiry < DateTime.UtcNow)
            {
                return "OTP has expired.";
            }


            // Verify email
            user.EmailVerified = true;

            user.EmailVerificationOtp = null;

            user.EmailVerificationOtpExpiry = null;

            user.UpdatedDate = DateTime.UtcNow;


            await _repository.SaveChangesAsync();


            return "Email verified successfully.";
        }


        // =========================================================
        // RESEND OTP
        // =========================================================

        public async Task<string> ResendOtpAsync(
            ResendOtpRequest request)
        {
            var user =
                await _repository.GetUserByEmailAsync(
                    request.Email);

            if (user == null)
            {
                return "User not found.";
            }


            // Already verified
            if (user.EmailVerified)
            {
                return "Email is already verified.";
            }


            // Generate new OTP
            var otp =
                Random.Shared.Next(100000, 1000000).ToString();


            user.EmailVerificationOtp = otp;

            user.EmailVerificationOtpExpiry =
                DateTime.UtcNow.AddMinutes(5);

            user.UpdatedDate = DateTime.UtcNow;


            await _repository.SaveChangesAsync();


            // Send new OTP
            var emailBody = $@"
                <div style='font-family: Arial, sans-serif;'>
                    <h2>Email Verification</h2>

                    <p>Hello {user.Name},</p>

                    <p>
                        Your new email verification OTP is:
                    </p>

                    <h1 style='letter-spacing: 5px;'>
                        {otp}
                    </h1>

                    <p>
                        This OTP will expire in
                        <strong>5 minutes</strong>.
                    </p>
                </div>
            ";


            await _emailService.SendEmailAsync(
                user.Email,
                "New Email Verification OTP - The Old Library",
                emailBody
            );


            return "OTP sent successfully.";
        }


        // =========================================================
        // LOGIN USER
        // =========================================================

        public async Task<LoginResponse?> LoginAsync(
            LoginRequest request)
        {
            var user =
                await _repository.GetUserByEmailAsync(
                    request.Email);

            if (user == null)
            {
                return null;
            }


            // Check email verification
            if (!user.EmailVerified)
            {
                throw new InvalidOperationException(
                    "Please verify your email before logging in."
                );
            }


            // Verify Password
            var isValid =
                _passwordHasher.VerifyPassword(
                    user,
                    request.Password
                );

            if (!isValid)
            {
                return null;
            }


            // Generate JWT
            var token =
                _jwtHelper.GenerateToken(user);


            return new LoginResponse
            {
                UserId = user.UserId,

                FullName = user.Name,

                Email = user.Email,

                Role =
                    user.Role?.RoleName
                    ?? string.Empty,

                Token = token
            };
        }
    }
}