using BookStore.Server.DTOs.Cart;
using BookStore.Server.Models;
using BookStore.Server.Models.Cart;
using BookStore.Server.Repositories;

namespace BookStore.Server.Services
{
    public class CartService
    {
        private readonly CartRepository _cartRepository;

        public CartService(CartRepository cartRepository)
        {
            _cartRepository = cartRepository;
        }

        // =========================================================
        // GET CART
        // =========================================================

        public async Task<CartResponse> GetCartAsync(
            int? userId,
            string? guestCartId)
        {
            Cart? cart = null;

            if (userId.HasValue)
            {
                cart = await _cartRepository
                    .GetByUserIdAsync(userId.Value);
            }
            else if (!string.IsNullOrWhiteSpace(guestCartId))
            {
                cart = await _cartRepository
                    .GetByGuestCartIdAsync(guestCartId);
            }

            if (cart == null)
            {
                return new CartResponse
                {
                    Items = new List<CartItemResponse>(),
                    TotalItems = 0,
                    SubTotal = 0
                };
            }

            return BuildCartResponse(cart);
        }


        // =========================================================
        // ADD TO CART
        // =========================================================

        public async Task<CartResponse> AddToCartAsync(
            int? userId,
            AddToCartRequest request)
        {
            if (!userId.HasValue &&
                string.IsNullOrWhiteSpace(request.GuestCartId))
            {
                throw new ArgumentException(
                    "GuestCartId is required for guest users.");
            }

            // -----------------------------------------------------
            // Validate Quantity
            // -----------------------------------------------------

            if (request.Quantity <= 0)
            {
                throw new ArgumentException(
                    "Quantity must be greater than zero.");
            }

            // -----------------------------------------------------
            // Get Book
            // -----------------------------------------------------

            var book = await _cartRepository
                .GetBookAsync(request.BookId);

            if (book == null)
            {
                throw new KeyNotFoundException(
                    "Book not found.");
            }

            if (!book.IsActive)
            {
                throw new InvalidOperationException(
                    "This book is currently unavailable.");
            }

            if (book.StockQuantity <= 0)
            {
                throw new InvalidOperationException(
                    "This book is out of stock.");
            }

            // -----------------------------------------------------
            // Get or Create Cart
            // -----------------------------------------------------

            Cart? cart = null;

            if (userId.HasValue)
            {
                cart = await _cartRepository
                    .GetByUserIdAsync(userId.Value);

                if (cart == null)
                {
                    cart = new Cart
                    {
                        UserId = userId.Value,
                        CreatedDate = DateTime.UtcNow
                    };

                    await _cartRepository.AddCartAsync(cart);

                    cart = await _cartRepository
                        .GetByIdAsync(cart.CartId);
                }
            }
            else
            {
                cart = await _cartRepository
                    .GetByGuestCartIdAsync(
                        request.GuestCartId!);

                if (cart == null)
                {
                    cart = new Cart
                    {
                        GuestCartId = request.GuestCartId,
                        CreatedDate = DateTime.UtcNow
                    };

                    await _cartRepository.AddCartAsync(cart);

                    cart = await _cartRepository
                        .GetByIdAsync(cart.CartId);
                }
            }

            if (cart == null)
            {
                throw new InvalidOperationException(
                    "Unable to create or retrieve cart.");
            }

            // -----------------------------------------------------
            // Existing Cart Item
            // -----------------------------------------------------

            var cartItem =
                await _cartRepository.GetCartItemAsync(
                    cart.CartId,
                    request.BookId);

            int newQuantity = request.Quantity;

            if (cartItem != null)
            {
                newQuantity =
                    cartItem.Quantity + request.Quantity;
            }

            // -----------------------------------------------------
            // Stock Validation
            // -----------------------------------------------------

            if (newQuantity > book.StockQuantity)
            {
                throw new InvalidOperationException(
                    $"Only {book.StockQuantity} copies are available.");
            }

            // -----------------------------------------------------
            // Calculate Current Discounted Price
            // -----------------------------------------------------

            var discountedPrice =
                CalculateDiscountedPrice(
                    book.Price,
                    book.DiscountPercentage);

            // -----------------------------------------------------
            // Update Existing Item
            // -----------------------------------------------------

            if (cartItem != null)
            {
                cartItem.Quantity = newQuantity;

                // Keep latest discounted price
                cartItem.UnitPrice = discountedPrice;

                await _cartRepository
                    .UpdateCartItemAsync(cartItem);
            }

            // -----------------------------------------------------
            // Add New Item
            // -----------------------------------------------------

            else
            {
                cartItem = new CartItem
                {
                    CartId = cart.CartId,
                    BookId = book.BookId,
                    Quantity = request.Quantity,
                    UnitPrice = discountedPrice
                };

                await _cartRepository
                    .AddCartItemAsync(cartItem);
            }

            cart.UpdatedDate = DateTime.UtcNow;

            await _cartRepository.SaveChangesAsync();

            return await GetCartAsync(
                userId,
                request.GuestCartId);
        }


        // =========================================================
        // UPDATE QUANTITY
        // =========================================================

        public async Task<CartResponse> UpdateQuantityAsync(
            int? userId,
            int cartItemId,
            UpdateCartItemRequest request)
        {
            if (request.Quantity <= 0)
            {
                throw new ArgumentException(
                    "Quantity must be greater than zero.");
            }

            var cart = await GetCartForUserAsync(
                userId,
                request.GuestCartId);

            if (cart == null)
            {
                throw new KeyNotFoundException(
                    "Cart not found.");
            }

            var cartItem = cart.CartItems
                .FirstOrDefault(ci =>
                    ci.CartItemId == cartItemId);

            if (cartItem == null)
            {
                throw new KeyNotFoundException(
                    "Cart item not found.");
            }

            if (cartItem.Book == null)
            {
                throw new KeyNotFoundException(
                    "Book not found.");
            }

            var book = cartItem.Book;

            if (!book.IsActive)
            {
                throw new InvalidOperationException(
                    "This book is currently unavailable.");
            }

            if (book.StockQuantity <= 0)
            {
                throw new InvalidOperationException(
                    "This book is out of stock.");
            }

            if (request.Quantity > book.StockQuantity)
            {
                throw new InvalidOperationException(
                    $"Only {book.StockQuantity} copies are available.");
            }

            cartItem.Quantity = request.Quantity;

            // Recalculate using current book discount
            cartItem.UnitPrice =
                CalculateDiscountedPrice(
                    book.Price,
                    book.DiscountPercentage);

            cart.UpdatedDate = DateTime.UtcNow;

            await _cartRepository
                .UpdateCartItemAsync(cartItem);

            await _cartRepository
                .SaveChangesAsync();

            return BuildCartResponse(cart);
        }


        // =========================================================
        // REMOVE ITEM
        // =========================================================

        public async Task<CartResponse> RemoveItemAsync(
            int? userId,
            int cartItemId,
            string? guestCartId)
        {
            var cart = await GetCartForUserAsync(
                userId,
                guestCartId);

            if (cart == null)
            {
                throw new KeyNotFoundException(
                    "Cart not found.");
            }

            var cartItem = cart.CartItems
                .FirstOrDefault(ci =>
                    ci.CartItemId == cartItemId);

            if (cartItem == null)
            {
                throw new KeyNotFoundException(
                    "Cart item not found.");
            }

            await _cartRepository
                .RemoveCartItemAsync(cartItem);

            cart.UpdatedDate = DateTime.UtcNow;

            await _cartRepository
                .SaveChangesAsync();

            return await GetCartAsync(
                userId,
                guestCartId);
        }


        // =========================================================
        // CLEAR CART
        // =========================================================

        public async Task ClearCartAsync(
            int? userId,
            string? guestCartId)
        {
            var cart = await GetCartForUserAsync(
                userId,
                guestCartId);

            if (cart == null)
                return;

            foreach (var item in cart.CartItems.ToList())
            {
                await _cartRepository
                    .RemoveCartItemAsync(item);
            }

            cart.UpdatedDate = DateTime.UtcNow;

            await _cartRepository
                .SaveChangesAsync();
        }


        // =========================================================
        // MERGE GUEST CART INTO USER CART
        // =========================================================

        public async Task<CartResponse> MergeGuestCartAsync(
            int userId,
            string guestCartId)
        {
            if (string.IsNullOrWhiteSpace(guestCartId))
            {
                return await GetCartAsync(
                    userId,
                    null);
            }

            var guestCart =
                await _cartRepository
                    .GetByGuestCartIdAsync(guestCartId);

            if (guestCart == null)
            {
                return await GetCartAsync(
                    userId,
                    null);
            }

            var userCart =
                await _cartRepository
                    .GetByUserIdAsync(userId);

            // -----------------------------------------------------
            // Create User Cart
            // -----------------------------------------------------

            if (userCart == null)
            {
                userCart = new Cart
                {
                    UserId = userId,
                    CreatedDate = DateTime.UtcNow
                };

                await _cartRepository
                    .AddCartAsync(userCart);

                userCart =
                    await _cartRepository
                        .GetByIdAsync(userCart.CartId);
            }

            if (userCart == null)
            {
                throw new InvalidOperationException(
                    "Unable to create user cart.");
            }

            // -----------------------------------------------------
            // Merge Items
            // -----------------------------------------------------

            foreach (var guestItem in
                     guestCart.CartItems.ToList())
            {
                if (guestItem.Book == null)
                    continue;

                var book = guestItem.Book;

                if (!book.IsActive)
                    continue;

                if (book.StockQuantity <= 0)
                    continue;

                var existingItem =
                    userCart.CartItems
                        .FirstOrDefault(ci =>
                            ci.BookId == guestItem.BookId);

                if (existingItem != null)
                {
                    var mergedQuantity =
                        existingItem.Quantity +
                        guestItem.Quantity;

                    existingItem.Quantity =
                        Math.Min(
                            mergedQuantity,
                            book.StockQuantity);

                    existingItem.UnitPrice =
                        CalculateDiscountedPrice(
                            book.Price,
                            book.DiscountPercentage);

                    await _cartRepository
                        .UpdateCartItemAsync(
                            existingItem);
                }
                else
                {
                    var newItem = new CartItem
                    {
                        CartId = userCart.CartId,
                        BookId = book.BookId,

                        Quantity = Math.Min(
                            guestItem.Quantity,
                            book.StockQuantity),

                        UnitPrice =
                            CalculateDiscountedPrice(
                                book.Price,
                                book.DiscountPercentage)
                    };

                    await _cartRepository
                        .AddCartItemAsync(newItem);
                }
            }

            // -----------------------------------------------------
            // Delete Guest Cart
            // -----------------------------------------------------

            await _cartRepository
                .DeleteCartAsync(guestCart);

            userCart.UpdatedDate =
                DateTime.UtcNow;

            await _cartRepository
                .SaveChangesAsync();

            return await GetCartAsync(
                userId,
                null);
        }


        // =========================================================
        // GET CART FOR USER / GUEST
        // =========================================================

        private async Task<Cart?> GetCartForUserAsync(
            int? userId,
            string? guestCartId)
        {
            if (userId.HasValue)
            {
                return await _cartRepository
                    .GetByUserIdAsync(userId.Value);
            }

            if (!string.IsNullOrWhiteSpace(guestCartId))
            {
                return await _cartRepository
                    .GetByGuestCartIdAsync(guestCartId);
            }

            return null;
        }


        // =========================================================
        // BUILD CART RESPONSE
        // =========================================================

        private CartResponse BuildCartResponse(
            Cart cart)
        {
            var items = cart.CartItems
                .Where(ci => ci.Book != null)
                .Select(ci =>
                {
                    var book = ci.Book!;

                    // Always use the current book discount
                    var discountedPrice =
                        CalculateDiscountedPrice(
                            book.Price,
                            book.DiscountPercentage);

                    return new CartItemResponse
                    {
                        CartItemId =
                            ci.CartItemId,

                        BookId =
                            book.BookId,

                        BookTitle =
                            book.Title,

                        ImageUrl =
                            book.BookImages
                                .Where(i => i.IsPrimary)
                                .Select(i => i.ImageUrl)
                                .FirstOrDefault(),

                        Price =
                            book.Price,

                        DiscountPercentage =
                            book.DiscountPercentage,

                        DiscountedPrice =
                            discountedPrice,

                        Quantity =
                            ci.Quantity,

                        ItemTotal =
                            discountedPrice *
                            ci.Quantity,

                        AvailableStock =
                            book.StockQuantity
                    };
                })
                .ToList();

            return new CartResponse
            {
                CartId =
                    cart.CartId,

                GuestCartId =
                    cart.GuestCartId,

                Items =
                    items,

                TotalItems =
                    items.Sum(i => i.Quantity),

                SubTotal =
                    items.Sum(i => i.ItemTotal)
            };
        }


        // =========================================================
        // DISCOUNT CALCULATION
        // =========================================================

        private decimal CalculateDiscountedPrice(
            decimal price,
            decimal discountPercentage)
        {
            var discountedPrice =
                price -
                (price * discountPercentage / 100);

            return Math.Round(
                discountedPrice,
                2,
                MidpointRounding.AwayFromZero);
        }
    }
}