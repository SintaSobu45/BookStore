using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookStore.Server.Migrations
{
    /// <inheritdoc />
    public partial class cart : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
        IF EXISTS (
            SELECT 1
            FROM sys.indexes
            WHERE name = 'IX_CartItems_CartId'
              AND object_id = OBJECT_ID('CartItems')
        )
        BEGIN
            DROP INDEX [IX_CartItems_CartId] ON [CartItems];
        END
    ");

            migrationBuilder.CreateIndex(
                name: "IX_Carts_GuestCartId",
                table: "Carts",
                column: "GuestCartId",
                unique: true,
                filter: "[GuestCartId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_CartId_BookId",
                table: "CartItems",
                columns: new[] { "CartId", "BookId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Carts_GuestCartId",
                table: "Carts");

            migrationBuilder.DropIndex(
                name: "IX_CartItems_CartId_BookId",
                table: "CartItems");

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_CartId",
                table: "CartItems",
                column: "CartId");
        }
    }
}
