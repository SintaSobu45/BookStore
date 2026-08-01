namespace BookStore.Server.DTOs.Review
{
    public class ReviewResponse
    {
        public int ReviewId { get; set; }

        public int Rating { get; set; }

        public string? Comment { get; set; }

        public string UserName { get; set; } = string.Empty;

        public string BookTitle { get; set; } = string.Empty;

        public DateTime CreatedDate { get; set; }
    }
}