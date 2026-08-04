import React from 'react'
import { Link } from 'react-router-dom'


function AdminDashboard() {
  return (
    <div className="min-vh-100 bg-light">

      {/* Top Navbar */}
      <nav className="navbar navbar-dark bg-dark px-4">
        <span className="navbar-brand fw-bold">
          Malayalam Book Store
        </span>

        <div className="text-white">
          Admin
        </div>
      </nav>

      <div className="container-fluid">
        <div className="row">

          {/* Sidebar */}
          <div className="col-md-3 col-lg-2 bg-dark min-vh-100 p-3">

            <h5 className="text-white mb-4">
              Admin Panel
            </h5>

            <div className="d-grid gap-2">

              <Link className='btn btn-secondary text-start' to={'/admin'}>
                Dashboard
              </Link>

              <Link className='btn btn-dark text-start' to={'/admin/books'}>
                Books
              </Link>

              <Link className='btn btn-dark text-start' to={'/admin/categories'}>
                Categories
              </Link>

              <Link className='btn btn-dark text-start' to={'/admin/publishers'}>
                Publishers
              </Link>

              <hr className="border-secondary" />

              <button className="btn btn-danger text-start">
                Logout
              </button>

            </div>

          </div>

          {/* Main Content */}
          <main className="col-md-9 col-lg-10 p-4">

            <div className="mb-4">
              <h2 className="fw-bold">
                Dashboard
              </h2>

              <p className="text-muted">
                Welcome to the admin panel.
              </p>
            </div>

            {/* Statistics */}
            <div className="row g-4 mb-4">

              {/* Books */}
              <div className="col-md-4">

                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">

                    <h6 className="text-muted">
                      Total Books
                    </h6>

                    <h2 className="fw-bold mb-0">
                      0
                    </h2>

                  </div>
                </div>

              </div>

              {/* Categories */}
              <div className="col-md-4">

                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">

                    <h6 className="text-muted">
                      Total Categories
                    </h6>

                    <h2 className="fw-bold mb-0">
                      0
                    </h2>

                  </div>
                </div>

              </div>

              {/* Publishers */}
              <div className="col-md-4">

                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">

                    <h6 className="text-muted">
                      Total Publishers
                    </h6>

                    <h2 className="fw-bold mb-0">
                      0
                    </h2>

                  </div>
                </div>

              </div>

            </div>

            {/* Quick Actions */}
            <div className="card border-0 shadow-sm">

              <div className="card-body">

                <h5 className="fw-bold mb-3">
                  Quick Actions
                </h5>

                <div className="d-flex gap-2 flex-wrap">

                  <button className="btn btn-dark">
                    Add Book
                  </button>

                  <button className="btn btn-outline-dark">
                    Add Category
                  </button>

                  <button className="btn btn-outline-dark">
                    Add Publisher
                  </button>

                </div>

              </div>

            </div>

          </main>

        </div>
      </div>

    </div>
  )
}

export default AdminDashboard