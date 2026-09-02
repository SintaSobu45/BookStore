import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  BookOpen,
  Library,
  CalendarDays,
  LogOut,
  Paperclip,
} from "lucide-react";
import logo from "../../assets/logo.png";

function AdminLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = localStorage.getItem("role");
  const isEditor = role === "Editor";

  const homePath = isEditor ? "/admin/story" : "/admin";

  const handleLogout = (e) => {
    e.preventDefault();

    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("fullName");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("tokenExpiry");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const handleNavigation = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* =========================
          Mobile Header
      ========================= */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-white shadow flex items-center justify-between px-4">
        <Link
          to={homePath}
          className="flex items-center cursor-pointer overflow-visible"
        >
          <img
            src={logo}
            alt="The Old Library"
            className="h-16 w-auto object-contain -my-3 scale-110"
          />
        </Link>

        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-gray-800" />
        </button>
      </header>

      {/* =========================
          Mobile Overlay
      ========================= */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* =========================
          Sidebar
      ========================= */}
      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          h-screen
          w-64
          bg-gray-900
          text-white
          p-6
          transform
          transition-transform
          duration-300
          ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          md:z-30
        `}
      >
        {/* Sidebar Header with Logo */}
        <div className="flex items-center justify-center mb-8">
          <Link
            to={homePath}
            onClick={handleNavigation}
            className="w-full h-16 overflow-hidden flex items-center justify-center"
          >
            <img
              src={logo}
              alt="The Old Library"
              className="w-full h-full object-cover bg-white rounded-2"
            />
          </Link>

          {/* Mobile Close Button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 rounded-lg transition text-stone-400 hover:text-white cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* =========================
            Navigation
        ========================= */}
        <nav className="space-y-3">
          {/* Admin-only navigation */}
          {!isEditor && (
            <>
              <Link
                to="/admin"
                onClick={handleNavigation}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/admin/books"
                onClick={handleNavigation}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition"
              >
                <BookOpen className="w-5 h-5" />
                <span>Books</span>
              </Link>

              <Link
                to="/admin/library"
                onClick={handleNavigation}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition"
              >
                <Library className="w-5 h-5" />
                <span>Library Management</span>
              </Link>

              <Link
                to="/admin/events"
                onClick={handleNavigation}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition"
              >
                <CalendarDays className="w-5 h-5" />
                <span>Events</span>
              </Link>
            </>
          )}

          {/* Story & Poetry - Admin + Editor */}
          <Link
            to="/admin/story"
            onClick={handleNavigation}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition"
          >
            <CalendarDays className="w-5 h-5" />
            <span>Story & Poetry</span>
          </Link>

          {/* Admin-only navigation */}
          {!isEditor && (
            <Link
              to="/admin/certificates"
              onClick={handleNavigation}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition"
            >
              <Paperclip className="w-5 h-5" />
              <span>Certificates</span>
            </Link>
          )}
        </nav>

        {/* =========================
            Logout
        ========================= */}
        <button
          onClick={handleLogout}
          className="mt-10 w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 py-3 rounded-lg transition cursor-pointer font-bold"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </aside>

      {/* =========================
          Main Area
      ========================= */}
      <div className="md:ml-64">
        {/* Desktop Navbar */}
        <header className="hidden md:flex h-16 bg-white shadow items-center justify-between px-6">
          <h1 className="font-semibold text-gray-900">
            {isEditor ? "Story & Poetry" : "Admin Dashboard"}
          </h1>

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">
              {isEditor ? "E" : "A"}
            </div>

            <span className="font-medium">
              {isEditor ? "Editor" : "Admin"}
            </span>
          </div>
        </header>

        {/* Mobile spacing + Page Content */}
        <main className="pt-16 md:pt-0 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;