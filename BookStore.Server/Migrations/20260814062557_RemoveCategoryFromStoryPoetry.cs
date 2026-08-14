using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookStore.Server.Migrations
{
    /// <inheritdoc />
    public partial class RemoveCategoryFromStoryPoetry : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
    }
}
