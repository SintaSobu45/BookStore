namespace BookStore.Server.DTOs.Certificate
{
    public class CertificateSendResponse
    {
        public int CertificateId { get; set; }

        public bool IsSent { get; set; }

        public DateTime? SentDate { get; set; }

        public string Message { get; set; } = string.Empty;
    }
}