namespace BookStore.Server.DTOs.Certificate
{
    public class BulkCertificateGenerateRequest
    {
        public List<int> StoryPoetryIds { get; set; }
            = new List<int>();
    }
}