import React from 'react';
import { BookOpen, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';


export default function Footer() {
  return (
    <footer className="bg-white pt-8 pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Card */}
        <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-3xl p-8 md:p-12 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Column 1: Brand & Socials */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="text-emerald-800">
                <BookOpen className="h-8 w-8" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-gray-900 block leading-none">
                  BOOK STORE
                </span>
                <span className="text-[9px] tracking-widest text-gray-400 font-bold uppercase mt-1 block">
                  Online Book Sale & Community Platform
                </span>
              </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed">
              A platform for book lovers and writers to connect, share and celebrate the joy of words.
            </p>

            {/* Social Icons */}
            <div className="flex items-center space-x-3 pt-2">
              <a href="#facebook" className="bg-emerald-900 text-white p-2.5 rounded-full hover:bg-emerald-800 transition-colors shadow-sm">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#instagram" className="bg-emerald-900 text-white p-2.5 rounded-full hover:bg-emerald-800 transition-colors shadow-sm">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#twitter" className="bg-emerald-900 text-white p-2.5 rounded-full hover:bg-emerald-800 transition-colors shadow-sm">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#youtube" className="bg-emerald-900 text-white p-2.5 rounded-full hover:bg-emerald-800 transition-colors shadow-sm">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-bold text-gray-900 text-base mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link className="text-gray-600 hover:text-emerald-700 transition-colors" to={'/'}>Home</Link>
              </li>
              {/* books,writers,events,about,contact */}
              <li><Link className="text-gray-600 hover:text-emerald-700 transition-colors" to={'/all/books'}>books</Link>
              </li>
              <li><Link className="text-gray-600 hover:text-emerald-700 transition-colors" to={'/'}>writers</Link>
              </li>
              <li><Link className="text-gray-600 hover:text-emerald-700 transition-colors" to={'/events'}>events</Link>
              </li>
              <li><Link className="text-gray-600 hover:text-emerald-700 transition-colors" to={'/about'}>about us</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Help & Support */}
          <div>
            <h4 className="font-bold text-gray-900 text-base mb-4">Help & Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#faqs" className="text-gray-600 hover:text-emerald-700 transition-colors">FAQs</a></li>
              <li><a href="#submission" className="text-gray-600 hover:text-emerald-700 transition-colors">Submission Guidelines</a></li>
              <li><a href="#shipping" className="text-gray-600 hover:text-emerald-700 transition-colors">Shipping & Delivery</a></li>
              <li><a href="#refund" className="text-gray-600 hover:text-emerald-700 transition-colors">Refund Policy</a></li>
              <li><a href="#terms" className="text-gray-600 hover:text-emerald-700 transition-colors">Terms & Conditions</a></li>
              <li><a href="#privacy" className="text-gray-600 hover:text-emerald-700 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div>
            <h4 className="font-bold text-gray-900 text-base mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-emerald-800 shrink-0 mt-0.5" />
                <span>123 Book Street, Kerala, India</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-emerald-800 shrink-0" />
                <span>+91 123 456 7890</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-emerald-800 shrink-0" />
                <span>info@bookstore.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-emerald-800 shrink-0" />
                <span>Mon - Sat: 9:00 AM - 6:00 PM</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Dark Copyright Bar */}
        <div className="bg-[#003111] text-white text-center py-4 rounded-xl text-sm font-medium">
          © 2026 Book Store. All rights reserved.
        </div>

      </div>
    </footer>
  );
}