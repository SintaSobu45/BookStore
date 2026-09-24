namespace BookStore.Server.DTOs.Certificate
{
    public class CertificateCandidateResponse
    {
        public int StoryPoetryId { get; set; }

        public int UserId { get; set; }



        public string Title { get; set; } = string.Empty;

        public string Type { get; set; } = string.Empty;

        public string ContributorNameMalayalam { get; set; } = string.Empty;

        public string ContributorEmail { get; set; } = string.Empty;


        public string SubmissionNumber { get; set; } = string.Empty;

        public int? EventId { get; set; }
        public string? EventName { get; set; }

        public DateTime CreatedDate { get; set; }
    }
}