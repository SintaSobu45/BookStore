using Microsoft.AspNetCore.Identity;
using BookStore.Server.Models;

namespace BookStore.Server.Helpers
{
    public class PasswordHasher
    {
        private readonly Microsoft.AspNetCore.Identity.PasswordHasher<User> _passwordHasher;

        public PasswordHasher()
        {
            _passwordHasher = new Microsoft.AspNetCore.Identity.PasswordHasher<User>();
        }

        public string HashPassword(User user, string password)
        {
            return _passwordHasher.HashPassword(user, password);
        }

        public bool VerifyPassword(User user, string password)
        {
            var result = _passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                password
            );

            return result == PasswordVerificationResult.Success;
        }
    }
}