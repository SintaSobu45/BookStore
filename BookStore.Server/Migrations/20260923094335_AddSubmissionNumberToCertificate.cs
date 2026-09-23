using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookStore.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddSubmissionNumberToCertificate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SubmissionNumber",
                table: "Certificates",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            // Backfill SubmissionNumber for existing certificates
            migrationBuilder.Sql(@"
                UPDATE c
                SET c.SubmissionNumber = sp.SubmissionNumber
                FROM Certificates c
                INNER JOIN StoryPoetries sp
                    ON c.StoryPoetryId = sp.StoryPoetryId
                WHERE c.SubmissionNumber = ''
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SubmissionNumber",
                table: "Certificates");
        }
    }
}