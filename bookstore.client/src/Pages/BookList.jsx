import React, { useEffect, useState } from "react";
import {
  Search,
  Star,
  Heart,
  ShoppingCart,
  LayoutGrid,
  List,
  Mail,
} from "lucide-react";

import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { getBooks } from "../services/bookService";
import { Link, useNavigate } from "react-router-dom";
import { getCategories } from "../services/categoryService";
import { getReviews } from "../services/reviewService";
import BookCard from "../Components/BookCard";

export default function BookList() {
  const navigate = useNavigate();

  const [allBooks, setAllBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(2000);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch real books from backend
  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getBooks();

        console.log("Books from backend:", data);

        setAllBooks(data);
      } catch (error) {
        console.error("Failed to load books:", error);

        setError("Failed to load books.");
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
    loadCategories();
    loadReviews();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      console.log("category response", data);
      setCategories(data);
    } catch (error) {
      console.log(error);
    }
  };

  const loadReviews = async () => {
    try {
      const data = await getReviews();
      console.log("review response", data);
      setReviews(data);
    } catch (error) {
      console.log(error);
    }
  };

  const getBookRating = (bookTitle) => {
    const bookReviews = reviews.filter(
      (review) => review.bookTitle === bookTitle,
    );

    if (bookReviews.length === 0) {
      return {
        average: 0,
        count: 0,
      };
    }

    const total = bookReviews.reduce((sum, review) => sum + review.rating, 0);

    return {
      average: total / bookReviews.length,
      count: bookReviews.length,
    };
  };
  // Filter & Sort Logic
  const filteredBooks = allBooks
    .filter((book) => {
      const title = book.title?.toLowerCase() || "";
      const author = book.authorName?.toLowerCase() || "";

      const matchesSearch =
        title.includes(searchQuery.toLowerCase()) ||
        author.includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || book.categoryName === selectedCategory;

      const matchesPrice = Number(book.price) <= maxPrice;

      // filter books with rating and star

      const bookRating = getBookRating(book.title).average;

      const matchesRating = minRating === 0 || bookRating >= minRating;

      return matchesSearch && matchesCategory && matchesPrice && matchesRating;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.publishedDate || 0) - new Date(a.publishedDate || 0);
      }

      if (sortBy === "price-low") {
        return Number(a.price) - Number(b.price);
      }

      if (sortBy === "price-high") {
        return Number(b.price) - Number(a.price);
      }

      // Rating is not currently available
      // from your backend.
      if (sortBy === "rating") {
        return 0;
      }

      return 0;
    });

  const booksWithRatings = filteredBooks.map((book) => ({
    ...book,
    rating: getBookRating(book.title),
  }));

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-white">
        {/* Hero Header Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-sm">
            <div className="max-w-xl z-10 mb-6 md:mb-0">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
                Books
              </h1>

              <p className="text-sm text-gray-500 font-medium mb-3">
                <Link to={"/"} className="hover:text-black">Home</Link> <span className="mx-1">&gt;</span>
                <span className="text-gray-800">Books</span>
              </p>

              <p className="text-gray-600 text-base leading-relaxed">
                Explore thousands of books across various genres and categories.
              </p>
            </div>

            <div className="relative z-10 w-full md:w-[40%] flex justify-center">
              <img
                src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80"
                alt="Books stack"
                className="rounded-2xl object-cover w-full h-[220px] shadow-sm border border-stone-100"
              />
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar Filters */}
            <div className="w-full lg:w-72 shrink-0 space-y-6">
              {/* Search Books */}
              <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-sm">
                <h3 className="font-bold text-gray-900 text-sm mb-3">
                  Search Books
                </h3>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by title, author..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-3 pr-10 text-sm focus:outline-none focus:border-emerald-700"
                  />

                  <button className="absolute right-2 top-2.5 bg-emerald-900 text-white p-1.5 rounded-lg hover:bg-emerald-800">
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-sm">
                <h3 className="font-bold text-gray-900 text-sm mb-4">
                  Categories
                </h3>

                <ul className="space-y-2.5 text-sm">
                  <li>
                    <button
                      onClick={() => setSelectedCategory("All")}
                      className={`w-full text-left flex justify-between items-center py-1 font-medium ${
                        selectedCategory === "All"
                          ? "text-emerald-800 font-bold"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <span>All Categories</span>
                    </button>
                  </li>

                  {categories.map((cat) => (
                    <li key={cat.categoryId}>
                      <button
                        onClick={() => setSelectedCategory(cat.categoryName)}
                        className={`w-full text-left flex justify-between items-center py-1 ${
                          selectedCategory === cat.categoryName
                            ? "text-emerald-800 font-bold"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        <span>{cat.categoryName}</span>
                      </button>
                    </li>
                  ))}
                </ul>

                <button className="w-full mt-4 border border-gray-200 hover:bg-gray-50 text-gray-800 text-xs font-semibold py-2.5 rounded-xl transition-colors">
                  View All Categories
                </button>
              </div>

              {/* Price Range */}
              <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-sm">
                <h3 className="font-bold text-gray-900 text-sm mb-3">
                  Price Range
                </h3>

                <input
                  type="range"
                  min="100"
                  max="2000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-emerald-900 cursor-pointer mb-4"
                />

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-xs text-gray-400">
                      ₹
                    </span>

                    <input
                      type="number"
                      value={0}
                      readOnly
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-6 pr-3 text-xs text-gray-600"
                    />
                  </div>

                  <span className="text-gray-400">-</span>

                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-xs text-gray-400">
                      ₹
                    </span>

                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-6 pr-3 text-xs text-gray-600"
                    />
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-sm">
                <h3 className="font-bold text-gray-900 text-sm mb-3">
                  Minimum Rating
                </h3>

                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <label
                      key={rating}
                      className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="rating"
                        checked={minRating === rating}
                        onChange={() => setMinRating(rating)}
                        className="accent-emerald-900"
                      />

                      <span className="flex items-center text-amber-500">
                        {Array.from({ length: rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-current" />
                        ))}

                        <span className="text-gray-600 text-xs ml-1.5">
                          & Up
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Main Grid Area */}
            <div className="flex-1">
              {/* Top Results & Controls Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border border-gray-200/80 p-4 rounded-2xl shadow-sm mb-6 gap-4">
                <p className="text-sm font-medium text-gray-600">
                  Showing
                  <span className="font-bold text-gray-900">
                    {" "}
                    1 - {filteredBooks.length}
                  </span>{" "}
                  of
                  <span className="font-bold text-gray-900">
                    {" "}
                    {allBooks.length}
                  </span>{" "}
                  books
                </p>

                <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Sort Dropdown */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 font-medium">
                      Sort by:
                    </span>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-emerald-700"
                    >
                      <option value="newest">Newest First</option>

                      <option value="price-low">Price: Low to High</option>

                      <option value="price-high">Price: High to Low</option>

                      <option value="rating">Highest Rated</option>
                    </select>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center space-x-1 border border-gray-200 rounded-xl p-1 bg-gray-50">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded-lg transition-colors ${
                        viewMode === "grid"
                          ? "bg-emerald-900 text-white shadow-sm"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 rounded-lg transition-colors ${
                        viewMode === "list"
                          ? "bg-emerald-900 text-white shadow-sm"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Loading */}
              {loading && (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500">
                  <p className="text-lg font-semibold mb-1">Loading books...</p>
                </div>
              )}

              {/* Error */}
              {!loading && error && (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-red-500">
                  <p className="text-lg font-semibold mb-1">{error}</p>
                </div>
              )}

              {/* Book Cards Display */}
              {!loading && !error && filteredBooks.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500">
                  <p className="text-lg font-semibold mb-1">No books found</p>
                  <p className="text-sm">
                    Try adjusting your search or filter parameters.
                  </p>
                </div>
              ) : (
                !loading &&
                !error && (
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                        : "space-y-4"
                    }
                  >
                    {booksWithRatings.map((book) => (
                      <BookCard
                        key={book.bookId}
                        book={book}
                        rating={book.rating}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Newsletter */}
          <section className="bg-[#F2F5F1] border border-emerald-900/10 rounded-3xl p-6 sm:p-8 md:p-10 flex flex-col lg:flex-row items-center justify-between shadow-sm mt-5">
            {/* Left Info */}
            <div className="flex items-center space-x-4 mb-6 lg:mb-0 w-full lg:w-auto">
              <div className="bg-emerald-900 text-white p-4 rounded-2xl shadow-sm shrink-0">
                <Mail className="h-7 w-7" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  Stay Updated
                </h3>

                <p className="text-gray-600 text-sm max-w-md">
                  Subscribe to get updates on new books, events and exciting
                  announcements.
                </p>
              </div>
            </div>

            {/* Right Input and Button */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-white border border-gray-300 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 outline-none px-4 py-3 rounded-xl text-sm w-full sm:w-80 shadow-sm"
              />

              <button className="bg-emerald-900 hover:bg-emerald-800 text-white font-medium text-sm px-6 py-3 rounded-xl transition-colors shadow-sm w-full sm:w-auto cursor-pointer">
                Subscribe
              </button>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </>
  );
}
