using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs.Payment
{
    public class CreateStoryPoetryPaymentRequest
    {
        [Required]
        public int StoryPoetryId { get; set; }
    }
}