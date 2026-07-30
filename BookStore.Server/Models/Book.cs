using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStore.Server.Models
{
    public class Book
    {
        [Key]
        public int BookId { get; set; }


        public int CategoryId { get; set; }


        [ForeignKey(nameof(CategoryId))]
        public Category? Category { get; set; }


        public int AuthorId { get; set; }


        [ForeignKey(nameof(AuthorId))]
        public Author? Author { get; set; }

        public int PublisherId { get; set; }


        [ForeignKey(nameof(PublisherId))]
        public Publisher? Publisher { get; set; }
    }
}