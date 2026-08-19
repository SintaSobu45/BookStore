import React, { useEffect, useState } from "react";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  ArrowLeft,
  Home,
  ChevronRight,
  Package,
  ShieldCheck,
  Truck,
  Loader2,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import {
  getCart,
  updateCartQuantity,
  removeCartItem,
  clearCart,
} from "../services/cartService";
import { notifyCartUpdated } from "../utils/cartEvents";

export default function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [removingItemId, setRemovingItemId] = useState(null);
  const [clearingCart, setClearingCart] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD CART
  // =====================================================

  const loadCart = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const guestCartId = localStorage.getItem("guestCartId");

      const data = await getCart(token, guestCartId);
      setCart(data);
    } catch (err) {
      console.error("Failed to load cart:", err);
      setError("Failed to load your cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // =====================================================
  // UPDATE QUANTITY
  // =====================================================

  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity < 1) return;
    if (newQuantity > item.availableStock) return;

    try {
      setUpdatingItemId(item.cartItemId);
      const response = await updateCartQuantity(item.cartItemId, newQuantity);
      setCart(response.data);
      notifyCartUpdated();
    } catch (err) {
      console.error("Failed to update quantity:", err);
      setError(err.message || "Failed to update quantity.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  // =====================================================
  // REMOVE ITEM
  // =====================================================

  const handleRemoveItem = async (cartItemId) => {
    try {
      setRemovingItemId(cartItemId);
      const response = await removeCartItem(cartItemId);
      setCart(response.data);
      notifyCartUpdated();
    } catch (err) {
      console.error("Failed to remove item:", err);
      setError(err.message || "Failed to remove item.");
    } finally {
      setRemovingItemId(null);
    }
  };

  // =====================================================
  // CLEAR CART
  // =====================================================

  const handleClearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) return;

    try {
      setClearingCart(true);
      await clearCart();
      setCart((previousCart) => ({
        ...previousCart,
        items: [],
        totalItems: 0,
        subTotal: 0,
      }));
      notifyCartUpdated();
    } catch (err) {
      console.error("Failed to clear cart:", err);
      setError(err.message || "Failed to clear cart.");
    } finally {
      setClearingCart(false);
    }
  };

  // =====================================================
  // CALCULATIONS
  // =====================================================

  const items = cart?.items || [];

  const originalTotal = items.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );

  const discountedTotal = items.reduce(
    (total, item) => total + Number(item.itemTotal),
    0
  );

  const totalSavings = originalTotal - discountedTotal;

  // =====================================================
  // LOADING STATE
  // =====================================================

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[70vh] flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-900 mb-4" />
          <p className="text-sm font-medium text-gray-500">
            Loading your cart...
          </p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-stone-50/50 pb-12">
        {/* =====================================================
            HERO
        ===================================================== */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="bg-[#1b3b2b] border border-emerald-800/40 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 relative overflow-hidden">
            <div className="absolute -right-16 -bottom-20 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-200/80 font-medium mb-4">
                <Link
                  to="/"
                  className="hover:text-white flex items-center transition-colors"
                >
                  <Home className="h-4 w-4 mr-1" />
                  Home
                </Link>
                <ChevronRight className="h-3.5 w-3.5 text-emerald-400/60" />
                <span className="text-white font-semibold">Shopping Cart</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-11 w-11 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-emerald-100" />
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                      Your Cart
                    </h1>
                  </div>
                  <p className="text-emerald-100/80 text-sm">
                    Review your selected books before checkout.
                  </p>
                </div>

                {items.length > 0 && (
                  <span className="self-start sm:self-auto bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white">
                    {cart?.totalItems || 0}{" "}
                    {cart?.totalItems === 1 ? "Item" : "Items"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            MAIN CONTENT AREA
        ===================================================== */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          {error && (
            <div className="mb-5 flex items-center justify-between gap-4 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
              <span>{error}</span>
              <button
                onClick={() => setError("")}
                className="hover:text-red-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {items.length === 0 ? (
            /* EMPTY CART STATE */
            <div className="max-w-2xl mx-auto bg-white border border-stone-200 rounded-3xl p-8 sm:p-14 text-center my-8 shadow-sm">
              <div className="h-16 w-16 mx-auto mb-5 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-emerald-800" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Your cart is empty
              </h2>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-7">
                Looks like you haven't added any books yet. Explore our
                collection and find your next great read.
              </p>
              <Link
                to="/all/books"
                className="inline-flex items-center gap-2 bg-[#1b3b2b] hover:bg-emerald-950 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Link>
            </div>
          ) : (
            /* POPULATED CART LAYOUT */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* ITEM LIST (8 COLS) */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      Cart Items
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {cart?.totalItems}{" "}
                      {cart?.totalItems === 1 ? "book" : "books"} in your cart
                    </p>
                  </div>
                  <button
                    onClick={handleClearCart}
                    disabled={clearingCart}
                    className="text-xs sm:text-sm font-semibold text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
                  >
                    {clearingCart ? "Clearing..." : "Clear Cart"}
                  </button>
                </div>

                <div className="space-y-4">
                  {items.map((item) => {
                    const isUpdating = updatingItemId === item.cartItemId;
                    const isRemoving = removingItemId === item.cartItemId;
                    const itemSavings =
                      (Number(item.price) - Number(item.discountedPrice)) *
                      item.quantity;

                    return (
                      <div
                        key={item.cartItemId}
                        className="bg-white border border-stone-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm hover:border-emerald-200/80 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-stretch">
                          {/* Book Image with Navigation Link */}
                          <Link
                            to={`/book/${item.bookId}`}
                            className="w-28 h-36 sm:w-36 sm:h-48 bg-stone-100 rounded-xl overflow-hidden shrink-0 border border-stone-200 group relative block mx-auto sm:mx-0"
                          >
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.bookTitle}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-8 w-8 text-stone-300" />
                              </div>
                            )}
                          </Link>

                          {/* Details & Actions Container */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between w-full">
                            <div>
                              <div className="flex justify-between items-start gap-4">
                                <div className="min-w-0">
                                  {/* Title with Link */}
                                  <Link
                                    to={`/book/${item.bookId}`}
                                    className="font-bold text-gray-900 text-base sm:text-lg hover:text-emerald-800 transition-colors line-clamp-2"
                                  >
                                    {item.bookTitle}
                                  </Link>

                                  {item.discountPercentage > 0 && (
                                    <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded-md mt-1.5">
                                      {item.discountPercentage}% OFF
                                    </span>
                                  )}
                                </div>

                                <button
                                  onClick={() =>
                                    handleRemoveItem(item.cartItemId)
                                  }
                                  disabled={isRemoving}
                                  className="h-9 w-9 shrink-0 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center disabled:opacity-50 border border-transparent hover:border-red-100"
                                  title="Remove item"
                                >
                                  {isRemoving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4.5 w-4.5" />
                                  )}
                                </button>
                              </div>

                              {/* Price Row */}
                              <div className="mt-3 flex items-baseline gap-2">
                                <span className="font-bold text-lg sm:text-xl text-emerald-950">
                                  ₹{Number(item.discountedPrice).toFixed(2)}
                                </span>
                                {Number(item.discountPercentage) > 0 && (
                                  <span className="text-xs sm:text-sm text-gray-400 line-through">
                                    ₹{Number(item.price).toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Controls and Total Row */}
                            <div className="flex flex-wrap items-end justify-between gap-4 mt-6 pt-4 border-t border-stone-100">
                              {/* Quantity Selector */}
                              <div>
                                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1.5">
                                  Quantity
                                </p>
                                <div className="inline-flex items-center border border-stone-200 rounded-xl overflow-hidden bg-stone-50">
                                  <button
                                    onClick={() =>
                                      handleQuantityChange(
                                        item,
                                        item.quantity - 1
                                      )
                                    }
                                    disabled={
                                      item.quantity <= 1 || isUpdating
                                    }
                                    className="h-9 w-9 flex items-center justify-center hover:bg-stone-200/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <Minus className="h-3.5 w-3.5 text-gray-700" />
                                  </button>

                                  <span className="h-9 min-w-10 px-3 flex items-center justify-center bg-white border-x border-stone-200 text-sm font-bold text-gray-900">
                                    {isUpdating ? (
                                      <Loader2 className="h-4 w-4 animate-spin text-emerald-800" />
                                    ) : (
                                      item.quantity
                                    )}
                                  </span>

                                  <button
                                    onClick={() =>
                                      handleQuantityChange(
                                        item,
                                        item.quantity + 1
                                      )
                                    }
                                    disabled={
                                      item.quantity >= item.availableStock ||
                                      isUpdating
                                    }
                                    className="h-9 w-9 flex items-center justify-center hover:bg-stone-200/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <Plus className="h-3.5 w-3.5 text-gray-700" />
                                  </button>
                                </div>
                              </div>

                              {/* Item Total Display */}
                              <div className="text-right">
                                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-0.5">
                                  Item Total
                                </p>
                                <p className="text-lg sm:text-xl font-extrabold text-gray-900">
                                  ₹{Number(item.itemTotal).toFixed(2)}
                                </p>
                                {itemSavings > 0 && (
                                  <p className="text-[11px] text-emerald-700 font-semibold">
                                    Saved ₹{itemSavings.toFixed(2)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <Link
                    to="/all/books"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-900 hover:text-emerald-700 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Continue Shopping
                  </Link>
                </div>
              </div>

              {/* ORDER SUMMARY SIDEBAR (4 COLS) */}
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-24 bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 pb-4 border-b border-stone-100">
                    <ShoppingCart className="h-5 w-5 text-emerald-800" />
                    <h2 className="font-bold text-gray-900 text-lg">
                      Order Summary
                    </h2>
                  </div>

                  <div className="space-y-3 py-5 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>
                        Subtotal ({cart?.totalItems || 0}{" "}
                        {cart?.totalItems === 1 ? "item" : "items"})
                      </span>
                      <span className="font-semibold text-gray-900">
                        ₹{originalTotal.toFixed(2)}
                      </span>
                    </div>

                    {totalSavings > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Discount Savings</span>
                        <span className="font-semibold">
                          - ₹{totalSavings.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-gray-600">
                      <span>Delivery</span>
                      <span className="font-medium text-gray-400">
                        Calculated at checkout
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-stone-200 pt-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="font-bold text-gray-900">Cart Total</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Taxes included where applicable
                        </p>
                      </div>
                      <span className="text-2xl font-extrabold text-emerald-950">
                        ₹{discountedTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/checkout")}
                    className="w-full mt-6 bg-[#1b3b2b] hover:bg-emerald-950 text-white font-bold py-3.5 px-5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <div className="mt-6 pt-5 border-t border-stone-100 space-y-3">
                    <div className="flex items-center gap-2.5 text-xs text-gray-500">
                      <ShieldCheck className="h-4 w-4 text-emerald-800 shrink-0" />
                      Secure checkout with Razorpay
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-gray-500">
                      <Truck className="h-4 w-4 text-emerald-800 shrink-0" />
                      Delivery options available at checkout
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}