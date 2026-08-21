namespace BookStore.Server.DTOs.Event
{
    public class EventResponse
    {
        public int EventId { get; set; }

        public string EventName { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public DateTime EventDate { get; set; }

        public TimeSpan EventTime { get; set; }

        public string Venue { get; set; } = string.Empty;

        public decimal EntryFee { get; set; }

        public int MaxSeats { get; set; }

        public int AvailableSeats { get; set; }

        public bool IsActive { get; set; }

        // Event Card Image
        public string? ImageUrl { get; set; }

        // Website Banner Image
        public string? BannerImageUrl { get; set; }
    }
}