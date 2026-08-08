using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookStore.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddCategoryToStoryPoetry : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "StoryPoetries");

            migrationBuilder.AddColumn<int>(
                name: "CategoryId",
                table: "StoryPoetries",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_StoryPoetries_CategoryId",
                table: "StoryPoetries",
                column: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_StoryPoetries_Categories_CategoryId",
                table: "StoryPoetries",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "CategoryId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StoryPoetries_Categories_CategoryId",
                table: "StoryPoetries");

            migrationBuilder.DropIndex(
                name: "IX_StoryPoetries_CategoryId",
                table: "StoryPoetries");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "StoryPoetries");

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "StoryPoetries",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");
        }
    }
}
