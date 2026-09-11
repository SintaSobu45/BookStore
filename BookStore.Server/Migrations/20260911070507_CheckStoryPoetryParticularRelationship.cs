using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookStore.Server.Migrations
{
    /// <inheritdoc />
    public partial class CheckStoryPoetryParticularRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StoryPoetries_StoryPoetryParticular_StoryPoetryParticularId",
                table: "StoryPoetries");

            migrationBuilder.AddForeignKey(
                name: "FK_StoryPoetries_StoryPoetryParticular_StoryPoetryParticularId",
                table: "StoryPoetries",
                column: "StoryPoetryParticularId",
                principalTable: "StoryPoetryParticular",
                principalColumn: "StoryPoetryParticularId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StoryPoetries_StoryPoetryParticular_StoryPoetryParticularId",
                table: "StoryPoetries");

            migrationBuilder.AddForeignKey(
                name: "FK_StoryPoetries_StoryPoetryParticular_StoryPoetryParticularId",
                table: "StoryPoetries",
                column: "StoryPoetryParticularId",
                principalTable: "StoryPoetryParticular",
                principalColumn: "StoryPoetryParticularId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
