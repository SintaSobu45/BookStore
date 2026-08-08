using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookStore.Server.Migrations
{
    /// <inheritdoc />
    public partial class UpdateEventRegistrationBookCopies : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "AdditionalBookCopies",
                table: "EventRegistrations",
                newName: "PaidBookCopies");

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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BookCopies",
                table: "EventRegistrations");

            migrationBuilder.DropColumn(
                name: "FreeBookCopies",
                table: "EventRegistrations");

            migrationBuilder.RenameColumn(
                name: "PaidBookCopies",
                table: "EventRegistrations",
                newName: "AdditionalBookCopies");
        }
    }
}
