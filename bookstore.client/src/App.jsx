import { Navigate, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// ======================================================
// PUBLIC PAGES
// ======================================================

import Home from "./Pages/Home";
import Register from "./Pages/Register";
import Login from "./Pages/Login";

import BookList from "./Pages/BookList";
import BookDetail from "./Pages/BookDetails";
import Checkout from "./Pages/Checkout";
import UploadPoetry from "./Pages/UploadPoetry";
import EventRegistration from "./Pages/EventRegistration";
import About from "./Pages/About";
import Profile from "./Pages/Profile";
import Events from "./Pages/Events";
import CategoryBooks from "./Pages/CategoryBooks";
import MyRegistrations from "./Pages/MyRegistrations";
import Cart from "./Pages/cart";
import MyOrders from "./Pages/Orders";
import OrderSuccess from "./Pages/OrderSuccess";
import YourUploads from "./Pages/YourUploads";

// ======================================================
// PASSWORD RESET
// ======================================================

import ForgotPassword from "./Pages/ForgotPassword";
import VerifyResetOtp from "./Pages/VerifyResetOtp";
import ResetPassword from "./Pages/ResetPassword";

// ======================================================
// ADMIN PAGES
// ======================================================

import AdminDashboard from "./Pages/admin/AdminDashboard";
import Books from "./Pages/admin/Books";
import LibraryManagement from "./Pages/admin/LibraryManagement";
import EventManager from "./Pages/admin/EventManager";
import AdminStoryPoetry from "./Pages/admin/AdminPoetry";
import AdminStoryPoetryDetails from "./Pages/admin/AdminStoryPoetryDetails";
import AdminCertificate from "./Pages/admin/AdminCertificates";
import BookOrders from "./Pages/admin/BookOrders";
import PromotionBanners from "./Pages/admin/PromotionBanners";
import AdminLayout from "./Pages/admin/AdminLayout";

// ======================================================
// ROUTE PROTECTION
// ======================================================

import ProtectedRoute from "./Components/ProtectedRoute";
import AdminRoute from "./Components/AdminRoute";

// ======================================================
// GLOBAL COMPONENTS
// ======================================================

import ScrollToTop from "./Components/ScrollToTop";
import SessionExpiryHandler from "./Components/SessionExpiryHandler";

// ======================================================
// ADMIN / EDITOR PAGE ACCESS
// ======================================================

function AdminPageRoute({ children, allowedRoles }) {
  const role = localStorage.getItem("role");

  // User has permission
  if (allowedRoles.includes(role)) {
    return children;
  }

  // Editor trying to access Admin-only page
  if (role === "Editor") {
    return <Navigate to="/admin/story" replace />;
  }

  // Any other unauthorized role
  return <Navigate to="/" replace />;
}

// ======================================================
// APP
// ======================================================

function App() {
  return (
    <>
      {/* =================================================
          GLOBAL TOASTER
      ================================================= */}

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2500,
        }}
      />

      {/* =================================================
          GLOBAL COMPONENTS
      ================================================= */}

      <ScrollToTop />

      <SessionExpiryHandler />

      {/* =================================================
          ROUTES
      ================================================= */}

      <Routes>
        {/* =================================================
            PUBLIC ROUTES
        ================================================= */}

        <Route path="/" element={<Home />} />

        <Route path="/register" element={<Register />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/verify-reset-otp"
          element={<VerifyResetOtp />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* =================================================
            BOOK ROUTES
        ================================================= */}

        <Route
          path="/all/books"
          element={<BookList />}
        />

        <Route
          path="/book/:id"
          element={<BookDetail />}
        />

        <Route
          path="/category/:id"
          element={<CategoryBooks />}
        />

        {/* =================================================
            ABOUT
        ================================================= */}

        <Route
          path="/about"
          element={<About />}
        />

        {/* =================================================
            STORY / POETRY UPLOAD
        ================================================= */}

        <Route
          path="/book/upload"
          element={<UploadPoetry />}
        />

        {/* =================================================
            EVENTS
        ================================================= */}

        <Route
          path="/events"
          element={<Events />}
        />

        <Route
          path="/events/:id"
          element={<EventRegistration />}
        />

        {/* =================================================
            USER ROUTES
        ================================================= */}

        <Route
          path="/my/registrations"
          element={<MyRegistrations />}
        />

        <Route
          path="/cart"
          element={<Cart />}
        />

        <Route
          path="/orders"
          element={<MyOrders />}
        />

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        <Route
          path="/order-success/:orderId"
          element={<OrderSuccess />}
        />

        {/* =================================================
            AUTHENTICATED USER ROUTES
        ================================================= */}

        <Route element={<ProtectedRoute />}>
          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/your/uploads"
            element={<YourUploads />}
          />
        </Route>

        {/* =================================================
            ADMIN / EDITOR ROUTES
        ================================================= */}

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          {/* =================================================
              ADMIN DASHBOARD
              ADMIN ONLY
          ================================================= */}

          <Route
            index
            element={
              <AdminPageRoute allowedRoles={["Admin"]}>
                <AdminDashboard />
              </AdminPageRoute>
            }
          />

          {/* =================================================
              BOOKS
              ADMIN ONLY
          ================================================= */}

          <Route
            path="books"
            element={
              <AdminPageRoute allowedRoles={["Admin"]}>
                <Books />
              </AdminPageRoute>
            }
          />

          {/* =================================================
              ORDERS
              ADMIN ONLY
          ================================================= */}

          <Route
            path="orders"
            element={
              <AdminPageRoute allowedRoles={["Admin"]}>
                <BookOrders />
              </AdminPageRoute>
            }
          />

          {/* =================================================
              LIBRARY MANAGEMENT
              ADMIN ONLY
          ================================================= */}

          <Route
            path="library"
            element={
              <AdminPageRoute allowedRoles={["Admin"]}>
                <LibraryManagement />
              </AdminPageRoute>
            }
          />

          {/* =================================================
              EVENTS
              ADMIN ONLY
          ================================================= */}

          <Route
            path="events"
            element={
              <AdminPageRoute allowedRoles={["Admin"]}>
                <EventManager />
              </AdminPageRoute>
            }
          />

          {/* =================================================
              STORY & POETRY
              ADMIN + EDITOR
          ================================================= */}

          <Route
            path="story"
            element={
              <AdminPageRoute
                allowedRoles={["Admin", "Editor"]}
              >
                <AdminStoryPoetry />
              </AdminPageRoute>
            }
          />

          {/* =================================================
              STORY & POETRY DETAILS
              ADMIN + EDITOR
          ================================================= */}

          <Route
            path="story/:id"
            element={
              <AdminPageRoute
                allowedRoles={["Admin", "Editor"]}
              >
                <AdminStoryPoetryDetails />
              </AdminPageRoute>
            }
          />

          {/* =================================================
              PROMOTION BANNERS
              ADMIN ONLY
          ================================================= */}

          <Route
            path="promotion/banners"
            element={
              <AdminPageRoute allowedRoles={["Admin"]}>
                <PromotionBanners />
              </AdminPageRoute>
            }
          />

          {/* =================================================
              CERTIFICATES
              ADMIN ONLY
          ================================================= */}

          <Route
            path="certificates"
            element={
              <AdminPageRoute allowedRoles={["Admin"]}>
                <AdminCertificate />
              </AdminPageRoute>
            }
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;