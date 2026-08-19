import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useParams, Link } from "react-router-dom";

import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import BookCard from "../Components/BookCard";

import { getBooks } from "../services/bookService";

export default function CategoryBooks() {
  const { id } = useParams();

  const [books, setBooks] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadBooks();
  }, [id]);

  const loadBooks = async () => {
    try {
      setLoading(true);

      const data = await getBooks();

      const filteredBooks = data.filter(
        (book) => book.categoryId === Number(id),
      );

      setBooks(filteredBooks);

      if (filteredBooks.length > 0) {
        setCategoryName(filteredBooks[0].categoryName);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const searchedBooks = books.filter((book) => {
    const title = book.title?.toLowerCase() || "";

    const author = book.authorName?.toLowerCase() || "";

    const search = searchTerm.toLowerCase();

    return title.includes(search) || author.includes(search);
  });

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-white">
          {/* =====================================================
          CATEGORY HEADER
      ===================================================== */}
          <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6">
            <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs sm:text-sm mb-4 sm:mb-6">
                <Link
                  to="/"
                  className="text-gray-500 hover:text-emerald-800 transition"
                >
                  Home
                </Link>

                <span className="text-gray-400">/</span>

                <span className="text-emerald-800 font-semibold truncate">
                  {categoryName}
                </span>
              </div>

              {/* Header Content */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 sm:gap-8">
                {/* Category Information */}
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                    {categoryName}
                  </h1>

                  <p className="text-gray-600 text-sm sm:text-base mt-2 sm:mt-3 max-w-xl leading-relaxed">
                    Explore all books under the{" "}
                    <span className="font-semibold text-emerald-800">
                      {categoryName}
                    </span>{" "}
                    category.
                  </p>

                  {/* Book Count */}
                  <span className="inline-flex items-center mt-4 sm:mt-5 bg-emerald-900 text-white text-xs sm:text-sm font-semibold px-3.5 sm:px-4 py-2 rounded-full">
                    {searchedBooks.length}{" "}
                    {searchedBooks.length === 1 ? "Book" : "Books"} Available
                  </span>
                </div>

                {/* Search */}
                <div className="w-full lg:w-96">
                  <div className="relative">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />

                    <input
                      type="text"
                      placeholder="Search books or authors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl py-3 sm:py-3.5 pl-11 pr-4 text-sm text-gray-800 outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 transition"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =====================================================
          BOOKS SECTION
      ===================================================== */}
          <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
            {/* Section Heading */}
            <div className="flex items-end justify-between mb-4 sm:mb-6">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                  Books in {categoryName}
                </h2>

                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {searchedBooks.length} books found
                </p>
              </div>
            </div>

            {/* =================================================
            EMPTY STATE
        ================================================= */}
            {searchedBooks.length === 0 ? (
              <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl sm:rounded-3xl py-12 sm:py-16 px-5 sm:px-6 text-center">
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">📚</div>

                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  No Books Available
                </h3>

                <p className="text-gray-500 text-sm mt-2">
                  No books found matching your search.
                </p>
              </div>
            ) : (
              /* =================================================
             BOOK GRID
          ================================================= */
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {searchedBooks.map((book) => (
                  <BookCard key={book.bookId} book={book} viewMode="grid" />
                ))}
              </div>
            )}
          </section>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white">
        {/* Header */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-[#FAF8F5] border border-stone-200 rounded-3xl p-6 sm:p-8 md:p-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm mb-6">
              <Link
                to="/"
                className="text-gray-500 hover:text-emerald-800 transition"
              >
                Home
              </Link>

              <span className="text-gray-400">/</span>

              <span className="text-emerald-800 font-semibold">
                {categoryName}
              </span>
            </div>

            {/* Header Content */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              {/* Category Information */}
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900">
                  {categoryName}
                </h1>

                <p className="text-gray-600 mt-3 max-w-xl">
                  Explore all books under the{" "}
                  <span className="font-semibold text-emerald-800">
                    {categoryName}
                  </span>{" "}
                  category.
                </p>

                <span className="inline-block mt-5 bg-emerald-900 text-white text-sm font-semibold px-4 py-2 rounded-full">
                  {searchedBooks.length}{" "}
                  {searchedBooks.length === 1 ? "Book" : "Books"} Available
                </span>
              </div>

              {/* Search */}
              <div className="w-full lg:w-96">
                <div className="relative">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={19}
                  />

                  <input
                    type="text"
                    placeholder="Search books or authors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl py-3.5 pl-11 pr-4 text-sm text-gray-800 outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 transition"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Books */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Section Heading */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Books in {categoryName}
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {searchedBooks.length} books found
              </p>
            </div>
          </div>

          {/* Empty State */}
          {searchedBooks.length === 0 ? (
            <div className="bg-[#FAF8F5] border border-stone-200 rounded-3xl py-16 px-6 text-center">
              <div className="text-5xl mb-4">📚</div>

              <h3 className="text-xl font-bold text-gray-900">
                No Books Available
              </h3>

              <p className="text-gray-500 mt-2">
                No books found matching your search.
              </p>
            </div>
          ) : (
            /* Book Grid */
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {searchedBooks.map((book) => (
                <BookCard key={book.bookId} book={book} viewMode="grid" />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
