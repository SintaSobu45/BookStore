using BookStore.Server.Helpers;
using BookStore.Server.Models;

namespace BookStore.Server.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            // Create Roles if they don't exist
            if (!context.Roles.Any())
            {
                context.Roles.AddRange(
                    new Role
                    {
                        RoleName = "Admin"
                    },
                    new Role
                    {
                        RoleName = "User"
                    }
                );

                context.SaveChanges();
            }

            // Get Admin Role
            var adminRole = context.Roles
                .First(r => r.RoleName == "Admin");

            // Create Admin User if it doesn't exist
            if (!context.Users.Any(u => u.Email == "admin@bookstore.com"))
            {
                var admin = new User
                {
                    FirstName = "System",
                    LastName = "Admin",
                    Email = "admin@bookstore.com",
                    Phone = "9999999999",
                    RoleId = adminRole.RoleId,
                    IsActive = true,
                    CreatedDate = DateTime.UtcNow
                };

                // Hash Admin Password
                var passwordHasher = new PasswordHasher();

                admin.PasswordHash = passwordHasher.HashPassword(
                    admin,
                    "Admin@123"
                );

                context.Users.Add(admin);

                context.SaveChanges();
            }
        }
    }
}