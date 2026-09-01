using System.Text.Json;
using BookStore.Server.Models;
using Microsoft.AspNetCore.DataProtection;

namespace BookStore.Server.Services
{
    public class RegistrationTokenService
    {
        private readonly IDataProtector _protector;

        public RegistrationTokenService(
            IDataProtectionProvider dataProtectionProvider)
        {
            _protector =
                dataProtectionProvider.CreateProtector(
                    "BookStore.RegistrationToken");
        }


        // =========================================================
        // CREATE REGISTRATION TOKEN
        // =========================================================

        public string CreateToken(
            PendingRegistration registration)
        {
            var json =
                JsonSerializer.Serialize(registration);

            return _protector.Protect(json);
        }


        // =========================================================
        // READ REGISTRATION TOKEN
        // =========================================================

        public PendingRegistration? ReadToken(
            string token)
        {
            try
            {
                var json =
                    _protector.Unprotect(token);

                var registration =
                    JsonSerializer.Deserialize<PendingRegistration>(
                        json);

                return registration;
            }
            catch
            {
                return null;
            }
        }
    }
}