import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  Star,
  Heart,
  ShoppingCart,
  LayoutGrid,
  List,
  Mail,
  Home,
  ChevronRight,
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
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [reviews, setReviews] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("1000");
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const booksPerPage = 8;

  const booksSectionRef = useRef(null);

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

    setCurrentPage(1);
    loadBooks();
    loadCategories();
    loadReviews();
  }, [searchQuery, selectedCategory, maxPrice, minRating, sortBy]);

  useEffect(() => {
    if (currentPage > 1) {
      booksSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [currentPage]);

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

  /* New function */

  const getDiscountedPrice = (book) => {
    const price = Number(book.price || 0);
    const discount = Number(book.discountPercentage || 0);

    return price - (price * discount) / 100;
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

      const discountedPrice = getDiscountedPrice(book);

      const matchesPrice =
        (minPrice === "" || discountedPrice >= Number(minPrice)) &&
        (maxPrice === "" || discountedPrice <= Number(maxPrice));

      // filter books with rating and star

      const bookRating = getBookRating(book.title).average;

      const matchesRating = minRating === 0 || bookRating >= minRating;

      return matchesSearch && matchesCategory && matchesPrice && matchesRating;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.publishedDate || 0) - new Date(a.publishedDate || 0);
      }

      // Calculate discounted price
      const getDiscountedPrice = (book) => {
        const price = Number(book.price || 0);
        const discount = Number(book.discountPercentage || 0);

        return price - (price * discount) / 100;
      };

      if (sortBy === "price-low") {
        return getDiscountedPrice(a) - getDiscountedPrice(b);
      }

      if (sortBy === "price-high") {
        return getDiscountedPrice(b) - getDiscountedPrice(a);
      }

      if (sortBy === "rating") {
        return 0;
      }

      return 0;
    });

  const booksWithRatings = filteredBooks.map((book) => ({
    ...book,
    rating: getBookRating(book.title),
  }));

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;

  const paginatedBooks = booksWithRatings.slice(startIndex, endIndex);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-white">
        {/* =====================================================
          HERO SECTION
      ===================================================== */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
          <div className="bg-[#1b3b2b] border border-emerald-800/40 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-12 flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-sm">
            {/* Decorative ambient background glow */}
            <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Hero Text & Breadcrumbs */}
            <div className="max-w-xl z-10 mb-6 md:mb-0">
              {/* Breadcrumb */}
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-emerald-200/80 font-medium mb-3 sm:mb-4">
                <Link
                  to="/"
                  className="hover:text-white flex items-center transition-colors"
                >
                  <Home className="h-4 w-4 mr-1" />
                  Home
                </Link>
                <ChevronRight className="h-3.5 w-3.5 text-emerald-400/60" />
                <span className="text-white font-semibold">Books</span>
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2 sm:mb-3">
                Explore Different Books
              </h1>

              <p className="text-emerald-100/90 text-xs sm:text-base leading-relaxed max-w-md font-medium">
                Explore thousands of books across various genres and categories.
              </p>
            </div>

            {/* Hero Image */}
            <div className="relative z-10 w-full md:w-[40%] flex justify-center">
              <div className="relative group w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-2xl blur opacity-20 group-hover:opacity-35 transition duration-300"></div>
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJLjkVx7DHArpi4KQTQZ2nltg7MihDumrtk3K4G26ztAr6c7MiE4svdTs&s=10"
                  alt="Writing poetry and stories"
                  className="relative rounded-xl sm:rounded-2xl object-cover w-full h-[130px] sm:h-[180px] md:h-[220px] shadow-md border border-white/10"
                />
              </div>
            </div>
          </div>
        </div>
        {/* =====================================================
          MAIN CONTENT
      ===================================================== */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
            {/* =================================================
              DESKTOP SIDEBAR
          ================================================= */}
            <div className="hidden lg:block w-72 shrink-0 space-y-6">
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

                  {(showAllCategories
                    ? categories
                    : categories.slice(0, 4)
                  ).map((cat) => (
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

                {categories.length > 4 && (
                  <button
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="w-full mt-4 border border-gray-200 hover:bg-gray-50 text-gray-800 text-xs font-semibold py-2.5 rounded-xl transition-colors"
                  >
                    {showAllCategories ? "Show Less" : "View All Categories"}
                  </button>
                )}
              </div>

              {/* Price Range */}
              <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 text-sm">
                    Price Range
                  </h3>

                  {/* Reset Button */}
                  <button
                    type="button"
                    onClick={() => setMaxPrice(2000)}
                    className="text-xs text-emerald-800 font-semibold hover:text-emerald-950 hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                </div>

                {/* Price Slider */}
                <input
                  type="range"
                  min="50"
                  max="2000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-emerald-900 cursor-pointer mb-4"
                />

                {/* Price Inputs */}
                <div className="flex items-center gap-2">
                  {/* Minimum Price */}
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-xs text-gray-400">
                      ₹
                    </span>

                    <input
                      type="number"
                      value="50"
                      readOnly
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-6 pr-3 text-xs text-gray-600"
                    />
                  </div>

                  <span className="text-gray-400">-</span>

                  {/* Maximum Price */}
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-xs text-gray-400">
                      ₹
                    </span>

                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => {
                        const value = e.target.value;

                        // Allow the input to be temporarily empty
                        if (value === "") {
                          setMaxPrice("");
                          return;
                        }

                        setMaxPrice(Number(value));
                      }}
                      onBlur={() => {
                        // Restore default if left empty
                        if (maxPrice === "") {
                          setMaxPrice(1000);
                        }
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-6 pr-3 text-xs text-gray-600"
                    />
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              {/* <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-sm">
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
                        {Array.from({
                          length: rating,
                        }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-current" />
                        ))}

                        <span className="text-gray-600 text-xs ml-1.5">
                          & Up
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div> */}
            </div>

            {/* =================================================
              RIGHT CONTENT
          ================================================= */}
            <div ref={booksSectionRef} className="flex-1 min-w-0">
              {/* =================================================
                MOBILE SEARCH
            ================================================= */}
              <div className="lg:hidden mb-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search books, authors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-11 text-sm focus:outline-none focus:border-emerald-700"
                  />

                  <button className="absolute right-2 top-2 bg-emerald-900 text-white p-2 rounded-lg">
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* =================================================
                MOBILE CATEGORY SCROLL
            ================================================= */}
              <div className="lg:hidden mb-4 overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 w-max">
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap ${
                      selectedCategory === "All"
                        ? "bg-emerald-900 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    All
                  </button>

                  {categories.map((cat) => (
                    <button
                      key={cat.categoryId}
                      onClick={() => setSelectedCategory(cat.categoryName)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap ${
                        selectedCategory === cat.categoryName
                          ? "bg-emerald-900 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {cat.categoryName}
                    </button>
                  ))}
                </div>
              </div>

              {/* =================================================
                RESULTS / SORT BAR
            ================================================= */}
              <div className="bg-white border border-gray-200/80 rounded-xl sm:rounded-2xl shadow-sm mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  {/* Result Count */}
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Showing
                    <span className="font-bold text-gray-900">
                      {" "}
                      {filteredBooks.length === 0 ? 0 : startIndex + 1} -{" "}
                      {Math.min(endIndex, filteredBooks.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-gray-900">
                      {filteredBooks.length}
                    </span>{" "}
                    books
                  </p>

                  {/* Controls */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-3">
                    {/* Sort */}
                    <div className="flex items-center gap-2">
                      <span className="hidden sm:block text-xs text-gray-500 font-medium">
                        Sort by:
                      </span>

                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:border-emerald-700"
                      >
                        <option value="newest">Newest</option>

                        <option value="price-low">Price: Low</option>

                        <option value="price-high">Price: High</option>

                        <option value="rating">Rating</option>
                      </select>
                    </div>

                    {/* View Mode */}
                    <div className="flex items-center space-x-1 border border-gray-200 rounded-lg p-1 bg-gray-50">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-1.5 rounded-md transition-colors ${
                          viewMode === "grid"
                            ? "bg-emerald-900 text-white shadow-sm"
                            : "text-gray-500"
                        }`}
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-1.5 rounded-md transition-colors ${
                          viewMode === "list"
                            ? "bg-emerald-900 text-white shadow-sm"
                            : "text-gray-500"
                        }`}
                      >
                        <List className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* =================================================
                LOADING
            ================================================= */}
              {loading && (
                <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-500">
                  <p className="text-lg font-semibold mb-1">Loading books...</p>
                </div>
              )}

              {/* =================================================
                ERROR
            ================================================= */}
              {!loading && error && (
                <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-red-500">
                  <p className="text-lg font-semibold mb-1">{error}</p>
                </div>
              )}

              {/* =================================================
                BOOK GRID
            ================================================= */}
              {!loading && !error && filteredBooks.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-500">
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
                        ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
                        : "space-y-4"
                    }
                  >
                    {paginatedBooks.map((book) => (
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

              {/* =========================
    PAGINATION
========================= */}

              {!loading && !error && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  {/* Previous */}
                  <button
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-emerald-50 hover:text-emerald-900"
                    }`}
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1,
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-xl text-sm font-semibold transition-colors ${
                        currentPage === page
                          ? "bg-emerald-900 text-white"
                          : "bg-white text-gray-700 border border-gray-200 hover:bg-emerald-50 hover:text-emerald-900"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Next */}
                  <button
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-emerald-50 hover:text-emerald-900"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* =================================================
                NEWSLETTER
            ================================================= */}
          <section className="bg-[#F2F5F1] border border-emerald-900/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 flex flex-col lg:flex-row items-center justify-between shadow-sm mt-6 sm:mt-10">
            {/* Left Info */}
            <div className="flex items-center space-x-3 sm:space-x-4 mb-5 lg:mb-0 w-full lg:w-auto">
              <div className="bg-emerald-900 text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm shrink-0">
                <Mail className="h-5 w-5 sm:h-7 sm:w-7" />
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                  Stay Updated
                </h3>

                <p className="text-gray-600 text-xs sm:text-sm max-w-md">
                  Subscribe to get updates on new books, events and exciting
                  announcements.
                </p>
              </div>
            </div>

            {/* Newsletter Input */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
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
