using BookStore.Server.Models;
using BookStore.Server.Models.Event;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class EventRegistration
{
    [Key]
    public int RegistrationId { get; set; }

    public int UserId { get; set; }

    public int EventId { get; set; }

    public int NumberOfSeats { get; set; }

    // Total number of book copies requested
    public int BookCopies { get; set; } = 0;

    // Free book copies given to approved contributors
    public int FreeBookCopies { get; set; } = 0;

    // Additional book copies that need payment
    public int PaidBookCopies { get; set; } = 0;

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Registered";

    public DateTime RegistrationDate { get; set; } = DateTime.UtcNow;

    // Navigation
    public User User { get; set; }

    public Event Event { get; set; }
}