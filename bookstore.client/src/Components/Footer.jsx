import React from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Footer() {
  return (
    <footer className="bg-white pt-5 sm:pt-8 pb-3 sm:pb-4">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* =====================================================
            MAIN FOOTER CARD
        ====================================================== */}

        <div
          className="
            bg-[#FAF8F5]
            border border-stone-200/80
            rounded-2xl sm:rounded-3xl
            p-5 sm:p-8 md:p-12
            shadow-sm

            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-4

            gap-6
            md:gap-8

            mb-5 sm:mb-8
          "
        >
          {/* =================================================
              COLUMN 1 — BRAND & SOCIALS
          ================================================= */}

          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center space-x-3">
              {/* LOGO */}

              <img
                src={logo}
                alt="The Old Library Logo"
                className="object-contain shrink-0 w-[75px] sm:w-[100px]"
              />

              <div>
                <span
                  className="
                    text-[9px]
                    sm:text-[10px]
                    tracking-widest
                    text-gray-500
                    font-bold
                    uppercase
                    block
                    leading-tight
                  "
                >
                  Online Book Sale & Community Platform
                </span>
              </div>
            </div>

            <p
              className="
                text-gray-600
                text-xs
                sm:text-sm
                leading-relaxed
                max-w-sm
              "
            >
              A platform for book lovers and writers to connect, share and
              celebrate the joy of words.
            </p>

            {/* SOCIAL ICONS */}

            <div className="flex items-center space-x-2.5 sm:space-x-3 pt-1 sm:pt-2">
              {/* FACEBOOK */}

              <a
                href="#facebook"
                aria-label="Facebook"
                className="
                  bg-emerald-900
                  text-white
                  p-2
                  sm:p-2.5
                  rounded-full
                  hover:bg-black
                  transition-colors
                  shadow-sm
                  transition-transform
                  ease-in-out
                  hover:rotate-[360deg] duration-700
                "
              >
                <svg
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* INSTAGRAM */}

              <a
                href="#instagram"
                aria-label="Instagram"
                className="
                  bg-emerald-900
                  text-white
                  p-2
                  sm:p-2.5
                  rounded-full
                  hover:bg-black
                  transition-colors
                  shadow-sm
                  transition-transform
                  ease-in-out
                  hover:rotate-[360deg] duration-700
                "
              >
                <svg
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* WHATSAPP COMMUNITY */}

              {
                <a
                  href="https://chat.whatsapp.com/BAhOLBTLsJiLVdD4ynrdw8"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp Community"
                  className="
    bg-emerald-900
    text-white
    p-2
    sm:p-2.5
    rounded-full
    hover:bg-black
    transition-colors
    social-icon
    transition-transform
                  ease-in-out
                  hover:rotate-[360deg] duration-700
  "
                >
                  <svg
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.501-.67-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982 1-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.002 5.45-4.437 9.884-9.887 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.89c0 2.096.547 4.142 1.588 5.945L.057 24l6.304-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.478-8.413" />
                  </svg>
                </a>
              }
            </div>
          </div>

          {/* =================================================
              COLUMN 2 — QUICK LINKS
          ================================================= */}

          <div className="ms-lg-5">
            <h4 className="font-bold text-gray-900 text-sm sm:text-base mb-3 sm:mb-4">
              Quick Links
            </h4>

            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link
                  className="text-gray-600 hover:text-green-500 transition-colors"
                  to="/"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  className="text-gray-600 hover:text-green-500 transition-colors"
                  to="/all/books"
                >
                  Books
                </Link>
              </li>

              <li>
                <Link
                  className="text-gray-600 hover:text-green-500 transition-colors"
                  to="/"
                >
                  Writers
                </Link>
              </li>

              <li>
                <Link
                  className="text-gray-600 hover:text-green-500 transition-colors"
                  to="/events"
                >
                  Events
                </Link>
              </li>

              <li>
                <Link
                  className="text-gray-600 hover:text-green-500 transition-colors"
                  to="/about"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* =================================================
              COLUMN 3 — HELP & SUPPORT
          ================================================= */}

          <div>
            <h4 className="font-bold text-gray-900 text-sm sm:text-base mb-3 sm:mb-4">
              Help & Support
            </h4>

            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm">
              <li>
                <a
                  href="#faqs"
                  className="text-gray-600 hover:text-green-500 transition-colors"
                >
                  FAQs
                </a>
              </li>

              <li>
                <a
                  href="#submission"
                  className="text-gray-600 hover:text-green-500 transition-colors"
                >
                  Submission Guidelines
                </a>
              </li>

              <li>
                <a
                  href="#shipping"
                  className="text-gray-600 hover:text-green-500 transition-colors"
                >
                  Shipping & Delivery
                </a>
              </li>

              <li>
                <a
                  href="#refund"
                  className="text-gray-600 hover:text-green-500 transition-colors"
                >
                  Refund Policy
                </a>
              </li>

              <li>
                <a
                  href="#terms"
                  className="text-gray-600 hover:text-green-500 transition-colors"
                >
                  Terms & Conditions
                </a>
              </li>

              <li>
                <a
                  href="#privacy"
                  className="text-gray-600 hover:text-green-500 transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* =================================================
              COLUMN 4 — CONTACT US
          ================================================= */}

          <div>
            <h4 className="font-bold text-gray-900 text-sm sm:text-base mb-3 sm:mb-4">
              Contact Us
            </h4>

            <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-gray-600">
              <li className="flex items-start space-x-3">
                <MapPin
                  className="
                    h-4 w-4
                    sm:h-5 sm:w-5
                    text-emerald-800
                    shrink-0
                    mt-0.5
                  "
                />

                <span>
                  Thattarambalam, Mavelikara, <br /> Kerala, India
                </span>
              </li>

              <li className="flex items-center space-x-3">
                <Phone
                  className="
                    h-4 w-4
                    sm:h-5 sm:w-5
                    text-emerald-800
                    shrink-0
                  "
                />

                <span>+91 80751 87315</span>
              </li>

              <li className="flex items-center space-x-3">
                <Mail
                  className="
                    h-4 w-4
                    sm:h-5 sm:w-5
                    text-emerald-800
                    shrink-0
                  "
                />

                <span className="break-all">theoldlibraryinfo@gmail.com</span>
              </li>

              <li className="flex items-center space-x-3">
                <Clock
                  className="
                    h-4 w-4
                    sm:h-5 sm:w-5
                    text-emerald-800
                    shrink-0
                  "
                />

                <span>Mon - Sat: 9:00 AM - 6:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* =====================================================
            COPYRIGHT BAR
        ====================================================== */}

        <div
          className="
            flex
            justify-evenly
            bg-[#003111]
            text-white
            text-center
            py-3
            sm:py-4
            px-3
            rounded-xl
            text-[11px]
            sm:text-sm
            font-medium
            footer-section
          "
        >
          <div>© 2026 THE OLD LIBRARY. All rights reserved.</div>

          <div>~ Design & developed by Gseven Technologies Irinjalakuda</div>
        </div>
      </div>
    </footer>
  );
}
