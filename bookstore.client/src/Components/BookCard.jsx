import React from "react";
import { Link } from "react-router-dom";
import { Star, ShoppingCart } from "lucide-react";

export default function BookCard({ book }) {
    
return (
    
    <Link
    to={`/book/${book.bookId}`}
    className="block no-underline"
>
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 h-full">

        {/* Book Image */}
        <div className="h-48 sm:h-52 bg-gray-100 flex items-center justify-center p-2 overflow-hidden">

            {book.imageUrl ? (
                <img
                    src={book.imageUrl}
                    alt={book.title}
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                />
            ) : (
                <div className="text-4xl">
                    📚
                </div>
            )}

        </div>

        {/* Book Details */}
        <div className="p-4">

            {/* Category */}
            <p className="text-xs font-semibold text-emerald-700 mb-1">
                {book.categoryName}
            </p>

            {/* Fixed Title Area */}
            <div className="h-11 overflow-hidden">

                <h3 className="font-bold text-gray-900 text-base leading-5 line-clamp-2">
                    {book.title}
                </h3>

            </div>

            {/* Fixed Author Area */}
            <div className="h-5 overflow-hidden mt-1">

                <p className="text-xs text-gray-500 truncate">
                    {book.authorName || "Unknown Author"}
                </p>

            </div>

            {/* Price + Cart */}
            <div className="flex items-center justify-between mt-4">

                <span className="text-base font-bold text-emerald-800">
                    ₹{book.price}
                </span>

                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 p-2 rounded-lg transition"
                >
                    <ShoppingCart className="w-4 h-4" />
                </button>

            </div>

        </div>

    </div>
</Link>
);


}