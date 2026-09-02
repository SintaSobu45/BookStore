using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookStore.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentNotificationSentToStoryPoetry : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "PaymentNotificationSent",
                table: "StoryPoetries",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PaymentNotificationSent",
                table: "StoryPoetries");
        }
    }
}
