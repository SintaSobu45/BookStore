using BookStore.Server.DTOs;
using BookStore.Server.DTOs.Editor;
using BookStore.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly AccountService _accountService;

        public AccountController(AccountService accountService)
        {
            _accountService = accountService;
        }


        // =========================================================
        // REGISTER
        // =========================================================

        [HttpPost("register")]
        public async Task<IActionResult> Register(
            RegisterRequest request)
        {
            var registrationToken =
                await _accountService.RegisterAsync(request);

            if (registrationToken == null)
            {
                return BadRequest(new
                {
                    message = "Email already exists."
                });
            }

            return Ok(new
            {
                message =
                    "Registration started. Please check your email for the OTP.",

                registrationToken = registrationToken
            });
        }


        // =========================================================
        // VERIFY EMAIL OTP
        // =========================================================

        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail(
            VerifyEmailRequest request)
        {
            var result =
                await _accountService.VerifyEmailAsync(request);

            if (result ==
                "Invalid or expired registration token.")
            {
                return BadRequest(new
                {
                    message = result
                });
            }

            if (result == "Invalid OTP.")
            {
                return BadRequest(new
                {
                    message = result
                });
            }

            if (result == "OTP has expired.")
            {
                return BadRequest(new
                {
                    message = result
                });
            }

            if (result == "Email already exists.")
            {
                return BadRequest(new
                {
                    message = result
                });
            }

            if (result == "User role not found.")
            {
                return BadRequest(new
                {
                    message = result
                });
            }

            return Ok(new
            {
                message = result
            });
        }


        // =========================================================
        // RESEND OTP
        // =========================================================

        [HttpPost("resend-otp")]
        public async Task<IActionResult> ResendOtp(
            ResendOtpRequest request)
        {
            var result =
                await _accountService.ResendOtpAsync(request);

            if (result == null)
            {
                return BadRequest(new
                {
                    message =
                        "Invalid or expired registration token."
                });
            }

            if (result == "Email already exists.")
            {
                return BadRequest(new
                {
                    message = result
                });
            }

            return Ok(new
            {
                message =
                    "New OTP sent successfully.",

                registrationToken = result
            });
        }


        // =========================================================
        // LOGIN
        // =========================================================

        [HttpPost("login")]
        public async Task<IActionResult> Login(
            LoginRequest request)
        {
            try
            {
                var result =
                    await _accountService.LoginAsync(request);

                if (result == null)
                {
                    return Unauthorized(new
                    {
                        message =
                            "Invalid email or password."
                    });
                }

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }


        // =========================================================
        // CREATE EDITOR
        // ADMIN ONLY
        // =========================================================

        [Authorize(Roles = "Admin")]
        [HttpPost("create-editor")]
        public async Task<IActionResult> CreateEditor(
            CreateEditorRequest request)
        {
            try
            {
                var result =
                    await _accountService.CreateEditorAsync(request);

                if (result == null)
                {
                    return BadRequest(new
                    {
                        message = "Email already exists."
                    });
                }

                return Ok(new
                {
                    message = result
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }
        // =========================================================
        // GET ALL EDITORS
        // ADMIN ONLY
        // =========================================================

        [Authorize(Roles = "Admin")]
        [HttpGet("editors")]
        public async Task<IActionResult> GetAllEditors()
        {
            var editors =
                await _accountService.GetAllEditorsAsync();

            return Ok(editors);
        }
    }
}