using BookStore.Server.Models;
using BookStore.Server.Models.Cart;
using BookStore.Server.Models.Event;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Server.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options
            ) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }

        // Book Module
        public DbSet<Category> Categories { get; set; }
        public DbSet<Author> Authors { get; set; }
        public DbSet<Publisher> Publishers { get; set; }

        public DbSet<Book> Books { get; set; }
        public DbSet<BookImage> BookImages { get; set; }
        public DbSet<Review> Reviews { get; set; }

        // Cart Module
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }

        // Event Module
        public DbSet<Event> Events { get; set; }
        public DbSet<EventImage> EventImages { get; set; }
        public DbSet<EventRegistration> EventRegistrations { get; set; }

        // Story / Poetry
        public DbSet<StoryPoetry> StoryPoetries { get; set; }

        // Payment
        public DbSet<Payment> Payments { get; set; }
        public DbSet<PaymentSettings> PaymentSettings { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);


            // =========================================================
            // USER - ROLE
            // =========================================================

            modelBuilder.Entity<User>()
                .HasOne(u => u.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.Restrict);


            // =========================================================
            // BOOK MODULE
            // =========================================================

            // Category - Book
            modelBuilder.Entity<Book>()
                .HasOne(b => b.Category)
                .WithMany(c => c.Books)
                .HasForeignKey(b => b.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Author - Book
            modelBuilder.Entity<Book>()
                .HasOne(b => b.Author)
                .WithMany(a => a.Books)
                .HasForeignKey(b => b.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Publisher - Book
            modelBuilder.Entity<Book>()
                .HasOne(b => b.Publisher)
                .WithMany(p => p.Books)
                .HasForeignKey(b => b.PublisherId)
                .OnDelete(DeleteBehavior.Restrict);

            // Book - BookImage
            modelBuilder.Entity<BookImage>()
                .HasOne(bi => bi.Book)
                .WithMany(b => b.BookImages)
                .HasForeignKey(bi => bi.BookId)
                .OnDelete(DeleteBehavior.Cascade);

            // Book - Review
            modelBuilder.Entity<Review>()
                .HasOne(r => r.Book)
                .WithMany(b => b.Reviews)
                .HasForeignKey(r => r.BookId)
                .OnDelete(DeleteBehavior.Cascade);

            // User - Review
            modelBuilder.Entity<Review>()
                .HasOne(r => r.User)
                .WithMany(u => u.Reviews)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);


            // =========================================================
            // CART MODULE
            // =========================================================

            // User - Cart
            // UserId is nullable because guest users do not have a UserId.
            modelBuilder.Entity<Cart>()
                .HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Cart - CartItem
            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.Cart)
                .WithMany(c => c.CartItems)
                .HasForeignKey(ci => ci.CartId)
                .OnDelete(DeleteBehavior.Cascade);

            // Book - CartItem
            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.Book)
                .WithMany()
                .HasForeignKey(ci => ci.BookId)
                .OnDelete(DeleteBehavior.Restrict);


            // =========================================================
            // EVENT MODULE
            // =========================================================

            // Event -> EventImage
            modelBuilder.Entity<Event>()
                .HasMany(e => e.EventImages)
                .WithOne(i => i.Event)
                .HasForeignKey(i => i.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            // Event -> EventRegistration
            modelBuilder.Entity<Event>()
                .HasMany(e => e.EventRegistrations)
                .WithOne(r => r.Event)
                .HasForeignKey(r => r.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            // User -> EventRegistration
            modelBuilder.Entity<User>()
                .HasMany(u => u.EventRegistrations)
                .WithOne(r => r.User)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);


            // =========================================================
            // STORY / POETRY
            // =========================================================

            // User -> StoryPoetry
            modelBuilder.Entity<StoryPoetry>()
                .HasOne(s => s.User)
                .WithMany(u => u.StoryPoetries)
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Restrict);


            // =========================================================
            // PAYMENT
            // =========================================================

            // User -> Payment
            modelBuilder.Entity<Payment>()
                .HasOne(p => p.User)
                .WithMany(u => u.Payments)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // StoryPoetry -> Payment
            modelBuilder.Entity<Payment>()
                .HasOne(p => p.StoryPoetry)
                .WithMany()
                .HasForeignKey(p => p.StoryPoetryId)
                .OnDelete(DeleteBehavior.Restrict);

            // EventRegistration -> Payment
            modelBuilder.Entity<Payment>()
                .HasOne(p => p.EventRegistration)
                .WithMany()
                .HasForeignKey(p => p.EventRegistrationId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}