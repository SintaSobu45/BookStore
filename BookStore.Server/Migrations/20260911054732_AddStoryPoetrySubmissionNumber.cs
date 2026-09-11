using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookStore.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddStoryPoetrySubmissionNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SubmissionNumber",
                table: "StoryPoetries",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SubmissionNumber",
                table: "StoryPoetries");
        }
    }
}
