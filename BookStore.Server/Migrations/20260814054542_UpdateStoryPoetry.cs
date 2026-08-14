using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookStore.Server.Migrations
{
    /// <inheritdoc />
    public partial class UpdateStoryPoetry : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EventContributors");

            migrationBuilder.DropColumn(
                name: "AdminRemarks",
                table: "StoryPoetries");

            migrationBuilder.DropColumn(
                name: "ReviewedDate",
                table: "StoryPoetries");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "StoryPoetries");

            migrationBuilder.DropColumn(
                name: "BookPrice",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "BookCopies",
                table: "EventRegistrations");

            migrationBuilder.DropColumn(
                name: "FreeBookCopies",
                table: "EventRegistrations");

            migrationBuilder.DropColumn(
                name: "PaidBookCopies",
                table: "EventRegistrations");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdminRemarks",
                table: "StoryPoetries",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReviewedDate",
                table: "StoryPoetries",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "StoryPoetries",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "BookPrice",
                table: "Events",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "BookCopies",
                table: "EventRegistrations",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FreeBookCopies",
                table: "EventRegistrations",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PaidBookCopies",
                table: "EventRegistrations",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "EventContributors",
                columns: table => new
                {
                    EventContributorId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EventId = table.Column<int>(type: "int", nullable: false),
                    StoryPoetryId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    AddedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventContributors", x => x.EventContributorId);
                    table.ForeignKey(
                        name: "FK_EventContributors_Events_EventId",
                        column: x => x.EventId,
                        principalTable: "Events",
                        principalColumn: "EventId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EventContributors_StoryPoetries_StoryPoetryId",
                        column: x => x.StoryPoetryId,
                        principalTable: "StoryPoetries",
                        principalColumn: "StoryPoetryId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EventContributors_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EventContributors_EventId_UserId",
                table: "EventContributors",
                columns: new[] { "EventId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EventContributors_StoryPoetryId",
                table: "EventContributors",
                column: "StoryPoetryId");

            migrationBuilder.CreateIndex(
                name: "IX_EventContributors_UserId",
                table: "EventContributors",
                column: "UserId");
        }
    }
}
