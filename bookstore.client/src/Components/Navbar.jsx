import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  BookOpen,
  ShoppingCart,
  User,
  LogOut,
  UserCircle,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Package,
  ClipboardList,
} from "lucide-react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { getProfile } from "../services/profileService";
import { getCart } from "../services/cartService";
import logo from "../assets/logo.png";

export default function Navbar() {
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  const dropdownRef = useRef(null);

  // AUTH
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const userName =
    localStorage.getItem("fullName") ||
    storedUser?.fullName ||
    storedUser?.name ||
    "User";

  const userInitial = userName ? userName.charAt(0).toUpperCase() : "U";

  // TOGGLE & CLOSE DROPDOWN
  const toggleProfileDropdown = () => {
    setProfileDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("fullName");

    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);

    navigate("/login");
  };

  // CLOSE MOBILE NAV
  const handleMobileNavigation = () => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  // LOAD CART COUNT
  const loadCartCount = useCallback(async () => {
    try {
      const currentToken = localStorage.getItem("token");
      const guestCartId = localStorage.getItem("guestCartId");

      const cart = await getCart(currentToken, guestCartId);
      setCartCount(cart?.totalItems || 0);
    } catch (error) {
      console.error("Failed to load cart count:", error);
      setCartCount(0);
    }
  }, []);

  // LOAD PROFILE
  useEffect(() => {
    const loadProfile = async () => {
      if (!isLoggedIn) {
        setProfile(null);
        return;
      }

      try {
        const data = await getProfile();
        setProfile(data);
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };

    loadProfile();
  }, [isLoggedIn]);

  // CART COUNT LISTENERS
  useEffect(() => {
    loadCartCount();

    const handleCartUpdated = () => loadCartCount();
    const handleWindowFocus = () => loadCartCount();

    window.addEventListener("cartUpdated", handleCartUpdated);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdated);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [loadCartCount]);

  const navLinks = [
    { name: "Home", path: "/", end: true },
    { name: "Books", path: "/all/books" },
    { name: "Poetry & Stories", path: "/book/upload" },
    { name: "Events", path: "/events" },
    { name: "About Us", path: "/about" },
  ];

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 md:h-20 flex items-center justify-between">
          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden flex items-center justify-center text-gray-700 hover:text-emerald-700 transition-colors mr-3"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* LOGO */}
          <Link
            to="/"
            onClick={handleMobileNavigation}
            className="flex items-center justify-center cursor-pointer overflow-visible"
          >
            <img
              src={logo}
              alt="The Old Library"
              className="h-20 sm:h-24 md:h-28 w-auto object-contain -my-6 scale-125"
            />
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                className={({ isActive }) =>
                  `relative py-2 flex items-center transition-colors ${
                    isActive
                      ? "text-[#1b3b2b] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#1b3b2b]"
                      : "text-gray-600 hover:text-emerald-700 font-medium"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* RIGHT SIDE ACTIONS */}
          <div className="flex items-center space-x-3 md:space-x-6">
            {/* CART */}
            <Link
              className="relative cursor-pointer text-gray-700 hover:text-emerald-700 transition-colors"
              to="/cart"
              aria-label={`Shopping cart with ${cartCount} items`}
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-emerald-700 text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* DESKTOP PROFILE */}
            <div className="hidden md:block relative" ref={dropdownRef}>
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={toggleProfileDropdown}
                    className="flex items-center gap-2.5 rounded-full hover:bg-gray-50 px-2 py-1.5 transition-colors cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-[#1b3b2b] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      {profile?.profileImageUrl ? (
                        <img
                          src={profile.profileImageUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        userInitial
                      )}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-semibold text-gray-800 leading-tight max-w-[120px] truncate">
                        {userName}
                      </p>
                      <p className="text-[11px] text-gray-400">My Account</p>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                        profileDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[100]">
                      <div className="px-4 py-4 bg-gray-50 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full overflow-hidden bg-[#1b3b2b] text-white flex items-center justify-center font-bold shadow-sm">
                            {profile?.profileImageUrl ? (
                              <img
                                src={profile.profileImageUrl}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              userInitial
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {userName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {profile?.email ||
                                storedUser?.email ||
                                "Welcome back!"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="py-2">
                        <Link
                          to="/profile"
                          onClick={handleMobileNavigation}
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <UserCircle className="h-5 w-5 text-emerald-700" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">My Profile</p>
                            <p className="text-xs text-gray-400">View your profile</p>
                          </div>
                        </Link>

                        <Link
                          to="/orders"
                          onClick={handleMobileNavigation}
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Package className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">My Orders</p>
                            <p className="text-xs text-gray-400">View your orders</p>
                          </div>
                        </Link>

                        <Link
                          to="/my/registrations"
                          onClick={handleMobileNavigation}
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                            <ClipboardList className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">My Registrations</p>
                            <p className="text-xs text-gray-400">
                              View your event registrations
                            </p>
                          </div>
                        </Link>

                        <Link
                          to="/cart"
                          onClick={handleMobileNavigation}
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
                            <ShoppingCart className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">My Cart</p>
                            <p className="text-xs text-gray-400">
                              View your shopping cart
                            </p>
                          </div>
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 p-2">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                            <LogOut className="h-5 w-5" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium">Logout</p>
                            <p className="text-xs text-red-400">
                              Sign out of your account
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  className="flex items-center space-x-2 bg-[#1b3b2b] hover:bg-emerald-950 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
                  to="/login"
                >
                  <User className="h-4 w-4" />
                  <span>Login / Register</span>
                </Link>
              )}
            </div>

            {/* MOBILE PROFILE LINK */}
            <div className="md:hidden">
              {isLoggedIn ? (
                <Link
                  to="/profile"
                  onClick={handleMobileNavigation}
                  title={userName || "Profile"}
                  className="w-9 h-9 rounded-full overflow-hidden bg-[#1b3b2b] text-white flex items-center justify-center font-bold text-sm hover:bg-emerald-950 transition-colors shadow-sm"
                >
                  {profile?.profileImageUrl ? (
                    <img
                      src={profile.profileImageUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    userInitial
                  )}
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={handleMobileNavigation}
                  className="text-gray-700 hover:text-emerald-700"
                >
                  <User className="h-6 w-6" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="absolute left-0 top-0 bottom-0 w-[82%] max-w-sm bg-white shadow-2xl overflow-y-auto">
            <div className="bg-[#1b3b2b] text-white px-5 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 rounded-full p-2">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-lg">BOOK STORE</p>
                  <p className="text-xs text-white/70">Malayalam Books</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white hover:bg-white/10 rounded-full p-2"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="px-5 py-4 bg-gray-50 border-b">
              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  {profile?.profileImageUrl ? (
                    <img
                      src={profile.profileImageUrl}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <UserCircle className="h-5 w-5 text-gray-500" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">Welcome back!</p>
                    <Link
                      to="/profile"
                      onClick={handleMobileNavigation}
                      className="text-sm text-emerald-700 font-medium"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={handleMobileNavigation}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-2 rounded-full">
                      <User className="h-5 w-5 text-emerald-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Login / Register</p>
                      <p className="text-xs text-gray-500">Access your account</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </Link>
              )}
            </div>

            <nav className="py-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.end}
                  onClick={handleMobileNavigation}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-5 py-4 border-b border-gray-100 transition-colors ${
                      isActive
                        ? "bg-emerald-50 text-[#1b3b2b] font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  <span>{link.name}</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </NavLink>
              ))}

              <Link
                to="/cart"
                onClick={handleMobileNavigation}
                className="flex items-center justify-between px-5 py-4 border-b border-gray-100 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-5 w-5 text-gray-500" />
                  <span>My Cart</span>
                </div>
                <div className="flex items-center gap-2">
                  {cartCount > 0 && (
                    <span className="bg-emerald-700 text-white text-xs font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </Link>

              {isLoggedIn && (
                <>
                  <Link
                    to="/profile"
                    onClick={handleMobileNavigation}
                    className="flex items-center justify-between px-5 py-4 border-b border-gray-100 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <UserCircle className="h-5 w-5 text-gray-500" />
                      <span>My Profile</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>

                  <Link
                    to="/orders"
                    onClick={handleMobileNavigation}
                    className="flex items-center justify-between px-5 py-4 border-b border-gray-100 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-gray-500" />
                      <span>My Orders</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>

                  <Link
                    to="/my/registrations"
                    onClick={handleMobileNavigation}
                    className="flex items-center justify-between px-5 py-4 border-b border-gray-100 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <ClipboardList className="h-5 w-5 text-gray-500" />
                      <span>My Registrations</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>

                  <div className="px-5 py-4">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                        <LogOut className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm">Logout</p>
                        <p className="text-xs text-red-400">
                          Sign out of your account
                        </p>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}