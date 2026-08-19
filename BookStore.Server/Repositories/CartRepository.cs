using BookStore.Server.Data;
using BookStore.Server.Models;
using BookStore.Server.Models.Cart;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Server.Repositories
{
    public class CartRepository
    {
        private readonly ApplicationDbContext _context;

        public CartRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // =========================================================
        // GET REGISTERED USER CART
        // =========================================================

        public async Task<Cart?> GetByUserIdAsync(int userId)
        {
            return await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Book)
                        .ThenInclude(b => b!.BookImages)
                .FirstOrDefaultAsync(c => c.UserId == userId);
        }


        // =========================================================
        // GET GUEST CART
        // =========================================================

        public async Task<Cart?> GetByGuestCartIdAsync(
            string guestCartId)
        {
            return await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Book)
                        .ThenInclude(b => b!.BookImages)
                .FirstOrDefaultAsync(c =>
                    c.GuestCartId == guestCartId);
        }


        // =========================================================
        // GET CART BY ID
        // =========================================================

        public async Task<Cart?> GetByIdAsync(int cartId)
        {
            return await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Book)
                        .ThenInclude(b => b!.BookImages)
                .FirstOrDefaultAsync(c =>
                    c.CartId == cartId);
        }


        // =========================================================
        // GET BOOK
        // =========================================================

        public async Task<Book?> GetBookAsync(int bookId)
        {
            return await _context.Books
                .Include(b => b.BookImages)
                .FirstOrDefaultAsync(b =>
                    b.BookId == bookId);
        }


        // =========================================================
        // GET CART ITEM
        // =========================================================

        public async Task<CartItem?> GetCartItemAsync(
            int cartId,
            int bookId)
        {
            return await _context.CartItems
                .Include(ci => ci.Book)
                    .ThenInclude(b => b!.BookImages)
                .FirstOrDefaultAsync(ci =>
                    ci.CartId == cartId &&
                    ci.BookId == bookId);
        }


        // =========================================================
        // ADD CART
        // =========================================================

        public async Task<Cart> AddCartAsync(Cart cart)
        {
            _context.Carts.Add(cart);

            await _context.SaveChangesAsync();

            return cart;
        }


        // =========================================================
        // ADD CART ITEM
        // =========================================================

        public async Task<CartItem> AddCartItemAsync(
            CartItem cartItem)
        {
            _context.CartItems.Add(cartItem);

            await _context.SaveChangesAsync();

            return cartItem;
        }


        // =========================================================
        // UPDATE CART ITEM
        // =========================================================

        public async Task UpdateCartItemAsync(
            CartItem cartItem)
        {
            _context.CartItems.Update(cartItem);

            await _context.SaveChangesAsync();
        }


        // =========================================================
        // REMOVE CART ITEM
        // =========================================================

        public async Task RemoveCartItemAsync(
            CartItem cartItem)
        {
            _context.CartItems.Remove(cartItem);

            await _context.SaveChangesAsync();
        }


        // =========================================================
        // DELETE CART
        // =========================================================

        public async Task DeleteCartAsync(Cart cart)
        {
            _context.Carts.Remove(cart);

            await _context.SaveChangesAsync();
        }

        // =========================================================
        // CLEAR CART ITEMS
        // =========================================================

        public async Task ClearCartAsync(Cart cart)
        {
            if (cart.CartItems.Any())
            {
                _context.CartItems.RemoveRange(cart.CartItems);
            }

            cart.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        // =========================================================
        // SAVE CHANGES
        // =========================================================

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}