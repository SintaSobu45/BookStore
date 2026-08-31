import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Users,
  FolderOpen,
  Building2,
  IndianRupee,
  AlertTriangle,
  PackageX,
  PackageCheck,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import { getBooks } from "../../services/bookService";
import { getAuthors } from "../../services/authorService";
import { getCategories } from "../../services/categoryService";
import { getPublishers } from "../../services/publisherService";

function AdminDashboard() {
  const [stats, setStats] = useState({
    revenue: 25000,
    books: 0,
    categories: 0,
    authors: 0,
    publishers: 0,
  });

  const [recentBooks, setRecentBooks] = useState([]);
  const [topBooks, setTopBooks] = useState([]);

  const [inventory, setInventory] = useState({
    inStock: 0,
    lowStock: 0,
    outStock: 0,
  });

  const [books, setBooks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stockFilter, setStockFilter] = useState("all");
  const [stockSearch, setStockSearch] = useState("");

  const inventoryRef = useRef(null);

  // =========================================================
  // LOAD DASHBOARD DATA
  // =========================================================

  const loadData = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [booksData, authorsData, categoriesData, publishersData] =
        await Promise.all([
          getBooks(),
          getAuthors(),
          getCategories(),
          getPublishers(),
        ]);

      const safeBooks = booksData || [];

      setBooks(safeBooks);

      setStats({
        revenue: 25000,
        books: safeBooks.length,
        categories: categoriesData?.length || 0,
        authors: authorsData?.length || 0,
        publishers: publishersData?.length || 0,
      });

      // -------------------------------------------------------
      // Recent Books
      // -------------------------------------------------------

      setRecentBooks(
        [...safeBooks]
          .sort(
            (a, b) =>
              new Date(b.publishedDate || 0) - new Date(a.publishedDate || 0),
          )
          .slice(0, 5),
      );

      // -------------------------------------------------------
      // Top Expensive Books
      // -------------------------------------------------------

      setTopBooks(
        [...safeBooks]
          .sort((a, b) => Number(b.price || 0) - Number(a.price || 0))
          .slice(0, 5),
      );

      // -------------------------------------------------------
      // Inventory
      //
      // 0       = Out of stock
      // 1 - 5   = Low stock
      // > 5     = In stock
      // -------------------------------------------------------

      setInventory({
        inStock: safeBooks.filter((b) => Number(b.stockQuantity || 0) > 5)
          .length,

        lowStock: safeBooks.filter((b) => {
          const stock = Number(b.stockQuantity || 0);
          return stock >= 1 && stock <= 5;
        }).length,

        outStock: safeBooks.filter((b) => Number(b.stockQuantity || 0) === 0)
          .length,
      });
    } catch (err) {
      console.error("Dashboard loading failed:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================================================
  // INVENTORY LIST
  // =========================================================

  const inventoryBooks = useMemo(() => {
    let result = [...books];

    if (stockFilter === "low") {
      result = result.filter((book) => {
        const stock = Number(book.stockQuantity || 0);
        return stock >= 1 && stock <= 5;
      });
    }

    if (stockFilter === "out") {
      result = result.filter((book) => Number(book.stockQuantity || 0) === 0);
    }

    if (stockFilter === "in") {
      result = result.filter((book) => Number(book.stockQuantity || 0) > 5);
    }

    const search = stockSearch.toLowerCase().trim();

    if (search) {
      result = result.filter(
        (book) =>
          book.title?.toLowerCase().includes(search) ||
          book.authorName?.toLowerCase().includes(search) ||
          book.categoryName?.toLowerCase().includes(search),
      );
    }

    // Important books first:
    // Out of stock → Low stock → Normal
    result.sort((a, b) => {
      const stockA = Number(a.stockQuantity || 0);
      const stockB = Number(b.stockQuantity || 0);

      return stockA - stockB;
    });

    return result;
  }, [books, stockFilter, stockSearch]);

  // =========================================================
  // STOCK STATUS
  // =========================================================

  const getStockStatus = (stockQuantity) => {
    const stock = Number(stockQuantity || 0);

    if (stock === 0) {
      return {
        label: "Out of Stock",
        className: "bg-red-100 text-red-700",
        dot: "bg-red-500",
      };
    }

    if (stock <= 5) {
      return {
        label: "Low Stock",
        className: "bg-amber-100 text-amber-700",
        dot: "bg-amber-500",
      };
    }

    return {
      label: "In Stock",
      className: "bg-emerald-100 text-emerald-700",
      dot: "bg-emerald-500",
    };
  };

  // =========================================================
  // STAT CARDS
  // =========================================================

  const cards = [
    {
      title: "Revenue",
      value: `${stats.revenue.toLocaleString("en-IN")}`,
      subtitle: "Total revenue",
      icon: IndianRupee,
      className: "bg-[#1b3b2b] text-white border-[#1b3b2b]",
      iconClass: "bg-white/10 text-white",
    },
    {
      title: "Books",
      value: stats.books,
      subtitle: "Books in catalog",
      icon: BookOpen,
      className: "bg-white text-gray-900 border-stone-200",
      iconClass: "bg-emerald-50 text-emerald-800",
    },
    {
      title: "Categories",
      value: stats.categories,
      subtitle: "Available categories",
      icon: FolderOpen,
      className: "bg-white text-gray-900 border-stone-200",
      iconClass: "bg-blue-50 text-blue-700",
    },
    {
      title: "Authors",
      value: stats.authors,
      subtitle: "Registered authors",
      icon: Users,
      className: "bg-white text-gray-900 border-stone-200",
      iconClass: "bg-purple-50 text-purple-700",
    },
    {
      title: "Publishers",
      value: stats.publishers,
      subtitle: "Publishing partners",
      icon: Building2,
      className: "bg-white text-gray-900 border-stone-200",
      iconClass: "bg-amber-50 text-amber-700",
    },
  ];

  const handleInventoryClick = (filter) => {
    setStockFilter(filter);
    setStockSearch("");

    // Wait for the filter/UI state to update, then scroll
    setTimeout(() => {
      inventoryRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-7 w-7 animate-spin mx-auto text-[#1b3b2b]" />
          <p className="mt-3 text-sm text-stone-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-6 mt-5 pb-10">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            Dashboard
          </h1>

          <p className="text-sm text-stone-500 mt-1">Welcome back, Admin 👋</p>
        </div>

        <button
          type="button"
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm font-bold text-gray-700 hover:bg-stone-50 disabled:opacity-50 transition"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* =====================================================
          STAT CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className={`rounded-2xl border shadow-sm p-5 ${card.className}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className={`text-xs font-semibold ${
                      card.title === "Revenue"
                        ? "text-white/70"
                        : "text-stone-500"
                    }`}
                  >
                    {card.title}
                  </p>

                  <h2 className="text-2xl md:text-3xl font-extrabold mt-2">
                    {card.value}
                  </h2>

                  <p
                    className={`text-[11px] mt-1 ${
                      card.title === "Revenue"
                        ? "text-white/60"
                        : "text-stone-400"
                    }`}
                  >
                    {card.subtitle}
                  </p>
                </div>

                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconClass}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* =====================================================
          INVENTORY ALERT
      ====================================================== */}

      {inventory.outStock > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <PackageX className="h-5 w-5 text-red-600" />
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-red-900">Out-of-stock alert</h3>

              <p className="text-sm text-red-700 mt-0.5">
                {inventory.outStock}{" "}
                {inventory.outStock === 1 ? "book has" : "books have"} gone out
                of stock.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleInventoryClick("out")}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition"
            >
              View Books
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          INVENTORY OVERVIEW
      ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* In Stock */}

        <button
          type="button"
          onClick={() => handleInventoryClick("in")}
          className={`text-left rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${
            stockFilter === "in"
              ? "border-emerald-400 ring-2 ring-emerald-100"
              : "border-stone-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
              <PackageCheck className="h-5 w-5 text-emerald-700" />
            </div>

            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>

          <p className="text-sm font-semibold text-stone-500 mt-4">In Stock</p>

          <p className="text-3xl font-extrabold text-gray-900 mt-1">
            {inventory.inStock}
          </p>

          <p className="text-xs text-stone-400 mt-1">
            More than 5 copies available
          </p>
        </button>

        {/* Low Stock */}

        <button
          type="button"
          onClick={() => handleInventoryClick("low")}
          className={`text-left rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${
            stockFilter === "low"
              ? "border-amber-400 ring-2 ring-amber-100"
              : "border-stone-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-700" />
            </div>

            <span className="text-[10px] uppercase tracking-wide font-bold text-amber-600">
              Attention
            </span>
          </div>

          <p className="text-sm font-semibold text-stone-500 mt-4">Low Stock</p>

          <p className="text-3xl font-extrabold text-gray-900 mt-1">
            {inventory.lowStock}
          </p>

          <p className="text-xs text-stone-400 mt-1">1–5 copies available</p>
        </button>

        {/* Out of Stock */}

        <button
          type="button"
          onClick={() => handleInventoryClick("out")}
          className={`text-left rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${
            stockFilter === "out"
              ? "border-red-400 ring-2 ring-red-100"
              : "border-stone-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
              <PackageX className="h-5 w-5 text-red-600" />
            </div>

            {inventory.outStock > 0 && (
              <span className="text-[10px] uppercase tracking-wide font-bold text-red-600">
                Action Required
              </span>
            )}
          </div>

          <p className="text-sm font-semibold text-stone-500 mt-4">
            Out of Stock
          </p>

          <p className="text-3xl font-extrabold text-gray-900 mt-1">
            {inventory.outStock}
          </p>

          <p className="text-xs text-stone-400 mt-1">0 copies available</p>
        </button>
      </div>

      {/* =====================================================
          INVENTORY BOOK LIST
      ====================================================== */}

      <div
        ref={inventoryRef}
        className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden scroll-mt-24"
      >
        <div className="p-5 border-b border-stone-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Inventory</h2>

              <p className="text-xs text-stone-500 mt-1">
                Monitor stock levels and identify books that need attention.
              </p>
            </div>

            {/* Search */}

            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />

              <input
                type="text"
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                placeholder="Search books..."
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm outline-none focus:bg-white focus:border-emerald-900 focus:ring-2 focus:ring-emerald-900/10"
              />

              {stockSearch && (
                <button
                  type="button"
                  onClick={() => setStockSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filters */}

          <div className="flex flex-wrap gap-2 mt-4">
            <button
              type="button"
              onClick={() => setStockFilter("all")}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                stockFilter === "all"
                  ? "bg-[#1b3b2b] text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              All Books
            </button>

            <button
              type="button"
              onClick={() => handleInventoryClick("low")}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                stockFilter === "low"
                  ? "bg-amber-500 text-white"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100"
              }`}
            >
              Low Stock ({inventory.lowStock})
            </button>

            <button
              type="button"
              onClick={() => handleInventoryClick("out")}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                stockFilter === "out"
                  ? "bg-red-600 text-white"
                  : "bg-red-50 text-red-700 hover:bg-red-100"
              }`}
            >
              Out of Stock ({inventory.outStock})
            </button>

            <button
              type="button"
              onClick={() => handleInventoryClick("in")}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                stockFilter === "in"
                  ? "bg-emerald-700 text-white"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              In Stock ({inventory.inStock})
            </button>
          </div>
        </div>

        {/* Desktop Table */}

        <div className="hidden md:block overflow-x-auto">
          {inventoryBooks.length === 0 ? (
            <div className="py-14 text-center">
              <PackageCheck className="h-9 w-9 mx-auto text-stone-300" />

              <p className="mt-3 font-semibold text-gray-700">No books found</p>

              <p className="text-xs text-stone-400 mt-1">
                Try changing the filter or search term.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left px-5 py-3.5 font-bold text-gray-700">
                    Book
                  </th>

                  <th className="text-left px-5 py-3.5 font-bold text-gray-700">
                    Author
                  </th>

                  <th className="text-left px-5 py-3.5 font-bold text-gray-700">
                    Category
                  </th>

                  <th className="text-left px-5 py-3.5 font-bold text-gray-700">
                    Price
                  </th>

                  <th className="text-left px-5 py-3.5 font-bold text-gray-700">
                    Stock
                  </th>

                  <th className="text-right px-5 py-3.5 font-bold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100">
                {inventoryBooks.map((book) => {
                  const status = getStockStatus(book.stockQuantity);

                  return (
                    <tr
                      key={book.bookId}
                      className="hover:bg-stone-50 transition"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={book.imageUrl}
                            alt={book.title}
                            className="w-10 h-14 rounded-lg object-cover bg-stone-100"
                          />

                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate max-w-[240px]">
                              {book.title}
                            </p>

                            <p className="text-[11px] text-stone-400 mt-0.5">
                              ID #{book.bookId}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-stone-600">
                        {book.authorName || "-"}
                      </td>

                      <td className="px-5 py-4 text-stone-600">
                        {book.categoryName || "-"}
                      </td>

                      <td className="px-5 py-4 font-semibold">
                        ₹{Number(book.price || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`font-extrabold ${
                            Number(book.stockQuantity || 0) === 0
                              ? "text-red-600"
                              : Number(book.stockQuantity || 0) <= 5
                                ? "text-amber-600"
                                : "text-emerald-700"
                          }`}
                        >
                          {book.stockQuantity || 0}
                        </span>

                        <span className="text-xs text-stone-400 ml-1">
                          copies
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold ${status.className}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                            />

                            {status.label}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile Inventory Cards */}

        <div className="md:hidden divide-y divide-stone-100">
          {inventoryBooks.length === 0 ? (
            <div className="py-14 text-center">
              <PackageCheck className="h-9 w-9 mx-auto text-stone-300" />

              <p className="mt-3 font-semibold text-gray-700">No books found</p>
            </div>
          ) : (
            inventoryBooks.map((book) => {
              const status = getStockStatus(book.stockQuantity);

              return (
                <div key={book.bookId} className="p-4">
                  <div className="flex gap-3">
                    <img
                      src={book.imageUrl}
                      alt={book.title}
                      className="w-14 h-20 rounded-lg object-cover bg-stone-100 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate">
                            {book.title}
                          </p>

                          <p className="text-xs text-stone-500 mt-1">
                            {book.authorName || "Unknown author"}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold ${status.className}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                          />

                          {status.label}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div>
                          <p className="text-[10px] text-stone-400 uppercase font-bold">
                            Stock
                          </p>

                          <p
                            className={`text-lg font-extrabold ${
                              Number(book.stockQuantity || 0) === 0
                                ? "text-red-600"
                                : Number(book.stockQuantity || 0) <= 5
                                  ? "text-amber-600"
                                  : "text-emerald-700"
                            }`}
                          >
                            {book.stockQuantity || 0}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] text-stone-400 uppercase font-bold">
                            Price
                          </p>

                          <p className="font-bold text-gray-900">
                            ₹{Number(book.price || 0).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* =====================================================
          RECENT BOOKS + INVENTORY SUMMARY
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory Summary */}

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-gray-900">Inventory Health</h3>

              <p className="text-xs text-stone-500 mt-1">
                Current catalog stock
              </p>
            </div>

            <PackageCheck className="h-5 w-5 text-emerald-700" />
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-stone-600">In Stock</span>

                <span className="font-bold text-emerald-700">
                  {inventory.inStock}
                </span>
              </div>

              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${
                      stats.books ? (inventory.inStock / stats.books) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-stone-600">Low Stock</span>

                <span className="font-bold text-amber-600">
                  {inventory.lowStock}
                </span>
              </div>

              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{
                    width: `${
                      stats.books ? (inventory.lowStock / stats.books) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-stone-600">Out of Stock</span>

                <span className="font-bold text-red-600">
                  {inventory.outStock}
                </span>
              </div>

              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{
                    width: `${
                      stats.books ? (inventory.outStock / stats.books) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recently Added Books */}

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-stone-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900">Recently Added Books</h3>

              <p className="text-xs text-stone-500 mt-1">
                Latest books added to the catalog
              </p>
            </div>
          </div>

          <div className="divide-y divide-stone-100">
            {recentBooks.map((book) => (
              <div key={book.bookId} className="py-3 flex items-center gap-3">
                <img
                  src={book.imageUrl}
                  alt={book.title}
                  className="w-11 h-14 object-cover rounded-lg shrink-0 bg-stone-100"
                />

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {book.title}
                  </p>

                  <p className="text-xs text-stone-500 mt-0.5">
                    {book.authorName || "-"}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-900 text-sm">
                    ₹{Number(book.price || 0).toLocaleString("en-IN")}
                  </p>

                  <p className="text-[11px] text-stone-400 mt-1">
                    Stock: {book.stockQuantity || 0}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =====================================================
          TOP BOOKS
      ====================================================== */}

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5">
        <div className="mb-5">
          <h3 className="font-bold text-gray-900">Top 5 Expensive Books</h3>

          <p className="text-xs text-stone-500 mt-1">
            Highest priced books in your catalog
          </p>
        </div>

        <div className="space-y-3">
          {topBooks.map((book, index) => (
            <div
              key={book.bookId}
              className="flex items-center justify-between gap-4 p-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#1b3b2b] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {index + 1}
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {book.title}
                  </p>

                  <p className="text-xs text-stone-500 mt-0.5">
                    {book.categoryName || "-"}
                  </p>
                </div>
              </div>

              <span className="font-extrabold text-emerald-700 shrink-0">
                ₹{Number(book.price || 0).toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
