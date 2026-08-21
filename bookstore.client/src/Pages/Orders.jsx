import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { getMyOrders } from "../Services/orderService";
import { API_BASE_URL } from "../Services/api";
import { ChevronRight, Home } from "lucide-react";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [bookImages, setBookImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // =========================================================
  // FETCH ORDERS (UNCHANGED)
  // =========================================================

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        const data = await getMyOrders();

        // -----------------------------------------------------
        // Only show confirmed/completed orders
        // -----------------------------------------------------

        const confirmedOrders = data.filter((order) => {
          const status = order.orderStatus?.toLowerCase();

          return (
            status === "confirmed" ||
            status === "shipped" ||
            status === "delivered"
          );
        });

        setOrders(confirmedOrders);

        // -----------------------------------------------------
        // Fetch book details for images
        // -----------------------------------------------------

        const bookIds = [
          ...new Set(
            confirmedOrders.flatMap(
              (order) => order.items?.map((item) => item.bookId) || [],
            ),
          ),
        ];

        const imageMap = {};

        await Promise.all(
          bookIds.map(async (bookId) => {
            try {
              const response = await fetch(
                `${API_BASE_URL}/api/Book/${bookId}`,
              );

              if (!response.ok) return;

              const book = await response.json();

              imageMap[bookId] =
                book.imageUrl ||
                book.image ||
                book.coverImage ||
                book.coverImageUrl ||
                null;
            } catch (error) {
              console.error(`Failed to load book ${bookId}`, error);
            }
          }),
        );

        setBookImages(imageMap);
      } catch (err) {
        console.error(err);
        setError("Unable to load your orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // =========================================================
  // FORMAT DATE (UNCHANGED)
  // =========================================================

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // =========================================================
  // LOADING STATE UI
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-gray-50/50">
        <Navbar />

        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-[#174733] rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-sm text-gray-500 font-medium">
              Loading your orders...
            </p>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // =========================================================
  // MAIN RENDER (MOBILE ENHANCED CARDS + DESKTOP LAYOUT)
  // =========================================================

  return (
    <div className="bg-gray-50/50 min-h-screen flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-10 space-y-6 sm:space-y-8">
          {/* HERO HEADER */}
          <div className="bg-[#1b3b2b] border border-emerald-800/40 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-sm">
            <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-xl z-10 mb-4 md:mb-0 w-full md:w-auto">
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-emerald-200/80 font-medium mb-2 sm:mb-3">
                <Link
                  to="/"
                  className="hover:text-white flex items-center transition-colors"
                >
                  <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                  Home
                </Link>
                <ChevronRight className="h-3.5 w-3.5 text-emerald-400/60" />
                <Link to={"/orders"} className="text-white font-semibold">
                  Orders
                </Link>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-1.5 sm:mb-2">
                My Orders
              </h1>

              <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed max-w-md font-medium">
                View your purchased books and order history.
              </p>
            </div>

            <div className="relative z-10 w-full md:w-[35%] flex justify-center">
              <div className="relative group w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-2xl blur opacity-20 group-hover:opacity-35 transition duration-300" />
                <img
                  src="https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Literary collection"
                  className="relative rounded-xl object-cover w-full h-[110px] sm:h-[150px] shadow-md border border-white/10"
                />
              </div>
            </div>
          </div>

          {/* ERROR STATE */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-5 text-center text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          {/* EMPTY STATE */}
          {!error && orders.length === 0 && (
            <div className="bg-white border border-gray-200/80 rounded-2xl py-12 sm:py-16 px-4 text-center shadow-sm">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">📚</div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                No purchased books yet
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-sm mx-auto">
                Your confirmed book purchases will appear here once placed.
              </p>
              <button
                onClick={() => navigate("/books")}
                className="mt-5 sm:mt-6 bg-[#174733] hover:bg-[#123a29] text-white px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shadow-sm"
              >
                Browse Books
              </button>
            </div>
          )}

          {/* ORDERS LIST */}
          {!error && orders.length > 0 && (
            <div className="space-y-5 sm:space-y-6">
              {orders.map((order) => (
                <div
                  key={order.orderId}
                  className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden"
                >
                  {/* ORDER CARD HEADER */}
                  <div className="bg-gray-50/80 border-b border-gray-200/80 px-4 sm:px-5 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="font-bold text-gray-900 text-sm sm:text-base">
                        Order #{order.orderId}
                      </h2>
                      <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                        Purchased on {formatDate(order.orderDate)}
                      </p>
                    </div>

                    <span className="text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      Confirmed
                    </span>
                  </div>

                  {/* ORDER ITEMS */}
                  <div className="sm:p-5 space-y-4">
                    {order.items?.map((item) => {
                      const image = bookImages[item.bookId];

                      return (
                        <div
                          key={item.orderItemId}
                          onClick={() => navigate(`/book/${item.bookId}`)}
                          className="
          group
          bg-white
          border border-gray-200
          rounded-2xl
          overflow-hidden
          cursor-pointer
          hover:border-[#174733]/40
          hover:shadow-lg
          transition-all
          duration-300
        "
                        style={{height:"300px"}}>
                          <div className="flex flex-col sm:flex-row">
                            {/* =========================================
              BOOK COVER
          ========================================= */}
                            <div
                              className="
              relative
              w-full
              h-[320px]
              sm:h-auto
              sm:w-[220px]
              md:w-[240px]
              lg:w-[230px]
              sm:min-h-[320px]
              shrink-0
              bg-[#edf5f1]
              overflow-hidden
            "
                            >
                              {image ? (
                                <img
                                  src={image}
                                  alt={item.bookTitle}
                                  className="
                  absolute
                  inset-0
                  w-full
                  h-full
                  object-cover
                  group-hover:scale-[1.03]
                  transition-transform
                  duration-500
                "
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-[#dfeee7] text-[#174733]">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-14 h-14"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5"
                                      d="M6 4h12a1 1 0 011 1v14a1 1 0 01-1 1H6a1 1 0 01-1-1V5a1 1 0 011-1z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5"
                                      d="M9 8h6M9 12h6M9 16h4"
                                    />
                                  </svg>
                                </div>
                              )}

                              {/* Book spine */}
                              <div className="absolute inset-y-0 left-0 w-1 bg-black/15 pointer-events-none" />

                              {/* Image overlay */}
                              <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-transparent pointer-events-none" />
                            </div>

                            {/* =========================================
              BOOK DETAILS
          ========================================= */}
                            <div className="flex-1 p-4 sm:p-6 md:p-7 flex flex-col justify-between min-w-0">
                              {/* Book information */}
                              <div>
                                {/* Label */}
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-gray-400 font-bold">
                                    Purchased Book
                                  </span>

                                  <span className="w-1 h-1 rounded-full bg-gray-300" />

                                  <span className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold">
                                    Purchased
                                  </span>
                                </div>

                                {/* Title */}
                                <h3
                                  className="
                  text-xl
                  sm:text-2xl
                  md:text-3xl
                  font-bold
                  text-gray-900
                  group-hover:text-[#174733]
                  transition-colors
                  leading-tight
                  line-clamp-3
                "
                                >
                                  {item.bookTitle}
                                </h3>

                                <p className="text-xs sm:text-sm text-gray-500 mt-2">
                                  Your purchased book is ready to view.
                                </p>
                              </div>

                              {/* =========================================
                PRICE + BUTTON
            ========================================= */}
                              <div
                                className="
                mt-6
                sm:mt-8
                pt-4
                sm:pt-5
                border-t
                border-gray-100
                flex
                flex-row
                items-center
                justify-between
                gap-3
              "
                              >
                                {/* Price */}
                                <div>
                                  <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">
                                    Amount Paid
                                  </p>

                                  <p className="text-xl sm:text-2xl font-extrabold text-[#174733]">
                                    ₹{Number(item.totalPrice).toFixed(2)}
                                  </p>
                                </div>

                                {/* View button */}
                                <div
                                  className="
                  inline-flex
                  items-center
                  justify-center
                  gap-1.5
                  bg-[#174733]
                  hover:bg-[#123a29]
                  text-white
                  px-4
                  sm:px-5
                  py-2.5
                  rounded-xl
                  text-xs
                  sm:text-sm
                  font-semibold
                  transition-all
                  group-hover:shadow-md
                  shrink-0
                "
                                >
                                  View Book
                                  <ChevronRight
                                    size={15}
                                    className="group-hover:translate-x-1 transition-transform"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default MyOrders;
