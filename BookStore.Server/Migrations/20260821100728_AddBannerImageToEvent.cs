using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookStore.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddBannerImageToEvent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPrimary",
                table: "EventImages");

            migrationBuilder.AddColumn<string>(
                name: "ImageType",
                table: "EventImages",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageType",
                table: "EventImages");

            migrationBuilder.AddColumn<bool>(
                name: "IsPrimary",
                table: "EventImages",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
