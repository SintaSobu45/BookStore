using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookStore.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentEnabledAtToStoryPoetry : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "PaymentEnabledAt",
                table: "StoryPoetries",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PaymentEnabledAt",
                table: "StoryPoetries");
        }
    }
}
