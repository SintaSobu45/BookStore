import React, { useState } from 'react';
import { 
  Truck, ShieldCheck, Lock, CreditCard, CheckCircle2, 
  Package, DollarSign, ArrowRight, Award, RefreshCw 
} from 'lucide-react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

export default function Checkout() {
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [saveAddress, setSaveAddress] = useState(true);

  const cartItems = [
    {
      id: 1,
      title: "The Silent Echoes",
      author: "Arya Menon",
      price: 299,
      qty: 1,
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 2,
      title: "Atomic Habits",
      author: "James Clear",
      price: 349,
      qty: 1,
      image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 3,
      title: "The Subtle Art of Not Giving a F*ck",
      author: "Mark Manson",
      price: 299,
      qty: 1,
      image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80"
    }
  ];

  const subtotal = 947;
  const discount = 47;
  const shippingCost = shippingMethod === 'standard' ? 0 : 99;
  const totalAmount = subtotal - discount + shippingCost;

  return (
    <>
    <Navbar/>

    <div className="min-h-screen bg-white pb-16">
      
      {/* Hero Banner Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-[#1b3b2b] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-sm">
          <div className="max-w-xl z-10 mb-6 md:mb-0">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
              Checkout
            </h1>
            <p className="text-sm text-stone-300 font-medium mb-3">
              Home <span className="mx-1">&gt;</span> Cart <span className="mx-1">&gt;</span> <span className="text-white">Checkout</span>
            </p>
            <p className="text-stone-300 text-base leading-relaxed">
              Complete your order by providing the details below.
            </p>
          </div>
          <div className="relative z-10 w-full md:w-[35%] flex justify-center">
            <img 
              src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=500&q=80" 
              alt="Books stack" 
              className="rounded-2xl object-cover w-full h-[180px] shadow-lg border border-stone-700/50"
            />
          </div>
        </div>
      </div>

      {/* Main Checkout Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form Steps (7 Cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Step 1: Shipping Address */}
            <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center space-x-3">
                <span className="bg-[#1b3b2b] text-white text-sm font-bold h-7 w-7 rounded-full flex items-center justify-center shadow-sm">
                  1
                </span>
                <h3 className="text-lg font-bold text-gray-900">Shipping Address</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your full name" 
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Phone Number</label>
                  <input 
                    type="text" 
                    placeholder="Enter your phone number" 
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Address</label>
                <textarea 
                  rows="3" 
                  placeholder="House no., Street, Area" 
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-sm focus:outline-none focus:border-emerald-700 resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">City</label>
                  <input 
                    type="text" 
                    placeholder="Enter city" 
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">State</label>
                  <select className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:border-emerald-700">
                    <option value="">Enter state</option>
                    <option value="KL">Kerala</option>
                    <option value="MH">Maharashtra</option>
                    <option value="KA">Karnataka</option>
                    <option value="DL">Delhi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Pincode</label>
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
                <label htmlFor="save" className="text-xs font-medium text-gray-600 cursor-pointer">
                  Use this address for future orders
                </label>
              </div>
            </div>

            {/* Step 2: Shipping Method */}
            <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center space-x-3">
                <span className="bg-[#1b3b2b] text-white text-sm font-bold h-7 w-7 rounded-full flex items-center justify-center shadow-sm">
                  2
                </span>
                <h3 className="text-lg font-bold text-gray-900">Shipping Method</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Standard Shipping Card */}
                <div 
                  onClick={() => setShippingMethod('standard')}
                  className={`border-2 rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all ${shippingMethod === 'standard' ? 'border-[#1b3b2b] bg-emerald-50/20' : 'border-stone-200 hover:border-stone-300'}`}
                >
                  <div className="flex items-start space-x-3">
                    <input 
                      type="radio" 
                      name="shipping" 
                      checked={shippingMethod === 'standard'} 
                      onChange={() => setShippingMethod('standard')}
                      className="accent-[#1b3b2b] mt-1"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Standard Shipping</h4>
                      <p className="text-xs text-gray-500">3 - 5 Working Days</p>
                      <span className="inline-block mt-2 font-bold text-xs text-emerald-800">FREE</span>
                    </div>
                  </div>
                  <Truck className="h-6 w-6 text-emerald-800 shrink-0" />
                </div>

                {/* Express Shipping Card */}
                <div 
                  onClick={() => setShippingMethod('express')}
                  className={`border-2 rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all ${shippingMethod === 'express' ? 'border-[#1b3b2b] bg-emerald-50/20' : 'border-stone-200 hover:border-stone-300'}`}
                >
                  <div className="flex items-start space-x-3">
                    <input 
                      type="radio" 
                      name="shipping" 
                      checked={shippingMethod === 'express'} 
                      onChange={() => setShippingMethod('express')}
                      className="accent-[#1b3b2b] mt-1"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Express Shipping</h4>
                      <p className="text-xs text-gray-500">1 - 2 Working Days</p>
                      <span className="inline-block mt-2 font-bold text-xs text-gray-900">₹99</span>
                    </div>
                  </div>
                  <Truck className="h-6 w-6 text-emerald-800 shrink-0" />
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center space-x-3">
                <span className="bg-[#1b3b2b] text-white text-sm font-bold h-7 w-7 rounded-full flex items-center justify-center shadow-sm">
                  3
                </span>
                <h3 className="text-lg font-bold text-gray-900">Payment Method</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Payment Options List (5 Cols) */}
                <div className="md:col-span-5 border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-200 text-xs sm:text-sm">
                  {[
                    { id: 'razorpay', label: 'Razorpay (UPI, Cards, NetBanking)', sub: 'Pay securely via Razorpay' },
                    { id: 'upi', label: 'UPI', sub: 'Pay using any UPI app' },
                    { id: 'card', label: 'Credit / Debit Card', sub: 'Visa, MasterCard, Rupay' },
                    { id: 'netbanking', label: 'Net Banking', sub: 'All major banks supported' },
                    { id: 'wallets', label: 'Wallets', sub: 'PhonePe, Paytm, Amazon Pay' },
                    { id: 'cod', label: 'Cash on Delivery', sub: 'Pay when you receive' }
                  ].map((method) => (
                    <div 
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-3.5 flex items-start space-x-3 cursor-pointer transition-colors ${paymentMethod === method.id ? 'bg-stone-100 font-semibold text-gray-900' : 'hover:bg-stone-50 text-gray-600'}`}
                    >
                      <input 
                        type="radio" 
                        name="payment" 
                        checked={paymentMethod === method.id} 
                        onChange={() => setPaymentMethod(method.id)}
                        className="accent-[#1b3b2b] mt-0.5"
                      />
                      <div>
                        <p className="font-bold text-gray-900 text-xs">{method.label}</p>
                        <p className="text-[11px] text-gray-400">{method.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selected Payment Gateway Info (7 Cols) */}
                <div className="md:col-span-7 bg-stone-50 border border-stone-200/80 rounded-2xl p-6 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-[#1b3b2b]">
                      <ShieldCheck className="h-6 w-6" />
                      <h4 className="font-bold text-gray-900 text-sm">Razorpay Secure Gateway</h4>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      You will be redirected to Razorpay to complete the payment securely.
                    </p>

                    {/* Card Brand Logos representation */}
                    <div className="flex items-center space-x-3 pt-2">
                      <span className="bg-white border border-stone-200 px-3 py-1.5 rounded-lg text-xs font-extrabold text-blue-900 shadow-sm">UPI</span>
                      <span className="bg-white border border-stone-200 px-3 py-1.5 rounded-lg text-xs font-extrabold text-blue-700 shadow-sm">VISA</span>
                      <span className="bg-white border border-stone-200 px-3 py-1.5 rounded-lg text-xs font-extrabold text-red-600 shadow-sm">Mastercard</span>
                      <span className="bg-white border border-stone-200 px-3 py-1.5 rounded-lg text-xs font-extrabold text-cyan-800 shadow-sm">RuPay</span>
                    </div>
                  </div>

                  <div className="border-t border-stone-200 pt-4 flex items-center space-x-2 text-xs text-emerald-800 font-semibold">
                    <Lock className="h-4 w-4" />
                    <span>100% Secure Payments</span>
                  </div>
                </div>

              </div>

              {/* Place Order CTA Button */}
              <button className="w-full bg-[#1b3b2b] hover:bg-emerald-950 text-white font-bold py-4 px-6 rounded-2xl shadow-md flex items-center justify-center space-x-2 transition-colors cursor-pointer text-base">
                <Lock className="h-5 w-5" />
                <span>Place Order & Pay Securely</span>
              </button>

            </div>

          </div>

          {/* Right Column: Order Summary & Why Shop With Us (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Order Summary Box */}
            <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <h3 className="font-bold text-gray-900 text-base">Order Summary</h3>
                <span className="text-xs font-semibold text-gray-500">3 Items in Cart</span>
              </div>

              {/* Items List */}
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between space-x-3 border-b border-stone-50 pb-3">
                    <div className="h-14 w-12 rounded-lg overflow-hidden bg-gray-50 shrink-0 border border-stone-100">
                      <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-xs line-clamp-1">{item.title}</h4>
                      <p className="text-[11px] text-gray-500">by {item.author}</p>
                      <p className="text-[11px] text-gray-400">Qty: {item.qty}</p>
                    </div>
                    <span className="font-bold text-gray-900 text-xs">₹{item.price}</span>
                  </div>
                ))}
              </div>

              {/* Cost Calculations */}
              <div className="space-y-2 pt-2 text-xs text-gray-600 border-t border-stone-100">
                <div className="flex justify-between">
                  <span>Subtotal (3 items)</span>
                  <span className="font-semibold text-gray-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-emerald-800">
                  <span>Discount</span>
                  <span className="font-semibold">- ₹{discount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Charges</span>
                  <span className="font-semibold text-emerald-800">
                    {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                  </span>
                </div>
              </div>

              {/* Total Amount */}
              <div className="border-t border-stone-200 pt-4 flex items-center justify-between">
                <span className="font-bold text-gray-900 text-sm sm:text-base">Total Amount</span>
                <span className="font-extrabold text-emerald-900 text-xl sm:text-2xl">₹{totalAmount}</span>
              </div>

              {/* Secure Checkout Banner inside Summary */}
              <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-4 flex items-start space-x-3">
                <ShieldCheck className="h-5 w-5 text-emerald-800 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 text-xs">Safe & Secure</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Your personal data and payment information are 100% secure with us.
                  </p>
                </div>
              </div>
            </div>

            {/* Why Shop With Us Box */}
            <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Why Shop With Us?</h3>
              
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
                    <p className="text-gray-500">Get best deals & offers</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Footer Trust Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-stone-50 border border-stone-200/80 rounded-3xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center space-y-1">
            <Package className="h-5 w-5 text-emerald-800 mb-1" />
            <h4 className="font-bold text-gray-900 text-xs">100% Original Books</h4>
            <p className="text-[11px] text-gray-500">Sourced directly from publishers</p>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <Truck className="h-5 w-5 text-emerald-800 mb-1" />
            <h4 className="font-bold text-gray-900 text-xs">Free Delivery</h4>
            <p className="text-[11px] text-gray-500">On orders above ₹499 across India</p>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <RefreshCw className="h-5 w-5 text-emerald-800 mb-1" />
            <h4 className="font-bold text-gray-900 text-xs">Easy Returns</h4>
            <p className="text-[11px] text-gray-500">Hassle free returns within 7 days</p>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <ShieldCheck className="h-5 w-5 text-emerald-800 mb-1" />
            <h4 className="font-bold text-gray-900 text-xs">Secure Checkout</h4>
            <p className="text-[11px] text-gray-500">Multiple payment options & 100% secure</p>
          </div>
        </div>
      </div>

    </div>

    <Footer/>
    </>
  );
}