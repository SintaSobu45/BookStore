import React, { useEffect, useState } from 'react'

import {
    getBooks,
    createBook,
    updateBook,
    deleteBook
} from '../../services/bookService'

import { getAuthors } from '../../services/authorService'

import { getCategories } from '../../services/categoryService'
import { getPublishers } from '../../services/publisherService'



function Books() {

    // =========================
    // Books
    // =========================

    const [books, setBooks] = useState([])

    const [loading, setLoading] = useState(true)

    const [error, setError] = useState('')

    const [success, setSuccess] = useState('')


    // =========================
    // Dropdown data
    // =========================

    const [authors, setAuthors] = useState([])

    const [categories, setCategories] = useState([])

    const [publishers, setPublishers] = useState([])


    // =========================
    // Form
    // =========================

    const [showForm, setShowForm] = useState(false)

    const [editMode, setEditMode] = useState(false)

    const [editingBookId, setEditingBookId] = useState(null)


    const [formData, setFormData] = useState({
        title: '',
        isbn: '',
        price: '',
        stockQuantity: '',
        publishedDate: '',
        description: '',
        categoryId: '',
        authorId: '',
        publisherId: '',
        isActive: true,
        image: null
    })


    // =========================
    // Load data
    // =========================

    useEffect(() => {
        loadBooks()
        loadAuthors()
        loadCategories()
        loadPublishers()
    }, [])


    const loadBooks = async () => {

        try {

            setLoading(true)
            setError('')

            const data = await getBooks()

            setBooks(data)

        } catch (error) {

            setError(error.message)

        } finally {

            setLoading(false)

        }
    }


    const loadAuthors = async () => {

        try {

            const data = await getAuthors()

            setAuthors(data)

        } catch (error) {

            console.error('Failed to load authors:', error)

        }
    }


    const loadCategories = async () => {

        try {

            const data = await getCategories()

            setCategories(data)

        } catch (error) {

            console.error('Failed to load categories:', error)

        }
    }


    const loadPublishers = async () => {

        try {

            const data = await getPublishers()

            setPublishers(data)

        } catch (error) {

            console.error('Failed to load publishers:', error)

        }
    }


    // =========================
    // Handle input
    // =========================

    const handleChange = (e) => {

        const {
            name,
            value,
            type,
            checked,
            files
        } = e.target


        if (type === 'file') {

            setFormData({
                ...formData,
                image: files[0] || null
            })

            return
        }


        setFormData({
            ...formData,
            [name]: type === 'checkbox'
                ? checked
                : value
        })
    }


    // =========================
    // Reset form
    // =========================

    const resetForm = () => {

        setFormData({
            title: '',
            isbn: '',
            price: '',
            stockQuantity: '',
            publishedDate: '',
            description: '',
            categoryId: '',
            authorId: '',
            publisherId: '',
            isActive: true,
            image: null
        })

        setEditingBookId(null)

        setEditMode(false)

        setShowForm(false)
    }


    // =========================
    // Create / Update
    // =========================

    const handleSubmit = async (e) => {

        e.preventDefault()

        setError('')
        setSuccess('')


        try {

            // =========================
            // UPDATE
            // =========================

            if (editMode) {

                const bookData = {

                    title: formData.title,

                    isbn: formData.isbn || null,

                    price: Number(formData.price),

                    stockQuantity: Number(formData.stockQuantity),

                    publishedDate:
                        formData.publishedDate
                            ? formData.publishedDate
                            : null,

                    description:
                        formData.description || null,

                    categoryId: Number(formData.categoryId),

                    authorId: Number(formData.authorId),

                    publisherId: Number(formData.publisherId),

                    isActive: formData.isActive

                }


                await updateBook(
                    editingBookId,
                    bookData
                )


                setSuccess(
                    'Book updated successfully.'
                )

            }

            // =========================
            // CREATE
            // =========================

            else {

                const bookData = new FormData()


                bookData.append(
                    'Title',
                    formData.title
                )

                bookData.append(
                    'ISBN',
                    formData.isbn
                )

                bookData.append(
                    'Price',
                    formData.price
                )

                bookData.append(
                    'StockQuantity',
                    formData.stockQuantity
                )


                if (formData.publishedDate) {

                    bookData.append(
                        'PublishedDate',
                        formData.publishedDate
                    )

                }


                bookData.append(
                    'Description',
                    formData.description
                )

                bookData.append(
                    'CategoryId',
                    formData.categoryId
                )

                bookData.append(
                    'AuthorId',
                    formData.authorId
                )

                bookData.append(
                    'PublisherId',
                    formData.publisherId
                )


                if (formData.image) {

                    bookData.append(
                        'Image',
                        formData.image
                    )

                }


                await createBook(bookData)


                setSuccess(
                    'Book added successfully.'
                )

            }


            resetForm()

            await loadBooks()


        } catch (error) {

            setError(error.message)

        }

    }


    // =========================
    // Edit
    // =========================

    const handleEdit = (book) => {

        setEditingBookId(book.bookId)

        setFormData({

            title: book.title || '',

            isbn: book.isbn || '',

            price: book.price ?? '',

            stockQuantity:
                book.stockQuantity ?? '',

            publishedDate:
                book.publishedDate
                    ? book.publishedDate.split('T')[0]
                    : '',

            description:
                book.description || '',

            categoryId:
                getIdValue(
                    book.categoryId,
                    categories,
                    book.categoryName
                ),

            authorId:
                getIdValue(
                    book.authorId,
                    authors,
                    book.authorName
                ),

            publisherId:
                getIdValue(
                    book.publisherId,
                    publishers,
                    book.publisherName
                ),

            isActive:
                book.isActive,

            image: null

        })

        setEditMode(true)

        setShowForm(true)

        setError('')

        setSuccess('')

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }


    // =========================
    // Delete
    // =========================

    const handleDelete = async (id) => {

        const confirmed = window.confirm(
            'Are you sure you want to delete this book?'
        )


        if (!confirmed) {
            return
        }


        try {

            setError('')

            setSuccess('')

            await deleteBook(id)

            setSuccess(
                'Book deleted successfully.'
            )

            await loadBooks()

        } catch (error) {

            setError(error.message)

        }

    }


    // =========================
    // Helper
    // =========================

    const getIdValue = (
        directId,
        list,
        name
    ) => {

        if (directId !== undefined && directId !== null) {
            return directId
        }


        const item = list.find(
            (x) =>
                x.name === name ||
                x.authorName === name ||
                x.categoryName === name ||
                x.publisherName === name
        )


        if (!item) {
            return ''
        }


        return (
            item.id ||
            item.authorId ||
            item.categoryId ||
            item.publisherId
        )
    }


    // =========================
    // UI
    // =========================

    return (

        <div className="p-4">


            {/* =========================
          Header
      ========================= */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h2 className="fw-bold mb-1">
                        Books
                    </h2>

                    <p className="text-muted mb-0">
                        Manage books in your bookstore
                    </p>

                </div>


                <button
                    className="btn btn-dark"
                    onClick={() => {

                        if (showForm) {

                            resetForm()

                        } else {

                            setEditMode(false)

                            setEditingBookId(null)

                            setShowForm(true)

                        }

                    }}
                >

                    {showForm
                        ? 'Close'
                        : '+ Add Book'
                    }

                </button>

            </div>


            {/* =========================
          Messages
      ========================= */}

            {error && (

                <div
                    className="alert alert-danger"
                    role="alert"
                >
                    {error}
                </div>

            )}


            {success && (

                <div
                    className="alert alert-success"
                    role="alert"
                >
                    {success}
                </div>

            )}


            {/* =========================
          Book Form
      ========================= */}

            {showForm && (

                <div className="card border-0 shadow-sm mb-4">

                    <div className="card-body p-4">

                        <h5 className="fw-bold mb-4">

                            {editMode
                                ? 'Edit Book'
                                : 'Add New Book'
                            }

                        </h5>


                        <form onSubmit={handleSubmit}>


                            {/* Title */}

                            <div className="mb-3">

                                <label className="form-label fw-semibold">
                                    Book Title
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    className="form-control"
                                    placeholder="Enter book title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    maxLength={200}
                                    required
                                />

                            </div>


                            {/* ISBN */}

                            <div className="mb-3">

                                <label className="form-label fw-semibold">
                                    ISBN
                                </label>

                                <input
                                    type="text"
                                    name="isbn"
                                    className="form-control"
                                    placeholder="Enter ISBN"
                                    value={formData.isbn}
                                    onChange={handleChange}
                                    maxLength={20}
                                />

                            </div>


                            <div className="row">


                                {/* Price */}

                                <div className="col-md-6 mb-3">

                                    <label className="form-label fw-semibold">
                                        Price
                                    </label>

                                    <input
                                        type="number"
                                        name="price"
                                        className="form-control"
                                        placeholder="Enter price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        required
                                    />

                                </div>


                                {/* Stock */}

                                <div className="col-md-6 mb-3">

                                    <label className="form-label fw-semibold">
                                        Stock Quantity
                                    </label>

                                    <input
                                        type="number"
                                        name="stockQuantity"
                                        className="form-control"
                                        placeholder="Enter stock quantity"
                                        value={formData.stockQuantity}
                                        onChange={handleChange}
                                        min="0"
                                        required
                                    />

                                </div>

                            </div>


                            {/* Published Date */}

                            <div className="mb-3">

                                <label className="form-label fw-semibold">
                                    Published Date
                                </label>

                                <input
                                    type="date"
                                    name="publishedDate"
                                    className="form-control"
                                    value={formData.publishedDate}
                                    onChange={handleChange}
                                />

                            </div>


                            {/* Category */}

                            <div className="mb-3">

                                <label className="form-label fw-semibold">
                                    Category
                                </label>

                                <select
                                    name="categoryId"
                                    className="form-select"
                                    value={formData.categoryId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        Select Category
                                    </option>

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

                            <div className="mb-3">

                                <label className="form-label fw-semibold">
                                    Author
                                </label>

                                <select
                                    name="authorId"
                                    className="form-select"
                                    value={formData.authorId}
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">
                                        Select Author
                                    </option>

                                    {authors.map((author) => (

                                        <option
                                            key={author.authorId}
                                            value={author.authorId}
                                        >

                                            {author.authorName}

                                        </option>

                                    ))}

                                </select>

                            </div>


                            {/* Publisher */}

                            <div className="mb-3">

                                <label className="form-label fw-semibold">
                                    Publisher
                                </label>

                                <select
                                    name="publisherId"
                                    className="form-select"
                                    value={formData.publisherId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        Select Publisher
                                    </option>

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

                            <div className="mb-3">

                                <label className="form-label fw-semibold">
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    className="form-control"
                                    rows="4"
                                    placeholder="Enter book description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    maxLength={2000}
                                />

                                <div className="form-text">
                                    Maximum 2000 characters
                                </div>

                            </div>


                            {/* Image */}

                            {!editMode && (

                                <div className="mb-3">

                                    <label className="form-label fw-semibold">
                                        Book Image
                                    </label>

                                    <input
                                        type="file"
                                        name="image"
                                        className="form-control"
                                        accept="image/*"
                                        onChange={handleChange}
                                    />

                                    <div className="form-text">
                                        Select an image for the book.
                                    </div>

                                </div>

                            )}


                            {/* Active */}

                            {editMode && (

                                <div className="form-check mb-4">

                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        className="form-check-input"
                                        id="bookIsActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                    />

                                    <label
                                        className="form-check-label"
                                        htmlFor="bookIsActive"
                                    >
                                        Active Book
                                    </label>

                                </div>

                            )}


                            {/* Buttons */}

                            <div className="d-flex gap-2">

                                <button
                                    type="submit"
                                    className="btn btn-dark"
                                >

                                    {editMode
                                        ? 'Save Changes'
                                        : 'Save Book'
                                    }

                                </button>


                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =========================
          Books Table
      ========================= */}

            <div className="card border-0 shadow-sm">

                <div className="card-body p-0">

                    <div className="table-responsive">

                        <table className="table table-hover align-middle mb-0">

                            <thead className="table-light">

                                <tr>

                                    <th className="px-4">
                                        #
                                    </th>

                                    <th>
                                        Book
                                    </th>

                                    <th>
                                        ISBN
                                    </th>

                                    <th>
                                        Author
                                    </th>

                                    <th>
                                        Category
                                    </th>

                                    <th>
                                        Publisher
                                    </th>

                                    <th>
                                        Price
                                    </th>

                                    <th>
                                        Stock
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th className="text-end px-4">
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>


                                {/* Loading */}

                                {loading && (

                                    <tr>

                                        <td
                                            colSpan="10"
                                            className="text-center py-4"
                                        >
                                            Loading books...
                                        </td>

                                    </tr>

                                )}


                                {/* Empty */}

                                {!loading &&
                                    !error &&
                                    books.length === 0 && (

                                        <tr>

                                            <td
                                                colSpan="10"
                                                className="text-center text-muted py-4"
                                            >
                                                No books found.
                                            </td>

                                        </tr>

                                    )}


                                {/* Books */}

                                {!loading &&
                                    books.map((book, index) => (

                                        <tr
                                            key={book.bookId}
                                        >


                                            {/* Number */}

                                            <td className="px-4">
                                                {index + 1}
                                            </td>


                                            {/* Book */}

                                            <td>

                                                <div className="d-flex align-items-center gap-2">

                                                    {book.imageUrl ? (

                                                        <img
                                                            src={book.imageUrl}
                                                            alt={book.title}
                                                            width="45"
                                                            height="60"
                                                            className="rounded"
                                                            style={{
                                                                objectFit: 'cover'
                                                            }}
                                                        />

                                                    ) : (

                                                        <div
                                                            className="bg-light border rounded d-flex align-items-center justify-content-center"
                                                            style={{
                                                                width: '45px',
                                                                height: '60px'
                                                            }}
                                                        >
                                                            📚
                                                        </div>

                                                    )}


                                                    <div>

                                                        <div className="fw-semibold">
                                                            {book.title}
                                                        </div>

                                                        {book.publishedDate && (

                                                            <small className="text-muted">

                                                                {new Date(
                                                                    book.publishedDate
                                                                ).toLocaleDateString()}

                                                            </small>

                                                        )}

                                                    </div>

                                                </div>

                                            </td>


                                            {/* ISBN */}

                                            <td>
                                                {book.isbn || '-'}
                                            </td>


                                            {/* Author */}

                                            <td>
                                                {book.authorName || '-'}
                                            </td>


                                            {/* Category */}

                                            <td>
                                                {book.categoryName || '-'}
                                            </td>


                                            {/* Publisher */}

                                            <td>
                                                {book.publisherName || '-'}
                                            </td>


                                            {/* Price */}

                                            <td className="fw-semibold">
                                                ₹{Number(book.price).toFixed(2)}
                                            </td>


                                            {/* Stock */}

                                            <td>

                                                <span
                                                    className={
                                                        book.stockQuantity > 0
                                                            ? 'text-success'
                                                            : 'text-danger'
                                                    }
                                                >

                                                    {book.stockQuantity}

                                                </span>

                                            </td>


                                            {/* Status */}

                                            <td>

                                                {book.isActive ? (

                                                    <span className="badge bg-success">
                                                        Active
                                                    </span>

                                                ) : (

                                                    <span className="badge bg-secondary">
                                                        Inactive
                                                    </span>

                                                )}

                                            </td>


                                            {/* Actions */}

                                            <td className="text-end px-4">

                                                <button
                                                    className="btn btn-sm btn-outline-primary me-2"
                                                    onClick={() =>
                                                        handleEdit(book)
                                                    }
                                                >
                                                    Edit
                                                </button>


                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() =>
                                                        handleDelete(
                                                            book.bookId
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </td>

                                        </tr>

                                    ))}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>
    )
}

export default Books