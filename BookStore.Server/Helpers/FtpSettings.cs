namespace BookStore.Server.Helpers
{
    public class FtpSettings
    {
        public string Host { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string RemoteFolder { get; set; } = string.Empty;
        public string PublicBaseUrl { get; set; } = string.Empty;
    }
}