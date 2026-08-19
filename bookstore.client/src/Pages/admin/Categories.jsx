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
        token,
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
        token,
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
    <div className="w-full">
      {/* ================= HEADER ================= */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Categories
          </h2>

          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Manage your bookstore categories
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="
          inline-flex
          items-center
          justify-center
          gap-2
          px-5
          py-2.5
          bg-gray-900
          hover:bg-gray-800
          text-white
          rounded-xl
          font-semibold
          text-sm
          transition-all
          duration-200
          shadow-sm
          hover:shadow-md
          active:scale-95
          w-full
          sm:w-auto
        "
        >
          <span className="text-lg leading-none">+</span>
          Add Category
        </button>
      </div>

      {/* ================= SUCCESS MESSAGE ================= */}

      {success && (
        <div
          className="
        mb-5
        flex
        items-center
        gap-3
        px-4
        py-3
        rounded-xl
        border
        border-green-200
        bg-green-50
        text-green-700
        text-sm
        font-medium
      "
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
            ✓
          </span>

          {success}
        </div>
      )}

      {/* ================= ERROR MESSAGE ================= */}

      {error && !showAddModal && !showEditModal && (
        <div
          className="
        mb-5
        flex
        items-center
        gap-3
        px-4
        py-3
        rounded-xl
        border
        border-red-200
        bg-red-50
        text-red-700
        text-sm
        font-medium
      "
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100">
            !
          </span>

          {error}
        </div>
      )}

      {/* ================= CATEGORY TABLE ================= */}

      <div
        className="
      bg-white
      rounded-2xl
      border
      border-gray-200
      shadow-sm
      overflow-hidden
    "
      >
        {loading ? (
          /* Loading */

          <div className="flex flex-col items-center justify-center py-20">
            <div
              className="
            w-10
            h-10
            border-4
            border-gray-200
            border-t-gray-900
            rounded-full
            animate-spin
          "
            />

            <p className="mt-4 text-sm text-gray-500">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          /* Empty State */

          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div
              className="
            w-16
            h-16
            rounded-2xl
            bg-gray-100
            flex
            items-center
            justify-center
            text-3xl
            mb-4
          "
            >
              📂
            </div>

            <h5 className="text-lg font-bold text-gray-900">
              No categories found
            </h5>

            <p className="text-sm text-gray-500 mt-1 mb-5">
              Add your first bookstore category.
            </p>

            <button
              onClick={openAddModal}
              className="
              px-5
              py-2.5
              bg-gray-900
              hover:bg-gray-800
              text-white
              rounded-xl
              text-sm
              font-semibold
              transition
              active:scale-95
            "
            >
              + Add Category
            </button>
          </div>
        ) : (
          /* Category List */

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th
                    className="
                  px-5
                  py-4
                  text-left
                  font-semibold
                  text-gray-500
                  whitespace-nowrap
                "
                  >
                    #
                  </th>

                  <th
                    className="
                  px-5
                  py-4
                  text-left
                  font-semibold
                  text-gray-500
                  whitespace-nowrap
                "
                  >
                    Category
                  </th>

                  <th
                    className="
                  px-5
                  py-4
                  text-left
                  font-semibold
                  text-gray-500
                  whitespace-nowrap
                "
                  >
                    Description
                  </th>


                  <th
                    className="
                  px-5
                  py-4
                  text-right
                  font-semibold
                  text-gray-500
                  whitespace-nowrap
                "
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {categories.map((category, index) => (
                  <tr
                    key={category.categoryId}
                    className="
                    hover:bg-gray-50/70
                    transition-colors
                  "
                  >
                    {/* Number */}

                    <td className="px-5 py-4 text-gray-400 font-medium">
                      {index + 1}
                    </td>

                    {/* Category Name */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="
                        w-9
                        h-9
                        rounded-lg
                        bg-gray-100
                        flex
                        items-center
                        justify-center
                        shrink-0
                      "
                        >
                          📂
                        </div>

                        <span className="font-semibold text-gray-900">
                          {category.categoryName}
                        </span>
                      </div>
                    </td>

                    {/* Description */}

                    <td className="px-5 py-4 max-w-sm">
                      <p className="text-gray-500 line-clamp-2">
                        {category.description || "No description"}
                      </p>
                    </td>
                    

                   


                    {/* Actions */}

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="
                          px-3
                          py-1.5
                          rounded-lg
                          border
                          border-gray-200
                          bg-white
                          text-gray-700
                          text-xs
                          font-semibold
                          hover:bg-gray-900
                          hover:text-white
                          hover:border-gray-900
                          transition-all
                        "
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => openDeleteModal(category)}
                          className="
                          px-3
                          py-1.5
                          rounded-lg
                          border
                          border-red-200
                          bg-white
                          text-red-600
                          text-xs
                          font-semibold
                          hover:bg-red-600
                          hover:text-white
                          hover:border-red-600
                          transition-all
                        "
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================================================= */}
      {/* ADD CATEGORY MODAL */}
      {/* ================================================= */}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Add Category
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Create a new bookstore category
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreate}>
              <div className="px-6 py-5">
                {/* Error */}
                {error && (
                  <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* Category Name */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Category Name
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Fiction"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    maxLength={100}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Description
                    <span className="text-gray-400 font-normal ml-1">
                      (optional)
                    </span>
                  </label>

                  <textarea
                    rows={3}
                    placeholder="Briefly describe this category..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={500}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none resize-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition"
                  />

                  <div className="text-right text-xs text-gray-400 mt-1">
                    {description.length}/500
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition cursor-pointer"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* EDIT CATEGORY MODAL */}
      {/* ================================================= */}

     {showEditModal && selectedCategory && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden max-h-[85vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h3 className="text-base font-bold text-gray-900">
            Edit Category
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Update category information
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowEditModal(false)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleUpdate}>
        <div className="px-5 py-4 space-y-4">
          {error && (
            <div className="px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Category Name
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              maxLength={100}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none transition focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-700">
                Description
              </label>
              <span className="text-xs text-gray-400">
                {description.length}/500
              </span>
            </div>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none resize-none transition focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
            <div>
              <p className="text-xs font-semibold text-gray-900">
                Category Status
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Enable or disable this category
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
                isActive ? "bg-gray-900" : "bg-gray-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 mt-0.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  isActive ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-5 py-3 bg-gray-50 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setShowEditModal(false)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-xs font-semibold hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold transition active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {/* ================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ================================================= */}

      {showDeleteModal && selectedCategory && (
        <div
          className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          bg-black/50
          backdrop-blur-sm
          p-4
        "
        >
          <div
            className="
          w-full
          max-w-md
          bg-white
          rounded-2xl
          shadow-2xl
          overflow-hidden
        "
          >
            {/* Header */}

            <div
              className="
            flex
            items-center
            justify-between
            px-6
            py-5
            border-b
            border-gray-100
          "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                w-10
                h-10
                rounded-xl
                bg-red-50
                text-red-600
                flex
                items-center
                justify-center
                text-lg
              "
                >
                  !
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Delete Category
                  </h3>

                  <p className="text-xs text-gray-500">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="
                w-9
                h-9
                rounded-lg
                flex
                items-center
                justify-center
                text-gray-400
                hover:bg-gray-100
                hover:text-gray-700
                transition
              "
              >
                ✕
              </button>
            </div>

            {/* Body */}

            <div className="px-6 py-6">
              <p className="text-sm text-gray-600 leading-6">
                Are you sure you want to delete this category?
              </p>

              <div
                className="
              mt-4
              p-4
              rounded-xl
              bg-red-50
              border
              border-red-100
            "
              >
                <p className="text-sm font-bold text-red-800">
                  {selectedCategory.categoryName}
                </p>

                <p className="text-xs text-red-600 mt-1">
                  All associated category data may be affected.
                </p>
              </div>
            </div>

            {/* Footer */}

            <div
              className="
            flex
            flex-col-reverse
            sm:flex-row
            sm:justify-end
            gap-2
            px-6
            py-4
            bg-gray-50
            border-t
            border-gray-100
          "
            >
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="
                w-full
                sm:w-auto
                px-5
                py-2.5
                rounded-xl
                border
                border-gray-200
                bg-white
                text-gray-700
                text-sm
                font-semibold
                hover:bg-gray-100
                transition
              "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="
                w-full
                sm:w-auto
                px-5
                py-2.5
                rounded-xl
                bg-red-600
                hover:bg-red-700
                text-white
                text-sm
                font-semibold
                transition
                active:scale-95
              "
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories;
