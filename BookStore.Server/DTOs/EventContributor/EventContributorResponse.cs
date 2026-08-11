namespace BookStore.Server.DTOs.EventContributor
{
    public class EventContributorResponse
    {
        public int EventContributorId { get; set; }

        public int EventId { get; set; }

        public string EventName { get; set; } = string.Empty;

        public int UserId { get; set; }

        public string UserName { get; set; } = string.Empty;

        public int StoryPoetryId { get; set; }

        public string StoryPoetryTitle { get; set; } = string.Empty;

        public string Type { get; set; } = string.Empty;

        public DateTime AddedDate { get; set; }
    }
}