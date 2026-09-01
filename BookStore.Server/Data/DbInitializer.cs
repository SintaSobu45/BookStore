using BookStore.Server.Helpers;
using BookStore.Server.Models;

namespace BookStore.Server.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            // =========================================================
            // CREATE ROLES
            // =========================================================

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


            // =========================================================
            // GET ADMIN ROLE
            // =========================================================

            var adminRole = context.Roles
                .First(r => r.RoleName == "Admin");


            // =========================================================
            // CREATE TEST ADMIN
            // =========================================================

            if (!context.Users.Any(
                u => u.Email == "admin@bookstore.com"))
            {
                var admin = new User
                {
                    Name = "System Admin",
                    Email = "admin@bookstore.com",
                    Phone = "9999999999",
                    RoleId = adminRole.RoleId,
                    IsActive = true,
                    CreatedDate = DateTime.UtcNow
                };

                var passwordHasher = new PasswordHasher();

                admin.PasswordHash =
                    passwordHasher.HashPassword(
                        admin,
                        "Admin@123"
                    );

                context.Users.Add(admin);

                context.SaveChanges();
            }


            // =========================================================
            // CREATE REAL ADMIN
            // =========================================================

            if (!context.Users.Any(
                u => u.Email == "theoldlibrary.info@gmail.com"))
            {
                var realAdmin = new User
                {
                    Name = "Real Admin",
                    Email = "theoldlibrary.info@gmail.com",
                    Phone = "9567913398",
                    RoleId = adminRole.RoleId,
                    IsActive = true,
                    CreatedDate = DateTime.UtcNow
                };

                var passwordHasher = new PasswordHasher();

                realAdmin.PasswordHash =
                    passwordHasher.HashPassword(
                        realAdmin,
                        "Admin@123"
                    );

                context.Users.Add(realAdmin);

                context.SaveChanges();
            }
        }
    }
}