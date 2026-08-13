namespace BookStore.Server.DTOs.StoryPoetry
{
    public class StoryPoetryResponse
    {
        public int StoryPoetryId { get; set; }

        public int UserId { get; set; }

        public string UserName { get; set; } = string.Empty;

        public string? ProfileImageUrl { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Type { get; set; } = string.Empty;

        public int CategoryId { get; set; }

        public string CategoryName { get; set; } = string.Empty;

        public string Content { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public DateTime? ReviewedDate { get; set; }

        public string? AdminRemarks { get; set; }

        public DateTime CreatedDate { get; set; }

        public DateTime? UpdatedDate { get; set; }
    }
}