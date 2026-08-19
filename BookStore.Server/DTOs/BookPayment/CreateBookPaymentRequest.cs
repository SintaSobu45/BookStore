using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs.BookPayment
{
    public class CreateBookPaymentRequest
    {
        [Required]
        public int OrderId { get; set; }
    }
}