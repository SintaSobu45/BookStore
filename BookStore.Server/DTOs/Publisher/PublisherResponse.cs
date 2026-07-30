namespace BookStore.Server.DTOs.Publisher
{
    public class PublisherResponse
    {
        public int PublisherId { get; set; }

        public string PublisherName { get; set; } = string.Empty;

        public string? Description { get; set; }

        public bool IsActive { get; set; }

        public DateTime CreatedDate { get; set; }

        public DateTime? UpdatedDate { get; set; }
    }
}