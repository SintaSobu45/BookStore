namespace BookStore.Server.DTOs.Certificate
{
    public class CertificateSummaryResponse
    {
        public int CertificateId { get; set; }

        public int StoryPoetryId { get; set; }

        public int UserId { get; set; }

        public string CertificateNumber { get; set; } = string.Empty;

        public string RecipientName { get; set; } = string.Empty;

        public DateTime IssuedDate { get; set; }

        public bool IsSent { get; set; }
    }
}