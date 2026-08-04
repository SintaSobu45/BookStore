import React, { useEffect, useState } from 'react'
import { getAuthors, createAuthor, deleteAuthor, updateAuthor } from '../../services/authorService'

function Authors() {

    const [authors, setAuthors] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    //edit author
    const [editingAuthorId, setEditingAuthorId] = useState(null)
    const [editMode, setEditMode] = useState(false)

    const [showForm, setShowForm] = useState(false)

    const [formData, setFormData] = useState({
        authorName: '',
        biography: '',
        isActive: true
    })

    useEffect(() => {
        loadAuthors()
    }, [])

    const loadAuthors = async () => {
        try {
            setLoading(true)
            setError('')

            const data = await getAuthors()

            setAuthors(data)
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target

        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            setError('')

            if (editMode) {

                // Update existing author
                const authorData = {
                    authorName: formData.authorName,
                    biography: formData.biography || null,
                    isActive: formData.isActive
                }

                await updateAuthor(editingAuthorId, authorData)

            } else {

                // Create new author
                const authorData = {
                    authorName: formData.authorName,
                    biography: formData.biography || null
                }

                await createAuthor(authorData)
            }

            // Reset form
            setFormData({
                authorName: '',
                biography: '',
                isActive: true
            })

            setEditingAuthorId(null)
            setEditMode(false)
            setShowForm(false)

            // Reload authors
            await loadAuthors()

        } catch (error) {
            setError(error.message)
        }
    }

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this author?'
        )

        if (!confirmed) {
            return
        }

        try {
            setError('')

            await deleteAuthor(id)

            await loadAuthors()

        } catch (error) {
            setError(error.message)
        }
    }

    const handleEdit = (author) => {
        setEditingAuthorId(author.authorId)

        setFormData({
            authorName: author.authorName,
            biography: author.biography || '',
            isActive: author.isActive
        })

        setEditMode(true)
        setShowForm(true)
    }

    return (
        <div className="p-4">

            {/* Page Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>
                    <h2 className="fw-bold mb-1">
                        Authors
                    </h2>

                    <p className="text-muted mb-0">
                        Manage book authors
                    </p>
                </div>

                <button
                    className="btn btn-dark"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Close' : '+ Add Author'}
                </button>

            </div>

            {/* Add Author Form */}
            {showForm && (
                <div className="card border-0 shadow-sm mb-4">

                    <div className="card-body p-4">

                        <h5 className="fw-bold mb-4">
                            {editMode ? 'Edit Author' : 'Add New Author'}
                        </h5>

                        <form onSubmit={handleSubmit}>

                            {/* Author Name */}
                            <div className="mb-3">

                                <label className="form-label fw-semibold">
                                    Author Name
                                </label>

                                <input
                                    type="text"
                                    name="authorName"
                                    className="form-control"
                                    placeholder="Enter author name"
                                    value={formData.authorName}
                                    onChange={handleChange}
                                    maxLength={100}
                                    required
                                />

                            </div>

                            {/* Biography */}
                            <div className="mb-3">

                                <label className="form-label fw-semibold">
                                    Biography
                                </label>

                                <textarea
                                    name="biography"
                                    className="form-control"
                                    rows="4"
                                    placeholder="Enter author biography"
                                    value={formData.biography}
                                    onChange={handleChange}
                                    maxLength={500}
                                />

                                <div className="form-text">
                                    Maximum 500 characters
                                </div>

                            </div>

                            {/* Active */}
                            <div className="form-check mb-4">

                                <input
                                    type="checkbox"
                                    name="isActive"
                                    className="form-check-input"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                />

                                <label
                                    className="form-check-label"
                                    htmlFor="isActive"
                                >
                                    Active Author
                                </label>

                            </div>

                            {/* Buttons */}
                            <button
                                type="submit"
                                className="btn btn-dark"
                            >
                                {editMode ? 'Save Changes' : 'Save Author'}
                            </button>

                        </form>

                    </div>

                </div>
            )}

            {/* Authors Table */}
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
                                        Author Name
                                    </th>

                                    <th>
                                        Biography
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Created Date
                                    </th>

                                    <th className="text-end px-4">
                                        Actions
                                    </th>

                                </tr>
                            </thead>

                            <tbody>

                                {loading ? (

                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="text-center py-4"
                                        >
                                            Loading authors...
                                        </td>
                                    </tr>

                                ) : error ? (

                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="text-center text-danger py-4"
                                        >
                                            {error}
                                        </td>
                                    </tr>

                                ) : authors.length === 0 ? (

                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="text-center text-muted py-4"
                                        >
                                            No authors found.
                                        </td>
                                    </tr>

                                ) : (

                                    authors.map((author, index) => (

                                        <tr key={author.authorId}>

                                            <td className="px-4">
                                                {index + 1}
                                            </td>

                                            <td className="fw-semibold">
                                                {author.authorName}
                                            </td>

                                            <td>
                                                {author.biography || '-'}
                                            </td>

                                            <td>
                                                {author.isActive ? (
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
                                                {new Date(author.createdDate).toLocaleDateString()}
                                            </td>

                                            <td className="text-end px-4">

                                                <button
                                                    className="btn btn-sm btn-outline-primary me-2"
                                                    onClick={() => handleEdit(author)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(author.authorId)}
                                                >
                                                    Delete
                                                </button>

                                            </td>

                                        </tr>

                                    ))

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>
    )
}

export default Authors