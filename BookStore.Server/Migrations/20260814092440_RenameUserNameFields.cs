using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookStore.Server.Migrations
{
    /// <inheritdoc />
    public partial class RenameUserNameFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FirstName",
                table: "Users");

            migrationBuilder.RenameColumn(
                name: "LastName",
                table: "Users",
                newName: "Name");

            migrationBuilder.AddColumn<string>(
                name: "AddressMalayalam",
                table: "Users",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CityMalayalam",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "District",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DistrictMalayalam",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NameMalayalam",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StateMalayalam",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

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
                name: "ContributorAddressMalayalam",
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
                name: "ContributorCityMalayalam",
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
                name: "ContributorDistrictMalayalam",
                table: "StoryPoetries",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ContributorEmail",
                table: "StoryPoetries",
                type: "nvarchar(150)",
                maxLength: 150,
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
                name: "ContributorNameMalayalam",
                table: "StoryPoetries",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ContributorPhone",
                table: "StoryPoetries",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ContributorProfileImageUrl",
                table: "StoryPoetries",
                type: "nvarchar(max)",
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AddressMalayalam",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CityMalayalam",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "District",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DistrictMalayalam",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "NameMalayalam",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "StateMalayalam",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ContributorAddress",
                table: "StoryPoetries");

            migrationBuilder.DropColumn(
                name: "ContributorAddressMalayalam",
                table: "StoryPoetries");

            migrationBuilder.DropColumn(
                name: "ContributorCity",
                table: "StoryPoetries");

            migrationBuilder.DropColumn(
                name: "ContributorCityMalayalam",
                table: "StoryPoetries");

            migrationBuilder.DropColumn(
                name: "ContributorDistrict",
                table: "StoryPoetries");

            migrationBuilder.DropColumn(
                name: "ContributorDistrictMalayalam",
                table: "StoryPoetries");

            migrationBuilder.DropColumn(
                name: "ContributorEmail",
                table: "StoryPoetries");

            migrationBuilder.DropColumn(
                name: "ContributorName",
                table: "StoryPoetries");

            migrationBuilder.DropColumn(
                name: "ContributorNameMalayalam",
                table: "StoryPoetries");

            migrationBuilder.DropColumn(
                name: "ContributorPhone",
                table: "StoryPoetries");

            migrationBuilder.DropColumn(
                name: "ContributorProfileImageUrl",
                table: "StoryPoetries");

            migrationBuilder.DropColumn(
                name: "ContributorState",
                table: "StoryPoetries");

            migrationBuilder.DropColumn(
                name: "ContributorStateMalayalam",
                table: "StoryPoetries");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Users",
                newName: "LastName");

            migrationBuilder.AddColumn<string>(
                name: "FirstName",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

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
    }
}
