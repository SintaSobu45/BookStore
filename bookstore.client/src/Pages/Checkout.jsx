import React, { useEffect, useState } from "react";
import {
  Truck,
  ShieldCheck,
  Lock,
  Package,
  Award,
  RefreshCw,
  ChevronRight,
  Home,
  Loader2,
  CreditCard,
} from "lucide-react";

import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { Link } from "react-router-dom";
import { getCart } from "../services/cartService";

export default function Checkout() {
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [saveAddress, setSaveAddress] = useState(true);

  const [cart, setCart] = useState(null);
  const [loadingCart, setLoadingCart] = useState(true);
  const [cartError, setCartError] = useState("");

  // =====================================================
  // LOAD CART
  // =====================================================

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoadingCart(true);
      setCartError("");

      const data = await getCart();

      console.log("Checkout cart:", data);

      setCart(data);
    } catch (error) {
      console.error("Failed to load cart:", error);
      setCartError("Failed to load your cart.");
    } finally {
      setLoadingCart(false);
    }
  };

  // =====================================================
  // CART CALCULATIONS
  // =====================================================

  const cartItems = cart?.items || [];

  // Backend SubTotal = total after discounts
  const subtotal = Number(cart?.subTotal || 0);

  // Calculate original total before discounts
  const originalTotal = cartItems.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );

  // Total discount
  const discount = originalTotal - subtotal;

  // Shipping
  const shippingCost =
    shippingMethod === "standard" ? 0 : subtotal > 0 ? 99 : 0;

  // Final amount
  const totalAmount = subtotal + shippingCost;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-white pb-16">
        {/* =====================================================
            HERO BANNER
        ===================================================== */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
          <div className="bg-[#1b3b2b] border border-emerald-800/40 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-12 flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-sm">
            <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Hero Text */}
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

                <Link to={'/cart'} className="text-emerald-200 hover:text-white font-semibold">Cart</Link>

                <ChevronRight className="h-3.5 w-3.5 text-emerald-400/60" />

                <span className="text-white font-semibold">Checkout</span>
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2 sm:mb-3">
                Checkout
              </h1>

              <p className="text-emerald-100/90 text-xs sm:text-base leading-relaxed max-w-md font-medium">
                Complete your order by providing the details below.
              </p>
            </div>

            {/* Hero Image */}
            <div className="relative z-10 w-full md:w-[40%] flex justify-center">
              <div className="relative group w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-2xl blur opacity-20 group-hover:opacity-35 transition duration-300" />

                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdT1zFuL7ncvR-w4Tn1bRNuf1UGfcAw77wbNfnaocjWUsnVxLaq0tHNcw&s=10"
                  alt="Book store checkout"
                  className="relative rounded-xl sm:rounded-2xl object-cover w-full h-[130px] sm:h-[180px] md:h-[220px] shadow-md border border-white/10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            MAIN CHECKOUT
        ===================================================== */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* =====================================================
                LEFT COLUMN
            ===================================================== */}
            <div className="lg:col-span-7 space-y-8">
              {/* =====================================================
                  STEP 1 - SHIPPING ADDRESS
              ===================================================== */}
              <div className="bg-white border border-stone-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm space-y-5 sm:space-y-6">
                <div className="flex items-center space-x-3">
                  <span className="bg-[#1b3b2b] text-white text-sm font-bold h-7 w-7 rounded-full flex items-center justify-center shadow-sm">
                    1
                  </span>

                  <h3 className="text-lg font-bold text-gray-900">
                    Shipping Address
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Full Name
                    </label>

                    <input
                      type="text"
                      placeholder="Enter your full name"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Phone Number
                    </label>

                    <input
                      type="text"
                      placeholder="Enter your phone number"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Email Address
                  </label>

                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Address
                  </label>

                  <textarea
                    rows="3"
                    placeholder="House no., Street, Area"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-sm focus:outline-none focus:border-emerald-700 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      State
                    </label>

                    <select className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:border-emerald-700">
                      <option value="">Select state</option>
                      <option value="KL">Kerala</option>
                      <option value="MH">Maharashtra</option>
                      <option value="KA">Karnataka</option>
                      <option value="DL">Delhi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Pincode
                    </label>

                    <input
                      type="text"
                      placeholder="Enter pincode"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-700"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="save"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="accent-[#1b3b2b] h-4 w-4 rounded"
                  />

                  <label
                    htmlFor="save"
                    className="text-xs font-medium text-gray-600 cursor-pointer"
                  >
                    Use this address for future orders
                  </label>
                </div>
              </div>

              {/* =====================================================
                  STEP 2 - SHIPPING METHOD
              ===================================================== */}
              <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center space-x-3">
                  <span className="bg-[#1b3b2b] text-white text-sm font-bold h-7 w-7 rounded-full flex items-center justify-center shadow-sm">
                    2
                  </span>

                  <h3 className="text-lg font-bold text-gray-900">
                    Shipping Method
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Standard */}
                  <div
                    onClick={() => setShippingMethod("standard")}
                    className={`border-2 rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all ${
                      shippingMethod === "standard"
                        ? "border-[#1b3b2b] bg-emerald-50/20"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="shipping"
                        checked={shippingMethod === "standard"}
                        onChange={() => setShippingMethod("standard")}
                        className="accent-[#1b3b2b] mt-1"
                      />

                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">
                          Standard Shipping
                        </h4>

                        <p className="text-xs text-gray-500">
                          3 - 5 Working Days
                        </p>

                        <span className="inline-block mt-2 font-bold text-xs text-emerald-800">
                          FREE
                        </span>
                      </div>
                    </div>

                    <Truck className="h-6 w-6 text-emerald-800 shrink-0" />
                  </div>

                  {/* Express */}
                  <div
                    onClick={() => setShippingMethod("express")}
                    className={`border-2 rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all ${
                      shippingMethod === "express"
                        ? "border-[#1b3b2b] bg-emerald-50/20"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="shipping"
                        checked={shippingMethod === "express"}
                        onChange={() => setShippingMethod("express")}
                        className="accent-[#1b3b2b] mt-1"
                      />

                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">
                          Express Shipping
                        </h4>

                        <p className="text-xs text-gray-500">
                          1 - 2 Working Days
                        </p>

                        <span className="inline-block mt-2 font-bold text-xs text-gray-900">
                          ₹99
                        </span>
                      </div>
                    </div>

                    <Truck className="h-6 w-6 text-emerald-800 shrink-0" />
                  </div>
                </div>
              </div>

              {/* =====================================================
                  STEP 3 - PAYMENT METHOD
              ===================================================== */}
              {/* Step 3: Payment Method */}
              <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center space-x-3">
                  <span className="bg-[#1b3b2b] text-white text-sm font-bold h-7 w-7 rounded-full flex items-center justify-center shadow-sm">
                    3
                  </span>

                  <h3 className="text-lg font-bold text-gray-900">
                    Payment Method
                  </h3>
                </div>

                {/* Razorpay Only */}
                <div className="border-2 border-[#1b3b2b] bg-emerald-50/30 rounded-2xl p-5 sm:p-6">
                  <div className="flex items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked
                        readOnly
                        className="accent-[#1b3b2b] mt-1 sm:mt-0"
                      />

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                            Razorpay
                          </h4>

                          <span className="bg-emerald-900 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full">
                            SECURE
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 mt-1">
                          Pay securely using UPI, Credit/Debit Cards, Net
                          Banking and more.
                        </p>
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-2">
                      <CreditCard className="h-6 w-6 text-emerald-800" />
                      <ShieldCheck className="h-6 w-6 text-emerald-800" />
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="flex flex-wrap items-center gap-2 mt-5 pt-5 border-t border-emerald-900/10">
                    <span className="text-[10px] font-semibold text-gray-400 mr-1">
                      Supported:
                    </span>

                    {["UPI", "Cards", "Net Banking", "Wallets"].map(
                      (method) => (
                        <span
                          key={method}
                          className="bg-white border border-stone-200 px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold text-gray-600 shadow-sm"
                        >
                          {method}
                        </span>
                      ),
                    )}
                  </div>

                  {/* Security */}
                  <div className="flex items-center gap-2 mt-5 text-xs font-semibold text-emerald-800">
                    <Lock className="h-4 w-4" />
                    <span>
                      You will be redirected to Razorpay to complete your
                      payment securely.
                    </span>
                  </div>
                </div>

                {/* Place Order CTA */}
                <button
                  type="button"
                  className="w-full bg-[#1b3b2b] hover:bg-emerald-950 text-white font-bold py-4 px-6 rounded-2xl shadow-md flex items-center justify-center space-x-2 transition-colors cursor-pointer text-base"
                >
                  <Lock className="h-5 w-5" />
                  <span>Proceed to Secure Payment</span>
                </button>
              </div>
            </div>

            {/* =====================================================
                RIGHT COLUMN
            ===================================================== */}
            <div className="lg:col-span-5 space-y-6">
              {/* =====================================================
                  ORDER SUMMARY
              ===================================================== */}
              <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm space-y-6 lg:sticky lg:top-24">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <h3 className="font-bold text-gray-900 text-base">
                    Order Summary
                  </h3>

                  <span className="text-xs font-semibold text-gray-500">
                    {cart?.totalItems || 0}{" "}
                    {cart?.totalItems === 1 ? "Item" : "Items"} in Cart
                  </span>
                </div>

                {/* Cart Items */}
                <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                  {loadingCart ? (
                    <div className="py-10 flex flex-col items-center justify-center text-gray-500">
                      <Loader2 className="h-6 w-6 animate-spin text-emerald-800 mb-2" />

                      <p className="text-xs">Loading your cart...</p>
                    </div>
                  ) : cartError ? (
                    <div className="py-8 text-center">
                      <p className="text-sm text-red-500">{cartError}</p>
                    </div>
                  ) : cartItems.length === 0 ? (
                    <div className="py-10 text-center">
                      <Package className="h-8 w-8 text-stone-300 mx-auto mb-2" />

                      <p className="text-sm font-semibold text-gray-700">
                        Your cart is empty
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        Add some books before checkout.
                      </p>
                    </div>
                  ) : (
                    cartItems.map((item) => (
                      <div
                        key={item.cartItemId}
                        className="flex items-center gap-3 border-b border-stone-100 pb-4 last:border-0"
                      >
                        {/* Image */}
                        <div className="h-16 w-12 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-100">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.bookTitle}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-stone-300" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                            {item.bookTitle}
                          </h4>

                          <p className="text-[11px] text-gray-500 mt-1">
                            Qty: {item.quantity}
                          </p>

                          <div className="flex items-center gap-2 mt-1">
                            {Number(item.discountPercentage) > 0 && (
                              <span className="text-[11px] text-gray-400 line-through">
                                ₹{Number(item.price).toFixed(2)}
                              </span>
                            )}

                            <span className="text-xs font-semibold text-emerald-800">
                              ₹{Number(item.discountedPrice).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="text-right shrink-0">
                          <span className="font-bold text-gray-900 text-xs">
                            ₹{Number(item.itemTotal).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Cost Calculations */}
                {!loadingCart && cartItems.length > 0 && (
                  <>
                    <div className="space-y-3 pt-4 text-xs text-gray-600 border-t border-stone-100">
                      <div className="flex justify-between">
                        <span>
                          Original Price ({cart?.totalItems || 0}{" "}
                          {cart?.totalItems === 1 ? "item" : "items"})
                        </span>

                        <span className="font-semibold text-gray-900">
                          ₹{originalTotal.toFixed(2)}
                        </span>
                      </div>

                      {discount > 0 && (
                        <div className="flex justify-between text-emerald-800">
                          <span>Discount</span>

                          <span className="font-semibold">
                            - ₹{discount.toFixed(2)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span>Subtotal</span>

                        <span className="font-semibold text-gray-900">
                          ₹{subtotal.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>Shipping Charges</span>

                        <span className="font-semibold text-emerald-800">
                          {shippingCost === 0
                            ? "FREE"
                            : `₹${shippingCost.toFixed(2)}`}
                        </span>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="border-t border-stone-200 pt-4 flex items-center justify-between">
                      <span className="font-bold text-gray-900 text-sm sm:text-base">
                        Total Amount
                      </span>

                      <span className="font-extrabold text-emerald-900 text-xl sm:text-2xl">
                        ₹{totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </>
                )}

                {/* Secure */}
                <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-4 flex items-start space-x-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-800 shrink-0 mt-0.5" />

                  <div>
                    <h4 className="font-bold text-gray-900 text-xs">
                      Safe & Secure
                    </h4>

                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Your personal data and payment information are securely
                      protected.
                    </p>
                  </div>
                </div>
              </div>

              {/* =====================================================
                  WHY SHOP WITH US
              ===================================================== */}
              <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 text-sm mb-3">
                  Why Shop With Us?
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start space-x-3">
                    <Truck className="h-4 w-4 text-emerald-800 shrink-0 mt-0.5" />

                    <div>
                      <p className="font-bold text-gray-900">Free Shipping</p>

                      <p className="text-gray-500">On orders above ₹499</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <RefreshCw className="h-4 w-4 text-emerald-800 shrink-0 mt-0.5" />

                    <div>
                      <p className="font-bold text-gray-900">Easy Returns</p>

                      <p className="text-gray-500">7 days return policy</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <ShieldCheck className="h-4 w-4 text-emerald-800 shrink-0 mt-0.5" />

                    <div>
                      <p className="font-bold text-gray-900">Secure Payment</p>

                      <p className="text-gray-500">100% secure checkout</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Award className="h-4 w-4 text-emerald-800 shrink-0 mt-0.5" />

                    <div>
                      <p className="font-bold text-gray-900">Best Price</p>

                      <p className="text-gray-500">
                        Get the best deals & offers
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            TRUST STRIP
        ===================================================== */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="bg-stone-50 border border-stone-200/80 rounded-3xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center space-y-1">
              <Package className="h-5 w-5 text-emerald-800 mb-1" />

              <h4 className="font-bold text-gray-900 text-xs">
                100% Original Books
              </h4>

              <p className="text-[11px] text-gray-500">
                Sourced directly from publishers
              </p>
            </div>

            <div className="flex flex-col items-center space-y-1">
              <Truck className="h-5 w-5 text-emerald-800 mb-1" />

              <h4 className="font-bold text-gray-900 text-xs">Free Delivery</h4>

              <p className="text-[11px] text-gray-500">
                On orders above ₹499 across India
              </p>
            </div>

            <div className="flex flex-col items-center space-y-1">
              <RefreshCw className="h-5 w-5 text-emerald-800 mb-1" />

              <h4 className="font-bold text-gray-900 text-xs">Easy Returns</h4>

              <p className="text-[11px] text-gray-500">
                Hassle-free returns within 7 days
              </p>
            </div>

            <div className="flex flex-col items-center space-y-1">
              <ShieldCheck className="h-5 w-5 text-emerald-800 mb-1" />

              <h4 className="font-bold text-gray-900 text-xs">
                Secure Checkout
              </h4>

              <p className="text-[11px] text-gray-500">
                Multiple payment options & secure checkout
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
