using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookStore.Server.Migrations
{
    /// <inheritdoc />
    public partial class GuestRemoval : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContributorAddress",
                table: "StoryPoetries");

            migrationBuilder.DropColumn(
                name: "ContributorCity",
                table: "StoryPoetries");

            migrationBuilder.DropColumn(
                name: "ContributorDistrict",
                table: "StoryPoetries");

            migrationBuilder.DropColumn(
                name: "ContributorName",
                table: "StoryPoetries");

            migrationBuilder.DropColumn(
                name: "ContributorState",
                table: "StoryPoetries");

            migrationBuilder.DropColumn(
                name: "ContributorStateMalayalam",
                table: "StoryPoetries");

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "StoryPoetries",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "StoryPoetries",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<string>(
                name: "ContributorAddress",
                table: "StoryPoetries",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ContributorCity",
                table: "StoryPoetries",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ContributorDistrict",
                table: "StoryPoetries",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ContributorName",
                table: "StoryPoetries",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ContributorState",
                table: "StoryPoetries",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ContributorStateMalayalam",
                table: "StoryPoetries",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");
        }
    }
}
