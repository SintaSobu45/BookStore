using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs.EventContributor
{
    public class AddEventContributorRequest
    {
        [Required]
        [Range(1, int.MaxValue)]
        public int EventId { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int StoryPoetryId { get; set; }
    }
}