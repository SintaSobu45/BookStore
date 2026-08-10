import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Home from './Pages/Home'
import Register from './Pages/Register'
import Login from './Pages/Login'
import AdminDashboard from './Pages/admin/AdminDashboard'
import Authors from './Pages/admin/Author'
import Books from './Pages/admin/Books'
import Categories from './Pages/admin/Categories'
import Publishers from './Pages/admin/Publishers'
import BookList from './Pages/BookList'
import BookDetail from './Pages/BookDetails'
import Checkout from './Pages/Checkout'
import UploadPoetry from './Pages/UploadPoetry'
import EventRegistration from './Pages/EventRegistration'
import About from './Pages/About'
import Profile from './Pages/Profile'

import ProtectedRoute from './Components/ProtectedRoute'
import AdminRoute from './Components/AdminRoute';
import Events from './Pages/Events'
import CategoryBooks from './Pages/CategoryBooks'
import ScrollToTop from './Components/ScrollToTop'
import AdminLayout from './Pages/admin/AdminLayout'
import LibraryManagement from './Pages/admin/LibraryManagement'
import EventManager from './Pages/admin/EventManager'
import AdminStoryPoetry from './Pages/admin/AdminPoetry'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>

      <ScrollToTop />
      <Routes>

        {/* =========================
                    PUBLIC ROUTES
                ========================= */}

        <Route path="/" element={<Home />} />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

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

        <Route
          path="/about"
          element={<About />}
        />


        {/* =========================
                    AUTHENTICATED USER ROUTES
                ========================= */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/checkout"
            element={<Checkout />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/book/upload"
            element={<UploadPoetry />}
          />

          <Route path='/events' element={<Events />} />

          <Route
            path="/events/:id"
            element={<EventRegistration />}
          />

        </Route>


      {/* =========================
    ADMIN ROUTES
========================= */}

<Route
    path="/admin"
    element={
        <AdminRoute>
            <AdminLayout />
        </AdminRoute>
    }
>


    {/* Dashboard */}
    <Route
        index
        element={<AdminDashboard />}
    />



    {/* Books */}
    <Route
        path="books"
        element={<Books />}
    />



    {/* Library Management */}
    <Route
        path="library"
        element={<LibraryManagement/>}
    />

    {/* Admin Events */}
    <Route
        path="/admin/events"
        element={<EventManager/>}
    />

    {/* Admin Events */}
    <Route
        path="/admin/story"
        element={<AdminStoryPoetry/>}
    />


</Route>

      </Routes>
    </>
  )
}

export default App
