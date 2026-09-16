namespace BookStore.Server.DTOs.StoryPoetryCopySetting
{
    public class StoryPoetryCopySettingResponse
    {
        public int StoryPoetryCopySettingId { get; set; }

        public string Type { get; set; } = string.Empty;

        public int FreeCopies { get; set; }

        public DateTime CreatedDate { get; set; }

        public DateTime? UpdatedDate { get; set; }
    }
}