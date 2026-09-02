import { Navigate, Routes, Route } from "react-router-dom";

import Home from "./Pages/Home";
import Register from "./Pages/Register";
import Login from "./Pages/Login";

import AdminDashboard from "./Pages/admin/AdminDashboard";
import Books from "./Pages/admin/Books";
import LibraryManagement from "./Pages/admin/LibraryManagement";
import EventManager from "./Pages/admin/EventManager";
import AdminStoryPoetry from "./Pages/admin/AdminPoetry";
import AdminStoryPoetryDetails from "./Pages/admin/AdminStoryPoetryDetails";
import AdminCertificate from "./Pages/admin/AdminCertificates";
import BookOrders from "./Pages/admin/BookOrders";

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

import ProtectedRoute from "./Components/ProtectedRoute";
import AdminRoute from "./Components/AdminRoute";
import ScrollToTop from "./Components/ScrollToTop";
import SessionExpiryHandler from "./Components/SessionExpiryHandler";

import AdminLayout from "./Pages/admin/AdminLayout";


// ======================================================
// ADMIN / EDITOR PAGE ACCESS
// ======================================================

function AdminPageRoute({ children, allowedRoles }) {
  const role = localStorage.getItem("role");

  // User has permission for this page
  if (allowedRoles.includes(role)) {
    return children;
  }

  // Editor trying to access an Admin-only page
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
      <ScrollToTop />

      <SessionExpiryHandler />

      <Routes>

        {/* =================================================
            PUBLIC ROUTES
        ================================================= */}

        <Route path="/" element={<Home />} />

        <Route path="/register" element={<Register />} />

        <Route path="/login" element={<Login />} />

        <Route path="/all/books" element={<BookList />} />

        <Route path="/book/:id" element={<BookDetail />} />

        <Route path="/category/:id" element={<CategoryBooks />} />

        <Route path="/about" element={<About />} />

        <Route path="/book/upload" element={<UploadPoetry />} />

        <Route path="/events" element={<Events />} />

        <Route
          path="/events/:id"
          element={<EventRegistration />}
        />

        <Route
          path="/my/registrations"
          element={<MyRegistrations />}
        />

        <Route path="/cart" element={<Cart />} />

        <Route path="/orders" element={<MyOrders />} />

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
              <AdminPageRoute allowedRoles={["Admin", "Editor"]}>
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
              <AdminPageRoute allowedRoles={["Admin", "Editor"]}>
                <AdminStoryPoetryDetails />
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