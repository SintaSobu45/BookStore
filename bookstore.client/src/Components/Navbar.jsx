import React from 'react';
import {
  BookOpen,
  ShoppingCart,
  User,
  LogOut,
  UserCircle
} from 'lucide-react';
import { NavLink, Link, useNavigate } from 'react-router-dom';

export default function Navbar() {

  const navigate = useNavigate();

  // Check if user is logged in
  const token = localStorage.getItem('token');

  const isLoggedIn = !!token;

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="h-20 flex items-center justify-between">


          {/* =========================
              Logo & Subtitle
          ========================= */}

          <Link
            to="/"
            className="flex items-center space-x-3 cursor-pointer"
          >

            <div className="text-emerald-700">
              <BookOpen className="h-8 w-8" />
            </div>

            <div>

              <span className="text-xl font-extrabold tracking-tight text-gray-900 block leading-none">
                BOOK STORE
              </span>

              <span className="text-[9px] subtitle-tracking text-gray-400 font-bold uppercase mt-1.5 block">
                Online Book Sale & Community Platform
              </span>

            </div>

          </Link>


          {/* =========================
              Navigation Links
          ========================= */}

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">

            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `relative py-2 flex items-center transition-colors ${
                  isActive
                    ? 'text-[#1b3b2b] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#1b3b2b]'
                    : 'text-gray-600 hover:text-emerald-700 font-medium'
                }`
              }
            >
              Home
            </NavLink>


            <NavLink
              to="/all/books"
              className={({ isActive }) =>
                `relative py-2 flex items-center transition-colors ${
                  isActive
                    ? 'text-[#1b3b2b] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#1b3b2b]'
                    : 'text-gray-600 hover:text-emerald-700 font-medium'
                }`
              }
            >
              Books
            </NavLink>


            <NavLink
              to="/book/upload"
              className={({ isActive }) =>
                `relative py-2 flex items-center transition-colors ${
                  isActive
                    ? 'text-[#1b3b2b] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#1b3b2b]'
                    : 'text-gray-600 hover:text-emerald-700 font-medium'
                }`
              }
            >
              Poetry & Stories
            </NavLink>


            {/* <NavLink
              to="/writers"
              className={({ isActive }) =>
                `relative py-2 flex items-center transition-colors ${
                  isActive
                    ? 'text-[#1b3b2b] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#1b3b2b]'
                    : 'text-gray-600 hover:text-emerald-700 font-medium'
                }`
              }
            >
              Writers
            </NavLink> */}


            <NavLink
              to="/events"
              className={({ isActive }) =>
                `relative py-2 flex items-center transition-colors ${
                  isActive
                    ? 'text-[#1b3b2b] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#1b3b2b]'
                    : 'text-gray-600 hover:text-emerald-700 font-medium'
                }`
              }
            >
              Events
            </NavLink>


            <NavLink
              to="/about"
              className={({ isActive }) =>
                `relative py-2 flex items-center transition-colors ${
                  isActive
                    ? 'text-[#1b3b2b] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#1b3b2b]'
                    : 'text-gray-600 hover:text-emerald-700 font-medium'
                }`
              }
            >
              About Us
            </NavLink>

          </nav>


          {/* =========================
              Right Side Actions
          ========================= */}

          <div className="flex items-center space-x-6">


            {/* Cart */}

            <Link
              className="relative cursor-pointer text-gray-700 hover:text-emerald-700 transition-colors"
              to="/checkout"
            >

              <ShoppingCart className="h-6 w-6" />

              <span className="absolute -top-2 -right-2 bg-emerald-700 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                0
              </span>

            </Link>


            {/* =========================
                Logged In
            ========================= */}

            {isLoggedIn ? (

              <div className="flex items-center space-x-3">

                {/* Profile */}

                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-emerald-700 transition-colors cursor-pointer"
                  title="Profile"
                >

                  <UserCircle className="h-7 w-7" />

                </Link>


                {/* Logout */}

                <button
                  onClick={handleLogout}
                  className="text-gray-600 d-flex  align-items-center hover:text-red-600 transition-colors cursor-pointer"
                  title="Logout" 
                >
                  
                  <LogOut className="h-5 w-5" />
                Logout
                </button>

              </div>

            ) : (

              /* =========================
                  Logged Out
              ========================= */

              <Link
                className="flex items-center space-x-2 bg-[#1b3b2b] hover:bg-emerald-950 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
                to="/login"
              >

                <User className="h-4 w-4" />

                <span>
                  Login / Register
                </span>

              </Link>

            )}

          </div>

        </div>

      </div>

    </header>
  );
}