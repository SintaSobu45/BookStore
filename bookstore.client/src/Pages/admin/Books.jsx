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
  // Form
  // =========================

  const [showForm, setShowForm] = useState(false);

  const [editMode, setEditMode] = useState(false);

  const [editingBookId, setEditingBookId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    isbn: "",
    price: "",
    stockQuantity: "",
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
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAuthors = async () => {
    try {
      const data = await getAuthors();

      setAuthors(data);
    } catch (error) {
      console.error("Failed to load authors:", error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getCategories();

      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const loadPublishers = async () => {
    try {
      const data = await getPublishers();

      setPublishers(data);
    } catch (error) {
      console.error("Failed to load publishers:", error);
    }
  };

  // =========================
  // Handle input
  // =========================

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      setFormData({
        ...formData,
        image: files[0] || null,
      });

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
      stockQuantity: "",
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

    setShowForm(false);
  };

  // =========================
  // Create / Update
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      // =========================
      // UPDATE
      // =========================

      if (editMode) {
        const updateData = new FormData();

        updateData.append("Title", formData.title);
        updateData.append("ISBN", formData.isbn || "");
        updateData.append("Price", formData.price);
        updateData.append("StockQuantity", formData.stockQuantity);
        updateData.append("PublishedDate", formData.publishedDate || "");
        updateData.append("Description", formData.description || "");
        updateData.append("CategoryId", formData.categoryId);
        updateData.append("AuthorId", formData.authorId);
        updateData.append("PublisherId", formData.publisherId);
        updateData.append("IsActive", formData.isActive);

        // Only send image if user selected a new one
        if (formData.image) {
          updateData.append("Image", formData.image);
        }

        await updateBook(editingBookId, updateData);

        setSuccess("Book updated successfully.");
      }

      // =========================
      // CREATE
      // =========================
      else {
        const bookData = new FormData();

        bookData.append("Title", formData.title);

        bookData.append("ISBN", formData.isbn);

        bookData.append("Price", formData.price);

        bookData.append("StockQuantity", formData.stockQuantity);

        if (formData.publishedDate) {
          bookData.append("PublishedDate", formData.publishedDate);
        }

        bookData.append("Description", formData.description);

        bookData.append("CategoryId", formData.categoryId);

        bookData.append("AuthorId", formData.authorId);

        bookData.append("PublisherId", formData.publisherId);

        if (formData.image) {
          bookData.append("Image", formData.image);
        }

        await createBook(bookData);

        setSuccess("Book added successfully.");
      }

      resetForm();

      await loadBooks();
    } catch (error) {
      setError(error.message);
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

      stockQuantity: book.stockQuantity ?? "",

      publishedDate: book.publishedDate ? book.publishedDate.split("T")[0] : "",

      description: book.description || "",

      categoryId: getIdValue(book.categoryId, categories, book.categoryName),

      authorId: getIdValue(book.authorId, authors, book.authorName),

      publisherId: getIdValue(book.publisherId, publishers, book.publisherName),

      isActive: book.isActive,

      image: null,
    });

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

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      setSuccess("");

      await deleteBook(id);

      setSuccess("Book deleted successfully.");

      await loadBooks();
    } catch (error) {
      setError(error.message);
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
      {/* =========================
            Header
        ========================= */}

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
              setShowForm(true);
            }
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
        >
          {showForm ? "Close" : "+ Add Book"}
        </button>
      </div>

      {/* =========================
            Messages
        ========================= */}

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

      {/* =========================
            Add / Edit Book Form
        ========================= */}

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Form Header */}

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

          {/* Form Body */}

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

                {/* Stock */}

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

                  {editMode && (
                    <p className="text-xs text-gray-400 mt-2">
                      Leave empty if you don't want to change the image.
                    </p>
                  )}
                </div>

                {/* Active */}

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

      {/* =========================
            Books List
        ========================= */}

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Table Header */}

        <div className="px-5 sm:px-6 py-5 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-gray-900">All Books</h2>

              <p className="text-sm text-gray-500 mt-1">
                {books.length} book{books.length !== 1 ? "s" : ""} in your store
              </p>
            </div>
          </div>
        </div>

        {/* Table */}

        <div className="w-full overflow-x-auto rounded-xl">
          <table className="w-full min-w-[1500px] text-sm">
            {/* ================= TABLE HEADER ================= */}

            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left">
                <th className="w-[60px] px-6 py-5 font-semibold text-gray-500">
                  #
                </th>

                <th className="w-[330px] px-6 py-5 font-semibold text-gray-500">
                  Book
                </th>

                <th className="w-[180px] px-6 py-5 font-semibold text-gray-500">
                  ISBN
                </th>

                <th className="w-[180px] px-6 py-5 font-semibold text-gray-500">
                  Author
                </th>

                <th className="w-[180px] px-6 py-5 font-semibold text-gray-500">
                  Category
                </th>

                <th className="w-[200px] px-6 py-5 font-semibold text-gray-500">
                  Publisher
                </th>

                <th className="w-[120px] px-6 py-5 font-semibold text-gray-500">
                  Price
                </th>

                <th className="w-[100px] px-6 py-5 font-semibold text-gray-500">
                  Stock
                </th>

                <th className="w-[130px] px-6 py-5 font-semibold text-gray-500">
                  Status
                </th>

                <th className="w-[180px] px-6 py-5 font-semibold text-gray-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            {/* ================= TABLE BODY ================= */}

            <tbody className="divide-y divide-gray-100">
              {/* Loading */}

              {loading && (
                <tr>
                  <td
                    colSpan="10"
                    className="px-6 py-16 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />

                      <span className="text-sm">Loading books...</span>
                    </div>
                  </td>
                </tr>
              )}

              {/* Empty */}

              {!loading && !error && books.length === 0 && (
                <tr>
                  <td colSpan="10" className="px-6 py-16 text-center">
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

              {/* ================= BOOKS ================= */}

              {!loading &&
                books.map((book, index) => (
                  <tr
                    key={book.bookId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Number */}

                    <td className="px-6 py-6 text-gray-400 font-medium align-middle">
                      {index + 1}
                    </td>

                    {/* ================= BOOK ================= */}

                    <td className="px-6 py-6 align-middle">
                      <div className="flex items-center gap-4">
                        {/* Image */}

                        <div className="w-16 h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                          {book.imageUrl ? (
                            <img
                              src={book.imageUrl}
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              📚
                            </div>
                          )}
                        </div>

                        {/* Book Information */}

                        <div className="min-w-0 w-[230px]">
                          <p className="font-semibold text-gray-900 leading-6 whitespace-normal break-words">
                            {book.title}
                          </p>

                          {book.publishedDate && (
                            <p className="text-xs text-gray-400 mt-2">
                              Published{" "}
                              {new Date(
                                book.publishedDate,
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* ================= ISBN ================= */}

                    <td className="px-6 py-6 align-middle">
                      <span className="text-gray-600 whitespace-nowrap">
                        {book.isbn || "-"}
                      </span>
                    </td>

                    {/* ================= AUTHOR ================= */}

                    <td className="px-6 py-6 align-middle">
                      <span className="text-gray-600 whitespace-normal break-words">
                        {book.authorName || "-"}
                      </span>
                    </td>

                    {/* ================= CATEGORY ================= */}

                    <td className="px-6 py-6 align-middle">
                      <span className="text-gray-600 whitespace-normal break-words">
                        {book.categoryName || "-"}
                      </span>
                    </td>

                    {/* ================= PUBLISHER ================= */}

                    <td className="px-6 py-6 align-middle">
                      <span className="text-gray-600 whitespace-normal break-words">
                        {book.publisherName || "-"}
                      </span>
                    </td>

                    {/* ================= PRICE ================= */}

                    <td className="px-6 py-6 align-middle">
                      <span className="font-semibold text-gray-900 whitespace-nowrap">
                        ₹{Number(book.price).toFixed(2)}
                      </span>
                    </td>

                    {/* ================= STOCK ================= */}

                    <td className="px-6 py-6 align-middle">
                      <span
                        className={`font-semibold ${
                          book.stockQuantity > 0
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {book.stockQuantity}
                      </span>
                    </td>

                    {/* ================= STATUS ================= */}

                    <td className="px-6 py-6 align-middle">
                      {book.isActive ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold whitespace-nowrap">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold whitespace-nowrap">
                          <span className="w-2 h-2 rounded-full bg-gray-400" />
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* ================= ACTIONS ================= */}

                    <td className="px-6 py-6 align-middle">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(book)}
                          className="
                                        px-4
                                        py-2
                                        text-xs
                                        font-semibold
                                        text-blue-700
                                        bg-blue-50
                                        hover:bg-blue-100
                                        rounded-lg
                                        transition
                                        duration-200
                                        whitespace-nowrap
                                    "
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(book.bookId)}
                          className="
                                        px-4
                                        py-2
                                        text-xs
                                        font-semibold
                                        text-red-700
                                        bg-red-50
                                        hover:bg-red-100
                                        rounded-lg
                                        transition
                                        duration-200
                                        whitespace-nowrap
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

        {/* Mobile Hint */}

        {!loading && books.length > 0 && (
          <div className="md:hidden px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 text-center">
            Swipe left and right to view all book details →
          </div>
        )}
      </div>
    </div>
  );
}

export default Books;
