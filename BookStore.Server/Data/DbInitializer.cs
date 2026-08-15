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
            // CREATE ADMIN USER
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


                // =====================================================
                // HASH ADMIN PASSWORD
                // =====================================================

                var passwordHasher = new PasswordHasher();

                admin.PasswordHash =
                    passwordHasher.HashPassword(
                        admin,
                        "Admin@123"
                    );


                // =====================================================
                // SAVE ADMIN
                // =====================================================

                context.Users.Add(admin);

                context.SaveChanges();
            }
        }
    }
}