import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { addToCart } from "../services/cartService";
import { notifyCartUpdated } from "../utils/cartEvents";

export default function BookCard({ book }) {
  const [isAdded, setIsAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAdding) return;

    try {
      setIsAdding(true);

      // Add book to cart
      const response = await addToCart(book.bookId, 1);

      console.log("Added to cart:", response);

      // Update navbar cart count
      notifyCartUpdated();

      // Show success state
      setIsAdded(true);

      // Toast
      toast.success(`${book.title} added to cart!`, {
        position: "top-right",
        autoClose: 500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Reset button after 1.8 seconds
      setTimeout(() => {
        setIsAdded(false);
      }, 1800);
    } catch (error) {
      console.error("Failed to add book to cart:", error);

      toast.error(
        error.message || "Failed to add book to cart.",
        {
          position: "top-right",
          autoClose: 2500,
        }
      );
    } finally {
      setIsAdding(false);
    }
  };

  const authorName =
    book.author || book.authorName || "Unknown Author";

  const originalPrice = Number(book.price || 0);

  const discountedPrice = Number(
    book.discountedPrice || originalPrice
  );

  const discountPercent = Number(
    book.discountPercentage || 0
  );

  const hasDiscount =
    discountPercent > 0 &&
    discountedPrice < originalPrice;

  return (
    <div className="group relative w-full sm:w-[230px] flex flex-col bg-white border border-stone-200/90 rounded-2xl p-3 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

      {/* =====================================================
          BOOK IMAGE
      ===================================================== */}

      <div className="relative w-full aspect-[4/6] bg-stone-100 rounded-xl overflow-hidden mb-3">

        {/* New Badge */}

        {(book.isNew || book.badge === "New") && (
          <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 text-[11px] font-bold text-white bg-red-600 rounded-md shadow-xs">
            New
          </span>
        )}

        {/* Book Image */}

        <Link
          to={`/book/${book.bookId}`}
          className="block w-full h-full"
        >
          {book.imageUrl ? (
            <img
              src={book.imageUrl}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 bg-stone-200">
              <span className="text-5xl">📚</span>
            </div>
          )}
        </Link>

        {/* =====================================================
            ADD TO CART BUTTON
        ===================================================== */}

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAdding}
          className={`
            absolute bottom-3 right-3 z-10
            p-2.5 rounded-full shadow-lg
            transition-all duration-300 cursor-pointer
            disabled:cursor-not-allowed
            ${
              isAdded
                ? "bg-emerald-700 text-white scale-110 opacity-100 translate-y-0"
                : "bg-white hover:text-green-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 translate-y-0 sm:translate-y-2 sm:group-hover:translate-y-0"
            }
          `}
          aria-label="Add to cart"
        >

          {isAdding ? (
            <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
          ) : isAdded ? (
            <Check className="w-4 h-4" />
          ) : (
            <ShoppingCart className="w-4 h-4" />
          )}

        </button>
      </div>

      {/* =====================================================
          BOOK INFORMATION
      ===================================================== */}

      <div className="flex flex-col flex-1 justify-between px-0.5">

        <div>

          {/* Title */}

          <Link
            to={`/book/${book.bookId}`}
            className="block"
          >
            <h3 className="text-sm font-bold text-stone-900 leading-tight line-clamp-1 hover:text-emerald-700 transition-colors">
              {book.title}
            </h3>
          </Link>

          {/* Pricing */}

          <div className="flex items-center gap-2 mt-2 flex-wrap">

            {/* Discounted Price */}

            <span className="text-sm font-extrabold text-red-600">
              ₹{discountedPrice.toFixed(2)}
            </span>

            {/* Original Price */}

            {hasDiscount && (
              <span className="text-xs text-stone-400 line-through font-medium">
                ₹{originalPrice.toFixed(2)}
              </span>
            )}

            {/* Discount Percentage */}

            {hasDiscount && (
              <span className="text-[10px] font-bold text-white bg-emerald-500 px-1.5 py-0.5 rounded">
                {discountPercent}% OFF
              </span>
            )}

          </div>

          {/* Author */}

          <p className="mt-2 text-[11px] text-green-500 font-semibold uppercase tracking-wider truncate">
            {authorName}
          </p>

        </div>

      </div>

    </div>
  );
}