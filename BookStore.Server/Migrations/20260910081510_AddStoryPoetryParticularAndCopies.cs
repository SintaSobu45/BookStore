using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookStore.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddStoryPoetryParticularAndCopies : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // =========================================================
            // 1. CREATE STORY POETRY PARTICULAR TABLE
            // =========================================================

            migrationBuilder.CreateTable(
                name: "StoryPoetryParticular",
                columns: table => new
                {
                    StoryPoetryParticularId = table.Column<int>(
                        type: "int",
                        nullable: false
                    )
                    .Annotation("SqlServer:Identity", "1, 1"),

                    Type = table.Column<string>(
                        type: "nvarchar(20)",
                        maxLength: 20,
                        nullable: false
                    ),

                    Name = table.Column<string>(
                        type: "nvarchar(200)",
                        maxLength: 200,
                        nullable: false
                    ),

                    ExtraCopyPrice = table.Column<decimal>(
                        type: "decimal(18,2)",
                        nullable: false
                    ),

                    FreeCopies = table.Column<int>(
                        type: "int",
                        nullable: false
                    ),

                    IsActive = table.Column<bool>(
                        type: "bit",
                        nullable: false
                    ),

                    CreatedDate = table.Column<DateTime>(
                        type: "datetime2",
                        nullable: false
                    ),

                    UpdatedDate = table.Column<DateTime>(
                        type: "datetime2",
                        nullable: true
                    )
                },
                constraints: table =>
                {
                    table.PrimaryKey(
                        "PK_StoryPoetryParticular",
                        x => x.StoryPoetryParticularId
                    );
                });


            // =========================================================
            // 2. CREATE LEGACY PARTICULAR FOR EXISTING RECORDS
            // =========================================================

            // Existing StoryPoetry records will point to ID 1.
            // This particular is inactive, so it will NOT be available
            // for new submissions.

            migrationBuilder.InsertData(
                table: "StoryPoetryParticular",
                columns: new[]
                {
                    "StoryPoetryParticularId",
                    "Type",
                    "Name",
                    "ExtraCopyPrice",
                    "FreeCopies",
                    "IsActive",
                    "CreatedDate",
                    "UpdatedDate"
                },
                values: new object[]
                {
                    1,
                    "Story",
                    "Legacy",
                    0m,
                    0,
                    false,
                    DateTime.UtcNow,
                    null
                });


            // =========================================================
            // 3. ADD PAYMENT / COPY SNAPSHOT FIELDS
            // =========================================================

            migrationBuilder.AddColumn<decimal>(
                name: "Amount",
                table: "StoryPoetries",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "BaseAmount",
                table: "StoryPoetries",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "ExtraCopies",
                table: "StoryPoetries",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "ExtraCopyPrice",
                table: "StoryPoetries",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "FreeCopies",
                table: "StoryPoetries",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalCopies",
                table: "StoryPoetries",
                type: "int",
                nullable: false,
                defaultValue: 0);


            // =========================================================
            // 4. ADD PARTICULAR SNAPSHOT
            // =========================================================

            migrationBuilder.AddColumn<string>(
                name: "ParticularNameSnapshot",
                table: "StoryPoetries",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "Legacy");


            // =========================================================
            // 5. ADD PARTICULAR FOREIGN KEY COLUMN
            // =========================================================

            // Existing records will automatically receive ID = 1,
            // which points to the Legacy particular above.

            migrationBuilder.AddColumn<int>(
                name: "StoryPoetryParticularId",
                table: "StoryPoetries",
                type: "int",
                nullable: false,
                defaultValue: 1);


            // =========================================================
            // 6. CREATE INDEX
            // =========================================================

            migrationBuilder.CreateIndex(
                name: "IX_StoryPoetries_StoryPoetryParticularId",
                table: "StoryPoetries",
                column: "StoryPoetryParticularId");


            // =========================================================
            // 7. CREATE FOREIGN KEY
            // =========================================================

            // Restrict prevents deleting a particular that has
            // StoryPoetry records linked to it.

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
            // =========================================================
            // 1. DROP FOREIGN KEY
            // =========================================================

            migrationBuilder.DropForeignKey(
                name: "FK_StoryPoetries_StoryPoetryParticular_StoryPoetryParticularId",
                table: "StoryPoetries");


            // =========================================================
            // 2. DROP INDEX
            // =========================================================

            migrationBuilder.DropIndex(
                name: "IX_StoryPoetries_StoryPoetryParticularId",
                table: "StoryPoetries");


            // =========================================================
            // 3. DROP STORYPOETRY COLUMNS
            // =========================================================

            migrationBuilder.DropColumn(
                name: "Amount",
                table: "StoryPoetries");

            migrationBuilder.DropColumn(
                name: "BaseAmount",
                table: "StoryPoetries");

            migrationBuilder.DropColumn(
                name: "ExtraCopies",
                table: "StoryPoetries");

            migrationBuilder.DropColumn(
                name: "ExtraCopyPrice",
                table: "StoryPoetries");

            migrationBuilder.DropColumn(
                name: "FreeCopies",
                table: "StoryPoetries");

            migrationBuilder.DropColumn(
                name: "ParticularNameSnapshot",
                table: "StoryPoetries");

            migrationBuilder.DropColumn(
                name: "StoryPoetryParticularId",
                table: "StoryPoetries");

            migrationBuilder.DropColumn(
                name: "TotalCopies",
                table: "StoryPoetries");


            // =========================================================
            // 4. DROP PARTICULAR TABLE
            // =========================================================

            migrationBuilder.DropTable(
                name: "StoryPoetryParticular");
        }
    }
}