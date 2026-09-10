using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs.Payment
{
    public class CreateStoryPoetryPaymentRequest
    {
        [Required]
        public int StoryPoetryId { get; set; }

        [Range(
            0,
            int.MaxValue,
            ErrorMessage = "Extra copies cannot be negative."
        )]
        public int ExtraCopies { get; set; }
    }
}