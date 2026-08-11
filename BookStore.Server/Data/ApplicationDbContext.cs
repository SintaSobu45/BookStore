using BookStore.Server.Models;
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

        public DbSet<Category> Categories { get; set; }
        public DbSet<Author> Authors { get; set; }
        public DbSet<Publisher> Publishers { get; set; }

        public DbSet<Book> Books { get; set; }
        public DbSet<BookImage> BookImages { get; set; }
        public DbSet<Review> Reviews { get; set; }


        public DbSet<Event> Events { get; set; }

        public DbSet<EventImage> EventImages { get; set; }

        public DbSet<EventRegistration> EventRegistrations { get; set; }

        public DbSet<StoryPoetry> StoryPoetries { get; set; }

        public DbSet<EventContributor> EventContributors { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);


            // User - Role Relationship
            modelBuilder.Entity<User>()
                .HasOne(u => u.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.Restrict);


            // Category - Book Relationship
            modelBuilder.Entity<Book>()
                .HasOne(b => b.Category)
                .WithMany(c => c.Books)
                .HasForeignKey(b => b.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Author - Book Relationship
            modelBuilder.Entity<Book>()
                .HasOne(b => b.Author)
                .WithMany(a => a.Books)
                .HasForeignKey(b => b.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Publisher - Book Relationship
            modelBuilder.Entity<Book>()
                .HasOne(b => b.Publisher)
                .WithMany(p => p.Books)
                .HasForeignKey(b => b.PublisherId)
                .OnDelete(DeleteBehavior.Restrict);

            // Book - BookImage Relationship
            modelBuilder.Entity<BookImage>()
                .HasOne(bi => bi.Book)
                .WithMany(b => b.BookImages)
                .HasForeignKey(bi => bi.BookId)
                .OnDelete(DeleteBehavior.Cascade);

            // Book - Review Relationship
            modelBuilder.Entity<Review>()
                .HasOne(r => r.Book)
                .WithMany(b => b.Reviews)
                .HasForeignKey(r => r.BookId)
                .OnDelete(DeleteBehavior.Cascade);

            // User - Review Relationship
            modelBuilder.Entity<Review>()
                .HasOne(r => r.User)
                .WithMany(u => u.Reviews)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);

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

            // User -> StoryPoetry
            modelBuilder.Entity<StoryPoetry>()
                .HasOne(s => s.User)
                .WithMany(u => u.StoryPoetries)
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Category -> StoryPoetry
            modelBuilder.Entity<StoryPoetry>()
                .HasOne(s => s.Category)
                .WithMany(c => c.StoryPoetries)
                .HasForeignKey(s => s.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Event -> EventContributor
            modelBuilder.Entity<EventContributor>()
                .HasOne(ec => ec.Event)
                .WithMany(e => e.EventContributors)
                .HasForeignKey(ec => ec.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            // User -> EventContributor
            modelBuilder.Entity<EventContributor>()
                .HasOne(ec => ec.User)
                .WithMany()
                .HasForeignKey(ec => ec.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // StoryPoetry -> EventContributor
            modelBuilder.Entity<EventContributor>()
                .HasOne(ec => ec.StoryPoetry)
                .WithMany()
                .HasForeignKey(ec => ec.StoryPoetryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Prevent duplicate contributor for same event
            modelBuilder.Entity<EventContributor>()
                .HasIndex(ec => new
                {
                    ec.EventId,
                    ec.UserId
                })
                .IsUnique();
        }
    }
}