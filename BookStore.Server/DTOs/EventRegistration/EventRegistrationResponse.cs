namespace BookStore.Server.DTOs.EventRegistration
{
    public class EventRegistrationResponse
    {
        public int RegistrationId { get; set; }

        public string UserName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string EventName { get; set; } = string.Empty;

        public DateTime EventDate { get; set; }

        public string Venue { get; set; } = string.Empty;

        public int NumberOfSeats { get; set; }

        public decimal TotalAmount { get; set; }

        public string Status { get; set; } = string.Empty;

        public string PaymentStatus { get; set; } = string.Empty;

        public string PaymentMethod { get; set; } = string.Empty;

        public DateTime RegistrationDate { get; set; }
    }
}