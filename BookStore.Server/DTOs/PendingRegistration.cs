namespace BookStore.Server.Models
{
    public class PendingRegistration
    {
        public string Name { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public string Otp { get; set; } = string.Empty;

        public DateTime OtpExpiry { get; set; }
    }
}