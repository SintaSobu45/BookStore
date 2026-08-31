import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Package,
  MapPin,
  CalendarDays,
  CreditCard,
  Truck,
  ShoppingBag,
  ArrowRight,
  Home,
  Loader2,
  Receipt,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

import { getOrderById } from "../services/orderService";
import { getBooks } from "../services/bookService";

export default function OrderSuccess() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [recommendedBooks, setRecommendedBooks] = useState([]);

  // =====================================================
  // LOAD ORDER + RECOMMENDATIONS
  // =====================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        // Load order
        const orderData = await getOrderById(orderId);

        console.log("Order success data:", orderData);

        setOrder(orderData);

        // Load all books for recommendations
        const booksData = await getBooks();

        console.log("Recommended books source:", booksData);

        // IDs of books already purchased
        const purchasedBookIds = orderData.items.map((item) => item.bookId);

        // Filter purchased books and inactive/out-of-stock books
        const recommendations = booksData
          .filter(
            (book) =>
              !purchasedBookIds.includes(book.bookId) &&
              book.isActive !== false &&
              Number(book.stockQuantity || 0) > 0,
          )
          .slice(0, 4);

        setRecommendedBooks(recommendations);
      } catch (error) {
        console.error("Failed to load order success page:", error);

        setError(error.message || "Failed to load your order details.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [orderId]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-stone-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-9 h-9 animate-spin text-emerald-800 mx-auto mb-4" />

            <p className="text-sm font-medium text-stone-500">
              Loading your order details...
            </p>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !order) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
          <div className="bg-white border border-stone-200 rounded-3xl shadow-sm p-8 max-w-md w-full text-center">
            <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />

            <h1 className="text-xl font-extrabold text-gray-900">
              Unable to Load Order
            </h1>

            <p className="text-sm text-stone-500 mt-2">
              {error || "We couldn't find this order."}
            </p>

            <Link
              to="/orders"
              className="inline-flex items-center justify-center mt-6 bg-[#1b3b2b] hover:bg-emerald-950 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors"
            >
              View My Orders
            </Link>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  const formattedDate = new Date(order.orderDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const fullAddress = [
    order.shippingAddress,
    order.city,
    order.state,
    order.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-stone-50 pb-16">
        {/* =====================================================
            SUCCESS HERO
        ===================================================== */}

        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
          <div className="bg-white border border-stone-200 rounded-3xl shadow-sm overflow-hidden">
            {/* TOP SUCCESS AREA */}

            <div className="px-5 py-8 sm:px-10 sm:py-12 text-center border-b border-stone-100">
              <div className="payment-success-icon w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="success-check w-11 h-11 text-emerald-700" />
              </div>

              <p className="text-xs font-bold tracking-[0.2em] uppercase text-emerald-700 mb-3">
                Payment Successful
              </p>

              <h1 className="text-2xl sm:text-4xl font-black text-gray-900">
                Thank You, {order.customerName}!
              </h1>

              <p className="text-sm sm:text-base text-stone-500 mt-3 max-w-xl mx-auto leading-relaxed">
                Your order has been placed successfully. We'll process your
                books and prepare them for delivery.
              </p>
            </div>

            {/* ORDER QUICK DETAILS */}

            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-stone-100">
              <div className="p-5 sm:p-6 text-center">
                <Receipt className="w-5 h-5 text-emerald-800 mx-auto mb-2" />

                <p className="text-[10px] uppercase tracking-wider font-bold text-stone-400">
                  Order Number
                </p>

                <p className="text-sm font-extrabold text-gray-900 mt-1">
                  #{order.orderId}
                </p>
              </div>

              <div className="p-5 sm:p-6 text-center">
                <CalendarDays className="w-5 h-5 text-emerald-800 mx-auto mb-2" />

                <p className="text-[10px] uppercase tracking-wider font-bold text-stone-400">
                  Order Date
                </p>

                <p className="text-sm font-extrabold text-gray-900 mt-1">
                  {formattedDate}
                </p>
              </div>

              <div className="p-5 sm:p-6 text-center">
                <CreditCard className="w-5 h-5 text-emerald-800 mx-auto mb-2" />

                <p className="text-[10px] uppercase tracking-wider font-bold text-stone-400">
                  Amount Paid
                </p>

                <p className="text-sm font-extrabold text-emerald-800 mt-1">
                  ₹{Number(order.totalAmount || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            ORDER DETAILS
        ===================================================== */}

        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ORDER ITEMS */}

            <div className="lg:col-span-2 bg-white border border-stone-200 rounded-3xl shadow-sm p-5 sm:p-7">
              <div className="flex items-center gap-3 pb-5 border-b border-stone-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-emerald-800" />
                </div>

                <div>
                  <h2 className="font-extrabold text-gray-900">Your Books</h2>

                  <p className="text-xs text-stone-500 mt-0.5">
                    {order.items?.length || 0} book
                    {order.items?.length !== 1 ? "s" : ""} in this order
                  </p>
                </div>
              </div>

              <div className="divide-y divide-stone-100">
                {order.items?.map((item) => (
                  <div
                    key={item.orderItemId}
                    className="py-5 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                        {item.bookTitle}
                      </h3>

                      <p className="text-xs text-stone-500 mt-1">
                        Quantity: {item.quantity}
                      </p>

                      <p className="text-xs text-stone-400 mt-1">
                        ₹{Number(item.unitPrice || 0).toFixed(2)} each
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-extrabold text-gray-900">
                      ₹{Number(item.totalPrice || 0).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT SIDE */}

            <div className="space-y-6">
              {/* DELIVERY ADDRESS */}

              <div className="bg-white border border-stone-200 rounded-3xl shadow-sm p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-emerald-800" />
                  </div>

                  <h2 className="font-extrabold text-gray-900">
                    Delivery Address
                  </h2>
                </div>

                <p className="text-sm font-bold text-gray-900">
                  {order.customerName}
                </p>

                <p className="text-xs text-stone-500 leading-relaxed mt-2">
                  {fullAddress}
                </p>

                <p className="text-xs text-stone-500 mt-3">
                  {order.customerPhone}
                </p>
              </div>

              {/* ORDER TOTAL */}

              <div className="bg-white border border-stone-200 rounded-3xl shadow-sm p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Package className="w-5 h-5 text-emerald-800" />
                  </div>

                  <h2 className="font-extrabold text-gray-900">
                    Payment Summary
                  </h2>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-stone-500">
                    <span>Subtotal</span>

                    <span className="font-medium text-gray-800">
                      ₹{Number(order.subTotal || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-stone-500">
                    <span>Courier Fee</span>

                    <span className="font-medium text-gray-800">
                      ₹{Number(order.courierFee || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="pt-4 mt-4 border-t border-stone-100 flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total Paid</span>

                    <span className="text-xl font-black text-emerald-900">
                      ₹{Number(order.totalAmount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            ORDER STATUS
        ===================================================== */}

        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-[#1b3b2b] rounded-3xl p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1">
              <p className="text-white font-bold">
                Order confirmed and being processed
              </p>

              <p className="text-emerald-100/75 text-xs mt-1">
                We'll keep your order safe while it is prepared for delivery.
              </p>
            </div>

            <span className="inline-flex self-start sm:self-auto bg-white/10 text-white border border-white/10 px-3 py-1.5 rounded-full text-xs font-bold">
              {order.orderStatus}
            </span>
          </div>
        </section>

        {/* =====================================================
            ACTIONS
        ===================================================== */}

        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              to="/orders"
              className="inline-flex items-center justify-center gap-2 border border-stone-200 bg-white hover:bg-stone-50 text-gray-800 font-bold text-sm px-6 py-3.5 rounded-xl transition-colors"
            >
              <Package className="w-4 h-4" />
              View My Orders
            </Link>

            <Link
              to="/all/books"
              className="inline-flex items-center justify-center gap-2 bg-[#1b3b2b] hover:bg-emerald-950 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-colors"
            >
              Continue Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* =====================================================
            YOU MAY ALSO LIKE
        ===================================================== */}

        {recommendedBooks.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
                  Keep Exploring
                </p>

                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
                  You May Also Like
                </h2>

                <p className="text-sm text-stone-500 mt-2">
                  Discover more books from our collection.
                </p>
              </div>

              <Link
                to="/all/books"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-emerald-800 hover:text-emerald-950"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {recommendedBooks.map((book) => (
                <Link
                  key={book.bookId}
                  to={`/book/${book.bookId}`}
                  className="group bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-[3/4] bg-stone-100 overflow-hidden">
                    {book.imageUrl ? (
                      <img
                        src={book.imageUrl}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-stone-300" />
                      </div>
                    )}
                  </div>

                  <div className="p-3 sm:p-4">
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2 min-h-[40px]">
                      {book.title}
                    </h3>

                    <p className="text-sm font-black text-emerald-800 mt-2">
                      ₹
                      {Number(book.discountedPrice ?? book.price ?? 0).toFixed(
                        2,
                      )}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
