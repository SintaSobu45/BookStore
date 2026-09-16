using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs.StoryPoetryCopySetting
{
    public class UpdateStoryPoetryCopySettingRequest
    {
        [Range(0, int.MaxValue, ErrorMessage = "Free copies cannot be negative.")]
        public int FreeCopies { get; set; }
    }
}