import React, { useEffect, useState } from "react";
import {
  getBooks,
  createBook,
  updateBook,
  deleteBook,
} from "../../services/bookService";
import { getAuthors } from "../../services/authorService";
import { getCategories } from "../../services/categoryService";
import { getPublishers } from "../../services/publisherService";

function Books() {
  // =========================
  // Books
  // =========================
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // Dropdown data
  // =========================
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [publishers, setPublishers] = useState([]);

  // =========================
  // Form & Modal State
  // =========================
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingBookId, setEditingBookId] = useState(null);
  const [modalBook, setModalBook] = useState(null);

  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    isbn: "",
    price: "",
    stockQuantity: "",
    discountPercentage: "",
    publishedDate: "",
    description: "",
    categoryId: "",
    authorId: "",
    publisherId: "",
    isActive: true,
    image: null,
  });

  // =========================
  // Load data
  // =========================
  useEffect(() => {
    loadBooks();
    loadAuthors();
    loadCategories();
    loadPublishers();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getBooks();
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAuthors = async () => {
    try {
      const data = await getAuthors();
      setAuthors(data);
    } catch (err) {
      console.error("Failed to load authors:", err);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const loadPublishers = async () => {
    try {
      const data = await getPublishers();
      setPublishers(data);
    } catch (err) {
      console.error("Failed to load publishers:", err);
    }
  };

  // =========================
  // Handle input
  // =========================
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      const file = files[0] || null;

      setFormData({
        ...formData,
        image: file,
      });

      // Show selected image preview
      if (file) {
        setImagePreview(URL.createObjectURL(file));
      } else {
        setImagePreview(null);
      }

      return;
    }

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // =========================
  // Reset form
  // =========================
  const resetForm = () => {
    setFormData({
      title: "",
      isbn: "",
      price: "",
      discountPercentage: "",
      publishedDate: "",
      description: "",
      categoryId: "",
      authorId: "",
      publisherId: "",
      isActive: true,
      image: null,
    });
    setEditingBookId(null);
    setEditMode(false);
    setImagePreview(null); 
    setShowForm(false);
  };

  // =========================
  // Helper: Build FormData
  // =========================
  const buildBookFormData = (data, isUpdate = false) => {
    const dataObj = new FormData();
    dataObj.append("Title", data.title);
    dataObj.append("ISBN", data.isbn || "");
    dataObj.append("Price", data.price);
    dataObj.append("StockQuantity", data.stockQuantity);

    dataObj.append(
      "DiscountPercentage",
      data.discountPercentage === "" ? "0" : data.discountPercentage,
    );

    if (data.publishedDate) {
      dataObj.append("PublishedDate", data.publishedDate);
    }

    dataObj.append("Description", data.description || "");
    dataObj.append("CategoryId", data.categoryId);
    dataObj.append("AuthorId", data.authorId);
    dataObj.append("PublisherId", data.publisherId);

    if (isUpdate) {
      dataObj.append("IsActive", data.isActive);
    }

    if (data.image) {
      dataObj.append("Image", data.image);
    }

    return dataObj;
  };

  // =========================
  // Create / Update
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (editMode) {
        const updateData = buildBookFormData(formData, true);
        await updateBook(editingBookId, updateData);
        setSuccess("Book updated successfully.");
      } else {
        const bookData = buildBookFormData(formData, false);
        await createBook(bookData);
        setSuccess("Book added successfully.");
      }

      resetForm();
      await loadBooks();
    } catch (err) {
      setError(err.message);
    }
  };

  // =========================
  // Edit
  // =========================
  const handleEdit = (book) => {
    setEditingBookId(book.bookId);
    setFormData({
      title: book.title || "",
      isbn: book.isbn || "",
      price: book.price ?? "",
      discountPercentage: book.discountPercentage ?? "",
      stockQuantity: book.stockQuantity ?? "",
      publishedDate: book.publishedDate ? book.publishedDate.split("T")[0] : "",
      description: book.description || "",
      categoryId: getIdValue(book.categoryId, categories, book.categoryName),
      authorId: getIdValue(book.authorId, authors, book.authorName),
      publisherId: getIdValue(book.publisherId, publishers, book.publisherName),
      isActive: book.isActive,
      image: null,
    });
    setImagePreview(book.imageUrl);
    setEditMode(true);
    setShowForm(true);
    setError("");
    setSuccess("");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // Delete
  // =========================
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this book?",
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");
      await deleteBook(id);
      setSuccess("Book deleted successfully.");
      await loadBooks();
    } catch (err) {
      setError(err.message);
    }
  };

  // =========================
  // Helper
  // =========================
  const getIdValue = (directId, list, name) => {
    if (directId !== undefined && directId !== null) {
      return directId;
    }

    const item = list.find(
      (x) =>
        x.name === name ||
        x.authorName === name ||
        x.categoryName === name ||
        x.publisherName === name,
    );

    if (!item) {
      return "";
    }

    return item.id || item.authorId || item.categoryId || item.publisherId;
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Books
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and organize the books in your bookstore.
          </p>
        </div>

        <button
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setEditMode(false);
              setEditingBookId(null);
               setImagePreview(null);
              setShowForm(true);
            }
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
        >
          {showForm ? "Close" : "+ Add Book"}
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          <span className="font-medium">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">
          <span className="font-medium">{success}</span>
        </div>
      )}

      {/* Add / Edit Book Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">
              {editMode ? "Edit Book" : "Add New Book"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {editMode
                ? "Update the book information below."
                : "Enter the details of the new book."}
            </p>
          </div>

          <div className="p-5 sm:p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Book Title */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Book Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Enter book title"
                    value={formData.title}
                    onChange={handleChange}
                    maxLength={200}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>

                {/* ISBN */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ISBN
                  </label>
                  <input
                    type="text"
                    name="isbn"
                    placeholder="Enter ISBN"
                    value={formData.isbn}
                    onChange={handleChange}
                    maxLength={20}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>

                {/* Published Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Published Date
                  </label>
                  <input
                    type="date"
                    name="publishedDate"
                    value={formData.publishedDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none transition-all focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      name="price"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                      className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                    />
                  </div>
                </div>

                {/* Discount Percentage */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Discount Percentage
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      name="discountPercentage"
                      placeholder="0"
                      value={formData.discountPercentage}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      %
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 mt-2">
                    Enter 0 if there is no discount.
                  </p>
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="stockQuantity"
                    placeholder="Enter stock quantity"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none transition-all focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                  >
                    <option value="">Select Category</option>
                    {categories
                      .filter((category) => category.isActive)
                      .map((category) => (
                        <option
                          key={category.categoryId}
                          value={category.categoryId}
                        >
                          {category.categoryName}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Author */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Author
                  </label>
                  <select
                    name="authorId"
                    value={formData.authorId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none transition-all focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                  >
                    <option value="">Select Author</option>
                    {authors.map((author) => (
                      <option key={author.authorId} value={author.authorId}>
                        {author.authorName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Publisher */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Publisher
                  </label>
                  <select
                    name="publisherId"
                    value={formData.publisherId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none transition-all focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                  >
                    <option value="">Select Publisher</option>
                    {publishers
                      .filter((publisher) => publisher.isActive)
                      .map((publisher) => (
                        <option
                          key={publisher.publisherId}
                          value={publisher.publisherId}
                        >
                          {publisher.publisherName}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Description */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows="5"
                    placeholder="Enter book description..."
                    value={formData.description}
                    onChange={handleChange}
                    maxLength={2000}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 resize-none"
                  />
                  <div className="flex justify-end mt-1">
                    <span className="text-xs text-gray-400">
                      {formData.description?.length || 0}/2000
                    </span>
                  </div>
                </div>

                {/* Image */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Book Image
                  </label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-900 file:text-white file:text-sm file:font-medium hover:file:bg-gray-800 cursor-pointer"
                  />
                  {imagePreview && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-500 mb-2">
                        Image Preview
                      </p>

                      <div className="w-24 h-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                        <img
                          src={imagePreview}
                          alt="Book preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  {editMode && (
                    <p className="text-xs text-gray-400 mt-2">
                      Leave empty if you don't want to change the image.
                    </p>
                  )}
                </div>

                {/* Active Checkbox */}
                {editMode && (
                  <div className="lg:col-span-2">
                    <label className="inline-flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Active Book
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mt-7 pt-5 border-t border-gray-100">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-md"
                >
                  {editMode ? "Save Changes" : "Save Book"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Books List Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 sm:px-6 py-5 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-gray-900">All Books</h2>
              <p className="text-sm text-gray-500 mt-1">
                {books.length} book{books.length !== 1 ? "s" : ""} in your store
                (Click any row to view details)
              </p>
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left">
                <th className="w-16 px-6 py-4 font-semibold text-gray-500">
                  #
                </th>
                <th className="px-6 py-4 font-semibold text-gray-500">Book</th>
                <th className="w-32 px-6 py-4 font-semibold text-gray-500 text-right">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-16 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                      <span className="text-sm">Loading books...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && !error && books.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl mb-4">
                        📚
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        No books found
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Add your first book to get started.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                books.map((book, index) => (
                  <tr
                    key={book.bookId}
                    onClick={() => setModalBook(book)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 text-gray-400 font-medium align-middle">
                      {index + 1}
                    </td>

                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                          {book.imageUrl ? (
                            <img
                              src={book.imageUrl}
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">
                              📚
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors">
                            {book.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Click row for full details
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 align-middle text-right">
                      <span className="text-xs font-semibold text-gray-400 group-hover:text-gray-900 transition-colors">
                        View →
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Details Modal */}
      {modalBook && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Book Details
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Complete information for this book
                </p>
              </div>
              <button
                onClick={() => setModalBook(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Header info with image */}
              <div className="flex items-start gap-4 pb-5 border-b border-gray-100">
                <div className="w-20 h-28 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 shadow-sm">
                  {modalBook.imageUrl ? (
                    <img
                      src={modalBook.imageUrl}
                      alt={modalBook.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      📚
                    </div>
                  )}
                </div>
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div>
                    {modalBook.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        Inactive
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 leading-tight">
                    {modalBook.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Published Date:{" "}
                    {modalBook.publishedDate
                      ? new Date(modalBook.publishedDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Grid properties */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="block text-gray-400 text-xs font-medium mb-1">
                    ISBN
                  </span>
                  <span className="font-semibold text-gray-800">
                    {modalBook.isbn || "N/A"}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="block text-gray-400 text-xs font-medium mb-1">
                    Author
                  </span>
                  <span className="font-semibold text-gray-800">
                    {modalBook.authorName || "N/A"}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="block text-gray-400 text-xs font-medium mb-1">
                    Category
                  </span>
                  <span className="font-semibold text-gray-800">
                    {modalBook.categoryName || "N/A"}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="block text-gray-400 text-xs font-medium mb-1">
                    Publisher
                  </span>
                  <span className="font-semibold text-gray-800">
                    {modalBook.publisherName || "N/A"}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="block text-gray-400 text-xs font-medium mb-1">
                    Price
                  </span>
                  <span className="font-semibold text-emerald-600">
                    ₹{Number(modalBook.price).toFixed(2)}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="block text-gray-400 text-xs font-medium mb-1">
                    Stock
                  </span>
                  <span
                    className={`font-semibold ${modalBook.stockQuantity > 0 ? "text-gray-800" : "text-red-600"}`}
                  >
                    {modalBook.stockQuantity} units
                  </span>
                </div>
              </div>

              {/* Description */}
              {modalBook.description && (
                <div>
                  <span className="block text-gray-700 font-semibold mb-2 text-sm">
                    Description
                  </span>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-600 text-sm leading-relaxed max-h-40 overflow-y-auto">
                    {modalBook.description}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => {
                  const bookToEdit = modalBook;
                  setModalBook(null);
                  handleEdit(bookToEdit);
                }}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Edit Book
              </button>
              <button
                onClick={() => {
                  const bookId = modalBook.bookId;
                  setModalBook(null);
                  handleDelete(bookId);
                }}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Delete Book
              </button>
              <button
                onClick={() => setModalBook(null)}
                className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Books;
