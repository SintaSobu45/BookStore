using BookStore.Server.DTOs.Cart;
using BookStore.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookStore.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly CartService _cartService;

        public CartController(CartService cartService)
        {
            _cartService = cartService;
        }


        // =========================================================
        // GET CART
        // =========================================================

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetCart(
            [FromQuery] string? guestCartId)
        {
            var userId = GetUserId();

            var cart = await _cartService.GetCartAsync(
                userId,
                guestCartId);

            return Ok(cart);
        }


        // =========================================================
        // ADD TO CART
        // =========================================================

        [HttpPost("add")]
        [AllowAnonymous]
        public async Task<IActionResult> AddToCart(
            [FromBody] AddToCartRequest request)
        {
            try
            {
                var userId = GetUserId();

                var cart = await _cartService.AddToCartAsync(
                    userId,
                    request);

                return Ok(new
                {
                    Message = "Book added to cart successfully.",
                    Data = cart
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }


        // =========================================================
        // UPDATE QUANTITY
        // =========================================================

        [HttpPut("item/{cartItemId}")]
        [AllowAnonymous]
        public async Task<IActionResult> UpdateQuantity(
            int cartItemId,
            [FromBody] UpdateCartItemRequest request)
        {
            try
            {
                var userId = GetUserId();

                var cart = await _cartService.UpdateQuantityAsync(
                    userId,
                    cartItemId,
                    request);

                return Ok(new
                {
                    Message = "Cart quantity updated successfully.",
                    Data = cart
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }


        // =========================================================
        // REMOVE ITEM
        // =========================================================

        [HttpDelete("item/{cartItemId}")]
        [AllowAnonymous]
        public async Task<IActionResult> RemoveItem(
            int cartItemId,
            [FromQuery] string? guestCartId)
        {
            try
            {
                var userId = GetUserId();

                var cart = await _cartService.RemoveItemAsync(
                    userId,
                    cartItemId,
                    guestCartId);

                return Ok(new
                {
                    Message = "Item removed from cart successfully.",
                    Data = cart
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }


        // =========================================================
        // CLEAR CART
        // =========================================================

        [HttpDelete("clear")]
        [AllowAnonymous]
        public async Task<IActionResult> ClearCart(
            [FromQuery] string? guestCartId)
        {
            var userId = GetUserId();

            await _cartService.ClearCartAsync(
                userId,
                guestCartId);

            return Ok(new
            {
                Message = "Cart cleared successfully."
            });
        }


        // =========================================================
        // MERGE GUEST CART AFTER LOGIN
        // =========================================================

        [HttpPost("merge")]
        [Authorize]
        public async Task<IActionResult> MergeGuestCart(
            [FromQuery] string guestCartId)
        {
            if (string.IsNullOrWhiteSpace(guestCartId))
            {
                return BadRequest(
                    "GuestCartId is required.");
            }

            var userId = GetUserId();

            if (!userId.HasValue)
            {
                return Unauthorized();
            }

            var cart = await _cartService.MergeGuestCartAsync(
                userId.Value,
                guestCartId);

            return Ok(new
            {
                Message = "Guest cart merged successfully.",
                Data = cart
            });
        }


        // =========================================================
        // GET USER ID FROM JWT
        // =========================================================

        private int? GetUserId()
        {
            var userIdClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (int.TryParse(userIdClaim, out var userId))
            {
                return userId;
            }

            return null;
        }
    }
}