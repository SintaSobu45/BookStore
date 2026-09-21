namespace BookStore.Server.DTOs.StoryPoetry
{
    public class EventCopyPreparationReportDto
    {
        public int UserId { get; set; }

        public string? WriterName { get; set; }

        public string? Phone { get; set; }

        public string? BookTitle { get; set; }

        public string? BookType { get; set; }

        public string? ParticularName { get; set; }

        public string? SubmissionNumber { get; set; }

        public int TotalCopies { get; set; }

        public string? SpOrderStatus { get; set; }

        public string? Barcode { get; set; }

        public DateTime EventRegistrationDate { get; set; }
    }
}