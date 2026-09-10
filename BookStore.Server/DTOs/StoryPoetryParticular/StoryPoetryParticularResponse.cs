namespace BookStore.Server.DTOs.StoryPoetryParticular
{
    public class StoryPoetryParticularResponse
    {
        public int StoryPoetryParticularId { get; set; }

        public string Type { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;

        public decimal ExtraCopyPrice { get; set; }

        public bool IsActive { get; set; }

        public DateTime CreatedDate { get; set; }

        public DateTime? UpdatedDate { get; set; }
    }
}