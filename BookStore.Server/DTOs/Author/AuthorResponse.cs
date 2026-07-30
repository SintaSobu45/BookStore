namespace BookStore.Server.DTOs.Author
{
    public class AuthorResponse
    {
        public int AuthorId { get; set; }

        public string AuthorName { get; set; } = string.Empty;

        public string? Biography { get; set; }

        public bool IsActive { get; set; }

        public DateTime CreatedDate { get; set; }

        public DateTime? UpdatedDate { get; set; }
    }
}