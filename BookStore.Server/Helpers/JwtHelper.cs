using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BookStore.Server.Models;
using Microsoft.IdentityModel.Tokens;

namespace BookStore.Server.Helpers
{
    public class JwtHelper
    {
        private readonly IConfiguration _configuration;

        public JwtHelper(IConfiguration configuration)
        {
            _configuration = configuration;
        }


        // =========================================================
        // GENERATE JWT TOKEN
        // =========================================================

        public string GenerateToken(User user)
        {
            var claims = new List<Claim>
            {
                // User ID
                new Claim(
                    ClaimTypes.NameIdentifier,
                    user.UserId.ToString()
                ),

                // User Name
                new Claim(
                    ClaimTypes.Name,
                    user.Name
                ),

                // Email
                new Claim(
                    ClaimTypes.Email,
                    user.Email
                ),

                // Role
                new Claim(
                    ClaimTypes.Role,
                    user.Role?.RoleName ?? string.Empty
                )
            };


            // =====================================================
            // JWT KEY
            // =====================================================

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    _configuration["Jwt:Key"]!
                )
            );


            // =====================================================
            // SIGNING CREDENTIALS
            // =====================================================

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256
            );


            // =====================================================
            // CREATE TOKEN
            // =====================================================

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: credentials
            );


            // =====================================================
            // RETURN TOKEN
            // =====================================================

            return new JwtSecurityTokenHandler()
                .WriteToken(token);
        }
    }
}