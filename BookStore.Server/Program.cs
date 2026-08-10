using BookStore.Server.Data;
using BookStore.Server.Helpers;
using BookStore.Server.Repositories;
using BookStore.Server.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

namespace BookStore.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add Controllers
            builder.Services.AddControllers();

            // CORS
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("ReactPolicy", policy =>
                {
                    policy.WithOrigins(
                            "new.kl47drones.in",
                            "https://localhost:5173",
                            "http://localhost:5173"
                        )
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                });
            });

            // Swagger
            builder.Services.AddEndpointsApiExplorer();

            builder.Services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "BookStore API",
                    Version = "v1"
                });

                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Enter JWT Token as: Bearer {your_token}"
                });

                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            // Database Connection
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(
                    builder.Configuration.GetConnectionString("DefaultConnection")
                ));

            // Repository
            builder.Services.AddScoped<AccountRepository>();
            builder.Services.AddScoped<CategoryRepository>();
            builder.Services.AddScoped<AuthorRepository>();
            builder.Services.AddScoped<PublisherRepository>();
            builder.Services.AddScoped<BookRepository>();
            builder.Services.AddScoped<BookImageRepository>();
            builder.Services.AddScoped<ReviewRepository>();

            builder.Services.AddScoped<ProfileRepository>();

            builder.Services.AddScoped<EventRepository>();
            builder.Services.AddScoped<EventImageRepository>();
            builder.Services.AddScoped<EventRegistrationRepository>();

            builder.Services.AddScoped<StoryPoetryRepository>();
         




            // Helpers
            builder.Services.AddScoped<PasswordHasher>();
            builder.Services.AddScoped<JwtHelper>();
            builder.Services.Configure<CloudinarySettings>(
             builder.Configuration.GetSection("CloudinarySettings"));

            // Service
            builder.Services.AddScoped<AccountService>();
            builder.Services.AddScoped<CategoryService>();
            builder.Services.AddScoped<AuthorService>();
            builder.Services.AddScoped<PublisherService>();
            builder.Services.AddScoped<BookService>();
            builder.Services.AddScoped<CloudinaryService>();
            builder.Services.AddScoped<BookImageService>();
            builder.Services.AddScoped<ReviewService>();

            builder.Services.AddScoped<ProfileService>();

            builder.Services.AddScoped<EventService>();
            builder.Services.AddScoped<EventImageService>();
            builder.Services.AddScoped<EventRegistrationService>();

            builder.Services.AddScoped<StoryPoetryService>();

            // JWT Authentication
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,

                        ValidIssuer = builder.Configuration["Jwt:Issuer"],
                        ValidAudience = builder.Configuration["Jwt:Audience"],

                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
                        )
                    };
                });

            builder.Services.AddAuthorization();

            var app = builder.Build();

            // Initialize Database
            using (var scope = app.Services.CreateScope())
            {
                var context = scope.ServiceProvider
                    .GetRequiredService<ApplicationDbContext>();

                DbInitializer.Initialize(context);
            }

            app.UseDefaultFiles();
            app.UseStaticFiles();

            // Configure HTTP Request Pipeline
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            // Enable CORS
            app.UseCors("ReactPolicy");

            // Authentication must come before Authorization
            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.MapFallbackToFile("/index.html");

            app.Run();
        }
    }
}