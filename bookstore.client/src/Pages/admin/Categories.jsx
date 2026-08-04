import React, { useEffect, useState } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/categoryService";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);

  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Get token
  const token = localStorage.getItem("token");

  // =========================
  // FETCH CATEGORIES
  // =========================
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError("Failed to load categories.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // =========================
  // OPEN ADD MODAL
  // =========================
  const openAddModal = () => {
    setCategoryName("");
    setDescription("");
    setIsActive(true);
    setError("");
    setShowAddModal(true);
  };

  // =========================
  // OPEN EDIT MODAL
  // =========================
  const openEditModal = (category) => {
    setSelectedCategory(category);

    setCategoryName(category.categoryName);
    setDescription(category.description || "");
    setIsActive(category.isActive);

    setError("");
    setShowEditModal(true);
  };

  // =========================
  // OPEN DELETE MODAL
  // =========================
  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  // =========================
  // CREATE CATEGORY
  // =========================
  const handleCreate = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      setError("Category name is required.");
      return;
    }

    try {
      setError("");

      await createCategory(
        {
          categoryName: categoryName.trim(),
          description: description.trim() || null,
        },
        token
      );

      setShowAddModal(false);

      setSuccess("Category created successfully.");

      await fetchCategories();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError("Failed to create category.");
      console.error(err);
    }
  };

  // =========================
  // UPDATE CATEGORY
  // =========================
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      setError("Category name is required.");
      return;
    }

    try {
      setError("");

      await updateCategory(
        selectedCategory.categoryId,
        {
          categoryName: categoryName.trim(),
          description: description.trim() || null,
          isActive: isActive,
        },
        token
      );

      setShowEditModal(false);

      setSuccess("Category updated successfully.");

      await fetchCategories();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError("Failed to update category.");
      console.error(err);
    }
  };

  // =========================
  // DELETE CATEGORY
  // =========================
  const handleDelete = async () => {
    try {
      setError("");

      await deleteCategory(selectedCategory.categoryId, token);

      setShowDeleteModal(false);
      setSelectedCategory(null);

      setSuccess("Category deleted successfully.");

      await fetchCategories();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError("Failed to delete category.");
      console.error(err);
    }
  };

  return (
    <div className="container-fluid p-4">

      {/* ================= HEADER ================= */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Categories</h2>
          <p className="text-muted mb-0">
            Manage your bookstore categories
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={openAddModal}
        >
          + Add Category
        </button>
      </div>

      {/* ================= SUCCESS MESSAGE ================= */}
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* ================= ERROR MESSAGE ================= */}
      {error && !showAddModal && !showEditModal && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* ================= CATEGORY TABLE ================= */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">

          {loading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary"
                role="status"
              ></div>

              <p className="mt-3 text-muted">
                Loading categories...
              </p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-5">
              <h5>No categories found</h5>

              <p className="text-muted">
                Add your first bookstore category.
              </p>

              <button
                className="btn btn-primary"
                onClick={openAddModal}
              >
                + Add Category
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Category Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Created Date</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map((category, index) => (
                    <tr key={category.categoryId}>

                      <td>
                        {index + 1}
                      </td>

                      <td>
                        <span className="fw-semibold">
                          {category.categoryName}
                        </span>
                      </td>

                      <td>
                        <span className="text-muted">
                          {category.description || "No description"}
                        </span>
                      </td>

                      <td>
                        {category.isActive ? (
                          <span className="badge bg-success">
                            Active
                          </span>
                        ) : (
                          <span className="badge bg-secondary">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td>
                        {new Date(
                          category.createdDate
                        ).toLocaleDateString()}
                      </td>

                      <td className="text-end">

                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => openEditModal(category)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => openDeleteModal(category)}
                        >
                          Delete
                        </button>

                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </div>
      </div>

      {/* ================================================= */}
      {/* ADD CATEGORY MODAL */}
      {/* ================================================= */}

      {showAddModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">

            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  Add Category
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>

              <form onSubmit={handleCreate}>

                <div className="modal-body">

                  {error && (
                    <div className="alert alert-danger">
                      {error}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Category Name
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter category name"
                      value={categoryName}
                      onChange={(e) =>
                        setCategoryName(e.target.value)
                      }
                      maxLength={100}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Description
                    </label>

                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Enter category description"
                      value={description}
                      onChange={(e) =>
                        setDescription(e.target.value)
                      }
                      maxLength={500}
                    ></textarea>
                  </div>

                </div>

                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Create Category
                  </button>

                </div>

              </form>

            </div>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* EDIT CATEGORY MODAL */}
      {/* ================================================= */}

      {showEditModal && selectedCategory && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">

            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  Edit Category
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>

              <form onSubmit={handleUpdate}>

                <div className="modal-body">

                  {error && (
                    <div className="alert alert-danger">
                      {error}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Category Name
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={categoryName}
                      onChange={(e) =>
                        setCategoryName(e.target.value)
                      }
                      maxLength={100}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Description
                    </label>

                    <textarea
                      className="form-control"
                      rows="4"
                      value={description}
                      onChange={(e) =>
                        setDescription(e.target.value)
                      }
                      maxLength={500}
                    ></textarea>
                  </div>

                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="categoryStatus"
                      checked={isActive}
                      onChange={(e) =>
                        setIsActive(e.target.checked)
                      }
                    />

                    <label
                      className="form-check-label"
                      htmlFor="categoryStatus"
                    >
                      Active
                    </label>
                  </div>

                </div>

                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Save Changes
                  </button>

                </div>

              </form>

            </div>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ================================================= */}

      {showDeleteModal && selectedCategory && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">

            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  Delete Category
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>

              <div className="modal-body">

                <p className="mb-2">
                  Are you sure you want to delete this category?
                </p>

                <div className="alert alert-warning mb-0">
                  <strong>
                    {selectedCategory.categoryName}
                  </strong>
                  <br />
                  This action cannot be undone.
                </div>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                >
                  Delete Category
                </button>

              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Categories;