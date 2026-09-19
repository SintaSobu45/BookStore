namespace BookStore.Server.DTOs.StoryPoetry
{
    public class StoryPoetryEventReportDto
    {
        public int UserId { get; set; }

        public string? WriterName { get; set; }

        public string? SubmissionNumber { get; set; }

        public string? Phone { get; set; }

        public string? Address { get; set; }

        public DateTime? PaymentDate { get; set; }

        public decimal PaymentAmount { get; set; }

        public string? ParticularName { get; set; }

        public int TotalCopies { get; set; }

        public DateTime? EventRegDate { get; set; }

        public decimal EventAmount { get; set; }

        public string? SpOrderStatus { get; set; }

        public string? Barcode { get; set; }
    }
}