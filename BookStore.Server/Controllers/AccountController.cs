using BookStore.Server.DTOs;
using BookStore.Server.Services;
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
            var result =
                await _accountService.RegisterAsync(request);

            if (!result)
            {
                return BadRequest(new
                {
                    message = "Email already exists."
                });
            }

            return Ok(new
            {
                message =
                    "Registration successful. Please check your email for the OTP."
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

            if (result == "User not found.")
            {
                return NotFound(new
                {
                    message = result
                });
            }

            if (result == "Email is already verified.")
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

            if (result == "User not found.")
            {
                return NotFound(new
                {
                    message = result
                });
            }

            if (result == "Email is already verified.")
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
                        message = "Invalid email or password."
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
    }
}