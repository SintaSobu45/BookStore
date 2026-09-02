using BookStore.Server.DTOs;
using BookStore.Server.DTOs.Editor;
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
        private readonly RegistrationTokenService _registrationTokenService;

        public AccountService(
            AccountRepository repository,
            PasswordHasher passwordHasher,
            JwtHelper jwtHelper,
            EmailService emailService,
            RegistrationTokenService registrationTokenService)
        {
            _repository = repository;
            _passwordHasher = passwordHasher;
            _jwtHelper = jwtHelper;
            _emailService = emailService;
            _registrationTokenService = registrationTokenService;
        }


        // =========================================================
        // REGISTER USER
        // =========================================================

        public async Task<string?> RegisterAsync(
            RegisterRequest request)
        {
            // =====================================================
            // CHECK EMAIL
            // =====================================================

            if (await _repository.EmailExistsAsync(request.Email))
            {
                return null;
            }


            // =====================================================
            // GENERATE OTP
            // =====================================================

            var otp =
                Random.Shared
                    .Next(100000, 1000000)
                    .ToString();


            // =====================================================
            // CREATE TEMPORARY USER OBJECT
            // =====================================================

            var temporaryUser = new User
            {
                Name = request.Name,
                Email = request.Email,
                Phone = request.Phone
            };


            // =====================================================
            // HASH PASSWORD
            // =====================================================

            var passwordHash =
                _passwordHasher.HashPassword(
                    temporaryUser,
                    request.Password
                );


            // =====================================================
            // CREATE PENDING REGISTRATION
            //
            // This is NOT saved to database.
            // =====================================================

            var pendingRegistration =
                new PendingRegistration
                {
                    Name = request.Name,

                    Email = request.Email,

                    Phone = request.Phone,

                    PasswordHash = passwordHash,

                    Otp = otp,

                    OtpExpiry =
                        DateTime.UtcNow.AddMinutes(5)
                };


            // =====================================================
            // CREATE ENCRYPTED TOKEN
            // =====================================================

            var registrationToken =
                _registrationTokenService.CreateToken(
                    pendingRegistration
                );


            // =====================================================
            // SEND OTP EMAIL
            // =====================================================

            var emailBody = $@"
                <div style='font-family: Arial, sans-serif;'>
                    
                    <h2>Email Verification</h2>

                    <p>Hello {request.Name},</p>

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
                request.Email,
                "Email Verification OTP - The Old Library",
                emailBody
            );


            // =====================================================
            // RETURN TOKEN
            // =====================================================

            return registrationToken;
        }


        // =========================================================
        // VERIFY EMAIL OTP
        // =========================================================

        public async Task<string> VerifyEmailAsync(
            VerifyEmailRequest request)
        {
            // =====================================================
            // READ / DECRYPT TOKEN
            // =====================================================

            var pendingRegistration =
                _registrationTokenService.ReadToken(
                    request.RegistrationToken
                );


            if (pendingRegistration == null)
            {
                return "Invalid or expired registration token.";
            }


            // =====================================================
            // CHECK TOKEN EXPIRY
            // =====================================================

            if (pendingRegistration.OtpExpiry <
                DateTime.UtcNow)
            {
                return "OTP has expired.";
            }


            // =====================================================
            // CHECK OTP
            // =====================================================

            if (pendingRegistration.Otp != request.Otp)
            {
                return "Invalid OTP.";
            }


            // =====================================================
            // CHECK EMAIL AGAIN
            //
            // Prevent duplicate account creation.
            // =====================================================

            if (await _repository.EmailExistsAsync(
                    pendingRegistration.Email))
            {
                return "Email already exists.";
            }


            // =====================================================
            // GET USER ROLE
            // =====================================================

            var userRole =
                await _repository.GetRoleByNameAsync("User");


            if (userRole == null)
            {
                return "User role not found.";
            }


            // =====================================================
            // CREATE REAL USER
            //
            // THIS IS THE FIRST DATABASE INSERT.
            // =====================================================

            var user = new User
            {
                Name =
                    pendingRegistration.Name,

                Email =
                    pendingRegistration.Email,

                Phone =
                    pendingRegistration.Phone,

                PasswordHash =
                    pendingRegistration.PasswordHash,

                RoleId =
                    userRole.RoleId,

                IsActive = true,

                EmailVerified = true,

                CreatedDate =
                    DateTime.UtcNow
            };


            // =====================================================
            // SAVE USER TO DATABASE
            // =====================================================

            await _repository.AddUserAsync(user);


            // =====================================================
            // SEND THANK YOU EMAIL
            // =====================================================

            var thankYouEmailBody = $@"
                <div style='font-family: Arial, sans-serif;'>

                    <h2>Welcome to The Old Library!</h2>

                    <p>Hello {user.Name},</p>

                    <p>
                        Your email has been successfully verified
                        and your account has been created.
                    </p>

                    <p>
                        Thank you for registering with
                        <strong>The Old Library</strong>.
                    </p>

                    <p>
                        You can now log in and enjoy our services.
                    </p>

                    <br />

                    <p>
                        Regards,<br />
                        <strong>The Old Library Team</strong>
                    </p>

                </div>
            ";


            await _emailService.SendEmailAsync(
                user.Email,
                "Welcome to The Old Library",
                thankYouEmailBody
            );


            return "Email verified and registration completed successfully.";
        }


        // =========================================================
        // RESEND OTP
        // =========================================================

        public async Task<string?> ResendOtpAsync(
            ResendOtpRequest request)
        {
            // =====================================================
            // READ / DECRYPT OLD TOKEN
            // =====================================================

            var pendingRegistration =
                _registrationTokenService.ReadToken(
                    request.RegistrationToken
                );


            if (pendingRegistration == null)
            {
                return null;
            }


            // =====================================================
            // CHECK IF EMAIL ALREADY EXISTS
            // =====================================================

            if (await _repository.EmailExistsAsync(
                    pendingRegistration.Email))
            {
                return "Email already exists.";
            }


            // =====================================================
            // GENERATE NEW OTP
            // =====================================================

            var newOtp =
                Random.Shared
                    .Next(100000, 1000000)
                    .ToString();


            // =====================================================
            // UPDATE PENDING REGISTRATION
            // =====================================================

            pendingRegistration.Otp = newOtp;

            pendingRegistration.OtpExpiry =
                DateTime.UtcNow.AddMinutes(5);


            // =====================================================
            // CREATE NEW TOKEN
            // =====================================================

            var newRegistrationToken =
                _registrationTokenService.CreateToken(
                    pendingRegistration
                );


            // =====================================================
            // SEND NEW OTP EMAIL
            // =====================================================

            var emailBody = $@"
                <div style='font-family: Arial, sans-serif;'>

                    <h2>New Email Verification OTP</h2>

                    <p>
                        Hello {pendingRegistration.Name},
                    </p>

                    <p>
                        Your new email verification OTP is:
                    </p>

                    <h1 style='letter-spacing: 5px;'>
                        {newOtp}
                    </h1>

                    <p>
                        This OTP will expire in
                        <strong>5 minutes</strong>.
                    </p>

                </div>
            ";


            await _emailService.SendEmailAsync(
                pendingRegistration.Email,
                "New Email Verification OTP - The Old Library",
                emailBody
            );


            // =====================================================
            // RETURN NEW TOKEN
            // =====================================================

            return newRegistrationToken;
        }


        // =========================================================
        // CREATE EDITOR
        // =========================================================

        public async Task<string?> CreateEditorAsync(
            CreateEditorRequest request)
        {
            // =====================================================
            // CHECK EMAIL
            // =====================================================

            if (await _repository.EmailExistsAsync(request.Email))
            {
                return null;
            }


            // =====================================================
            // GET EDITOR ROLE
            // =====================================================

            var editorRole =
                await _repository.GetRoleByNameAsync("Editor");


            if (editorRole == null)
            {
                throw new InvalidOperationException(
                    "Editor role not found."
                );
            }


            // =====================================================
            // CREATE EDITOR USER
            // =====================================================

            var editor = new User
            {
                Name = request.Name,

                Email = request.Email,

                Phone = request.Phone,

                RoleId = editorRole.RoleId,

                IsActive = true,

                // Admin-created account
                // OTP verification is not required
                EmailVerified = true,

                CreatedDate = DateTime.UtcNow
            };


            // =====================================================
            // HASH PASSWORD
            // =====================================================

            editor.PasswordHash =
                _passwordHasher.HashPassword(
                    editor,
                    request.Password
                );


            // =====================================================
            // SAVE EDITOR
            // =====================================================

            await _repository.AddUserAsync(editor);


            // =====================================================
            // SEND EMAIL
            // =====================================================

            var emailBody = $@"
                <div style='font-family: Arial, sans-serif;'>

                    <h2>Editor Account Created</h2>

                    <p>Hello {editor.Name},</p>

                    <p>
                        An Editor account has been created for you
                        by The Old Library administrator.
                    </p>

                    <p>
                        <strong>Email:</strong> {editor.Email}
                    </p>

                    <p>
                        You can now log in using your email and password.
                    </p>

                    <br />

                    <p>
                        Regards,<br />
                        <strong>The Old Library Team</strong>
                    </p>

                </div>
            ";


            await _emailService.SendEmailAsync(
                editor.Email,
                "Editor Account Created - The Old Library",
                emailBody
            );


            return "Editor account created successfully.";
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


            // =====================================================
            // EMAIL VERIFICATION
            //
            // Only normal Users need verification.
            //
            // Admin and Editor accounts are created by Admin,
            // so OTP verification is not required.
            // =====================================================

            if (user.Role?.RoleName == "User" &&
                !user.EmailVerified)
            {
                throw new InvalidOperationException(
                    "Please verify your email before logging in."
                );
            }


            // =====================================================
            // VERIFY PASSWORD
            // =====================================================

            var isValid =
                _passwordHasher.VerifyPassword(
                    user,
                    request.Password
                );


            if (!isValid)
            {
                return null;
            }


            // =====================================================
            // GENERATE JWT
            // =====================================================

            var token =
                _jwtHelper.GenerateToken(user);


            // =====================================================
            // RETURN LOGIN RESPONSE
            // =====================================================

            return new LoginResponse
            {
                UserId =
                    user.UserId,

                FullName =
                    user.Name,

                Email =
                    user.Email,

                Role =
                    user.Role?.RoleName
                    ?? string.Empty,

                Token =
                    token
            };
        }

        // =========================================================
        // GET ALL EDITORS
        // ADMIN ONLY
        // =========================================================

        public async Task<List<EditorResponse>> GetAllEditorsAsync()
        {
            var editors =
                await _repository.GetAllEditorsAsync();

            return editors.Select(editor => new EditorResponse
            {
                UserId = editor.UserId,
                Name = editor.Name,
                Email = editor.Email,
                Phone = editor.Phone,
                IsActive = editor.IsActive,
                CreatedDate = editor.CreatedDate
            }).ToList();
        }
    }
}