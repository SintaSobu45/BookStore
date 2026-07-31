namespace BookStore.Server.DTOs.Book
{
    public class BookResponse
    {
        public int BookId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string? ISBN { get; set; }

        public decimal Price { get; set; }

        public int StockQuantity { get; set; }

        public DateTime? PublishedDate { get; set; }

        public string? Description { get; set; }

        public bool IsActive { get; set; }

        public string CategoryName { get; set; } = string.Empty;

        public string AuthorName { get; set; } = string.Empty;

        public string PublisherName { get; set; } = string.Empty;

        // Will be populated after Cloudinary integration
        public string? ImageUrl { get; set; }
    }
}