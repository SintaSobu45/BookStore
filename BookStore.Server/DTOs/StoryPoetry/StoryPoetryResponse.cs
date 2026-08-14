namespace BookStore.Server.DTOs.StoryPoetry
{
    public class StoryPoetryResponse
    {
        public int StoryPoetryId { get; set; }

        public int UserId { get; set; }

        public string UserName { get; set; } = string.Empty;

        public string? ProfileImageUrl { get; set; }

        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string Title { get; set; } = string.Empty;

        public string Type { get; set; } = string.Empty;

       

        public string Content { get; set; } = string.Empty;

        public DateTime CreatedDate { get; set; }

        public DateTime? UpdatedDate { get; set; }
    }
}